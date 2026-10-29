import type { ChargeLine, Paise, SlabLine, TariffCalculationResult, TariffInput, TariffRecord } from './types';
import { validateTariffInput } from './validation';

const ZERO = BigInt(0);
const TWO = BigInt(2);
const PAISA_PER_RUPEE = BigInt(100);
const MILLI_KVA = BigInt(1000);
const THIRTY = BigInt(30);
const TEN_THOUSAND = BigInt(10_000);

/** Positive integer division rounded half up. */
function divideHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator / TWO) / denominator;
}

function money(value: number): Paise { return BigInt(value); }

function calculateSlabs(tariff: TariffRecord, consumptionKwh: number): SlabLine[] {
  let remaining = consumptionKwh;
  let lower = 0;
  if (tariff.slabMethod === 'single-applicable-rate') {
    const applicable = tariff.slabs.find((slab) => slab.upToKwh == null || consumptionKwh <= slab.upToKwh);
    if (!applicable) return [];
    return [{ label: applicable.label || `All ${consumptionKwh} kWh`, unitsKwh: consumptionKwh, ratePaisePerKwh: applicable.ratePaisePerKwh, amountPaise: BigInt(consumptionKwh) * money(applicable.ratePaisePerKwh) }];
  }
  return tariff.slabs.flatMap((slab) => {
    const width = slab.upToKwh == null ? remaining : Math.max(0, Math.min(remaining, slab.upToKwh - lower));
    if (slab.upToKwh != null) lower = slab.upToKwh;
    remaining -= width;
    return width > 0 ? [{ label: slab.label || (slab.upToKwh == null ? `Above ${lower} kWh` : `Up to ${slab.upToKwh} kWh`), unitsKwh: width, ratePaisePerKwh: slab.ratePaisePerKwh, amountPaise: BigInt(width) * money(slab.ratePaisePerKwh) }] : [];
  });
}

function calculateFixedCharge(charge: NonNullable<TariffRecord['fixedCharge']>, input: TariffInput): Paise {
  if (charge.basis === 'flat-per-billing-period') return money(charge.paise);
  if (charge.basis === 'per-day') return money(charge.paise) * BigInt(input.billingDays);
  const load = BigInt(charge.basis === 'per-kw-per-billing-period' ? input.sanctionedLoadMilliKw || 0 : input.sanctionedLoadMilliKva || 0);
  const base = money(charge.paise) * load;
  if (charge.basis === 'per-kva-per-30-days') return divideHalfUp(base * BigInt(input.billingDays), MILLI_KVA * THIRTY);
  return divideHalfUp(base, MILLI_KVA);
}

function applicableConsumptionCharge(charges: NonNullable<TariffRecord['customerCharges']>, consumptionKwh: number): NonNullable<TariffRecord['customerCharges']>[number] | undefined {
  return charges.find((charge) => charge.upToKwh == null || consumptionKwh <= charge.upToKwh);
}

function subsidyApplies(input: TariffInput, subsidy: NonNullable<TariffRecord['subsidies']>[number]) {
  return (subsidy.maxConsumptionKwh == null || input.consumptionKwh <= subsidy.maxConsumptionKwh)
    && (subsidy.maxSanctionedLoadMilliKva == null || (input.sanctionedLoadMilliKva || 0) <= subsidy.maxSanctionedLoadMilliKva);
}

/**
 * Pure tariff calculation. All output money values are bigint paise; format them only at the UI boundary.
 * Components lacking a verified input or rate are returned as unknown, never silently estimated.
 */
export function calculateTariffBill(tariff: TariffRecord | undefined, input: TariffInput): TariffCalculationResult {
  if (!tariff) return { ok: false, errors: ['No tariff is available for this State, DISCOM and category.'] };
  const errors = validateTariffInput(tariff, input);
  if (errors.length) return { ok: false, errors };

  const slabLines = calculateSlabs(tariff, input.consumptionKwh);
  const energy = slabLines.reduce((sum, line) => sum + line.amountPaise, ZERO);
  const chargeLines: ChargeLine[] = [{ id: 'energy', label: 'Energy charges', amountPaise: energy, status: 'included', basis: `${tariff.slabMethod === 'cumulative' ? 'Cumulative' : 'Single-rate'} slabs shown above` }];
  const values: Record<string, Paise> = { energy };

  for (const [id, charge, label] of [['fixed', tariff.fixedCharge, 'Fixed charges'], ['demand', tariff.demandCharge, 'Demand charges']] as const) {
    if (!charge) continue;
    const amount = calculateFixedCharge(charge, input);
    values[id] = amount;
    chargeLines.push({ id, label, amountPaise: amount, status: 'included', basis: charge.label });
  }

  if (tariff.customerCharges) {
    const customerCharge = applicableConsumptionCharge(tariff.customerCharges, input.consumptionKwh);
    if (customerCharge) {
      const amount = money(customerCharge.paise);
      values.customer = amount;
      chargeLines.push({ id: 'customer', label: 'Customer charges', amountPaise: amount, status: 'included', basis: customerCharge.label || 'Applicable monthly customer-charge band' });
    }
  }

  if (tariff.meterRent) {
    if (input.meterPhase && tariff.meterRent.byPhasePaise[input.meterPhase] != null) {
      const amount = money(tariff.meterRent.byPhasePaise[input.meterPhase] || 0);
      values['meter-rent'] = amount;
      chargeLines.push({ id: 'meter-rent', label: 'Meter rent', amountPaise: amount, status: 'included', basis: `${tariff.meterRent.label}; ${input.meterPhase}-phase meter` });
    } else chargeLines.push({ id: 'meter-rent', label: 'Meter rent', amountPaise: null, status: 'depends-on-input', basis: 'Select the meter phase to include this charge.' });
  }

  if (tariff.fuelAdjustment) {
    const amount = tariff.fuelAdjustment.basis === 'per-kwh'
      ? BigInt(input.consumptionKwh) * money(tariff.fuelAdjustment.paisePerKwh || 0)
      : divideHalfUp(energy * BigInt(tariff.fuelAdjustment.basisPoints || 0), TEN_THOUSAND);
    values.fac = amount;
    chargeLines.push({ id: 'fac', label: 'Fuel / power adjustment', amountPaise: amount, status: 'included', basis: tariff.fuelAdjustment.label });
  }

  for (const [index, tax] of (tariff.taxes || []).entries()) {
    const base = tax.appliesTo.reduce((sum, part) => sum + (values[part] || ZERO), ZERO);
    const amount = divideHalfUp(base * BigInt(tax.basisPoints), TEN_THOUSAND);
    values[`tax-${index}`] = amount;
    chargeLines.push({ id: `tax-${index}`, label: tax.label, amountPaise: amount, status: 'included', basis: `${(tax.basisPoints / 100).toFixed(2)}% of ${tax.appliesTo.join(', ')} charges` });
  }

  let subsidyTotal = ZERO;
  for (const subsidy of tariff.subsidies || []) {
    if (!subsidyApplies(input, subsidy)) {
      chargeLines.push({ id: `subsidy-${subsidy.id}`, label: subsidy.label, amountPaise: ZERO, status: 'excluded', basis: 'Eligibility conditions are not met.' });
      continue;
    }
    const amount = BigInt(input.consumptionKwh) * money(subsidy.perKwhPaise || 0) + money(subsidy.flatPaise || 0);
    subsidyTotal += amount;
    chargeLines.push({ id: `subsidy-${subsidy.id}`, label: subsidy.label, amountPaise: -amount, status: 'included', basis: 'Eligibility conditions are met.' });
  }

  const includedBeforeMinimum = chargeLines.reduce((sum, line) => sum + (line.amountPaise || ZERO), ZERO);
  const minimumAdjustment = tariff.minimumCharge && includedBeforeMinimum < money(tariff.minimumCharge.paise)
    ? money(tariff.minimumCharge.paise) - includedBeforeMinimum : ZERO;
  if (tariff.minimumCharge) chargeLines.push({ id: 'minimum', label: 'Minimum-charge adjustment', amountPaise: minimumAdjustment, status: minimumAdjustment ? 'included' : 'excluded', basis: tariff.minimumCharge.label });

  for (const [index, note] of tariff.excludedChargeNotes.entries()) chargeLines.push({ id: `unknown-${index}`, label: 'Not included in estimate', amountPaise: null, status: 'unknown', basis: note });
  const warnings = [...tariff.excludedChargeNotes];
  if (tariff.verification === 'source-linked') warnings.unshift('This is a source-linked estimate. Its official source is linked below, but BijliBudget has not independently normalised every tariff condition or effective-date rule.');
  if (tariff.fixedCharge?.basis === 'per-kva-per-billing-period' && input.billingDays !== tariff.standardBillingDays) warnings.push(`Fixed charge is a billing-period amount and has not been prorated for ${input.billingDays} days.`);

  return { ok: true, value: { tariff, input, slabLines, chargeLines, subtotalPaise: includedBeforeMinimum, totalSubsidyPaise: subsidyTotal, minimumChargeAdjustmentPaise: minimumAdjustment, estimatedPayablePaise: includedBeforeMinimum + minimumAdjustment, warnings } };
}

export function formatPaise(value: Paise): string {
  const sign = value < ZERO ? '-' : '';
  const absolute = value < ZERO ? -value : value;
  return `${sign}₹${(absolute / PAISA_PER_RUPEE).toString()}.${(absolute % PAISA_PER_RUPEE).toString().padStart(2, '0')}`;
}

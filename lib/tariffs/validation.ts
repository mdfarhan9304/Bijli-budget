import type { TariffInput, TariffRecord } from './types';

export function tariffAppliesOn(tariff: TariffRecord, date: string): boolean {
  return (!tariff.effectiveFrom || date >= tariff.effectiveFrom) && (!tariff.effectiveTo || date <= tariff.effectiveTo);
}

export function validateTariffInput(tariff: TariffRecord, input: TariffInput): string[] {
  const errors: string[] = [];
  if (tariff.verification === 'unavailable' || tariff.verification === 'fixture') errors.push('This tariff is not available for an estimate.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.asOfDate)) errors.push('Enter the bill date in YYYY-MM-DD format.');
  else if (!tariffAppliesOn(tariff, input.asOfDate)) errors.push(`This tariff is not applicable on ${input.asOfDate}.`);
  if (!Number.isInteger(input.consumptionKwh) || input.consumptionKwh < 0) errors.push('Consumption must be a whole number of kWh at or above zero.');
  if (!Number.isInteger(input.billingDays) || input.billingDays < 1 || input.billingDays > 366) errors.push('Billing days must be a whole number from 1 to 366.');
  const load = input.sanctionedLoadMilliKva;
  if (tariff.fixedCharge?.requiresSanctionedLoad && (!Number.isInteger(load) || load == null || load <= 0)) errors.push('Enter the sanctioned load shown on the bill.');
  const loadKw = input.sanctionedLoadMilliKw;
  if (tariff.fixedCharge?.requiresSanctionedLoadKw && (!Number.isInteger(loadKw) || loadKw == null || loadKw <= 0)) errors.push('Enter the sanctioned load in kW shown on the bill.');
  if (tariff.fixedCharge?.maximumSanctionedLoadMilliKw != null && (loadKw || 0) > tariff.fixedCharge.maximumSanctionedLoadMilliKw) errors.push('This tariff record does not support the selected sanctioned load; the official fixed-charge rule changes above that limit.');
  if (input.sanctionedLoadMilliKva != null && (input.sanctionedLoadMilliKva < 0 || input.sanctionedLoadMilliKva > 10_000_000)) errors.push('Sanctioned load is outside the supported range.');
  if (input.sanctionedLoadMilliKw != null && (input.sanctionedLoadMilliKw < 0 || input.sanctionedLoadMilliKw > 10_000_000)) errors.push('Sanctioned load is outside the supported range.');
  return errors;
}

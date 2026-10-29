import { describe, expect, it } from 'vitest';
import { calculateTariffBill, formatPaise } from '../../lib/tariffs/calculator';
import { tariffAppliesOn } from '../../lib/tariffs/validation';
import type { TariffRecord } from '../../lib/tariffs/types';

const fixture: TariffRecord = {
  id: 'fixture-domestic', version: 1, verification: 'verified', stateId: 'fixture', stateName: 'Fixture State', discomId: 'fixture-discom', discomName: 'Fixture DISCOM', categoryId: 'domestic', categoryName: 'Domestic', consumerSubgroup: 'Test only', effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', billingUnit: 'monthly-kwh', standardBillingDays: 30, slabMethod: 'cumulative',
  slabs: [{ upToKwh: 100, ratePaisePerKwh: 100 }, { upToKwh: 200, ratePaisePerKwh: 200 }, { ratePaisePerKwh: 300 }],
  fixedCharge: { basis: 'per-kva-per-30-days', paise: 1000, requiresSanctionedLoad: true, label: '₹10/KVA/30 days' },
  demandCharge: { basis: 'flat-per-billing-period', paise: 5000, label: '₹50 demand charge' },
  meterRent: { byPhasePaise: { single: 250 }, label: '₹2.50 single-phase meter rent' },
  fuelAdjustment: { basis: 'per-kwh', paisePerKwh: 10, label: '₹0.10/kWh FAC' },
  taxes: [{ basisPoints: 500, appliesTo: ['energy', 'fixed', 'demand', 'fac', 'meter-rent'], label: '5% duty' }],
  subsidies: [{ id: 'low-use', label: 'Low-use subsidy', maxConsumptionKwh: 50, perKwhPaise: 20 }],
  minimumCharge: { paise: 20000, label: '₹200 minimum charge' },
  rounding: 'half-up-to-paise', source: { url: 'https://example.test/tariff', title: 'Test fixture', reference: 'Not an official tariff', verifiedOn: '2026-01-01' }, excludedChargeNotes: [],
};

function estimate(consumptionKwh: number, overrides: Partial<Parameters<typeof calculateTariffBill>[1]> = {}) {
  const result = calculateTariffBill(fixture, { asOfDate: '2026-06-01', consumptionKwh, billingDays: 30, sanctionedLoadMilliKva: 1500, meterPhase: 'single', ...overrides });
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.errors.join(', '));
  return result.value;
}

describe('tariff calculator', () => {
  it('calculates usage below the first slab and applies an eligible subsidy', () => {
    const result = estimate(20);
    expect(result.slabLines[0].amountPaise).toBe(2000n);
    expect(result.totalSubsidyPaise).toBe(400n);
    expect(result.chargeLines.find((line) => line.id === 'subsidy-low-use')?.amountPaise).toBe(-400n);
  });

  it('handles a consumption value exactly at a slab boundary', () => {
    const result = estimate(100);
    expect(result.slabLines).toHaveLength(1);
    expect(result.slabLines[0].amountPaise).toBe(10000n);
  });

  it('calculates cumulative slabs independently when consumption crosses multiple boundaries', () => {
    const result = estimate(250);
    expect(result.slabLines.map((line) => line.amountPaise)).toEqual([10000n, 20000n, 15000n]);
    expect(result.chargeLines.find((line) => line.id === 'fac')?.amountPaise).toBe(2500n);
    expect(result.estimatedPayablePaise).toBe(56963n);
  });

  it('handles zero consumption without floating-point money', () => {
    const result = estimate(0);
    expect(result.slabLines).toEqual([]);
    expect(formatPaise(result.estimatedPayablePaise)).toBe('₹200.00');
  });

  it('prorates load-based fixed charges by billing days using half-up paise rounding', () => {
    const result = estimate(100, { billingDays: 15, sanctionedLoadMilliKva: 1555 });
    expect(result.chargeLines.find((line) => line.id === 'fixed')?.amountPaise).toBe(778n);
  });

  it('marks meter rent as dependent when phase is unavailable', () => {
    const result = estimate(100, { meterPhase: undefined });
    const meter = result.chargeLines.find((line) => line.id === 'meter-rent');
    expect(meter?.status).toBe('depends-on-input');
    expect(meter?.amountPaise).toBeNull();
  });

  it('does not apply subsidy when eligibility is not met', () => {
    const result = estimate(51);
    expect(result.totalSubsidyPaise).toBe(0n);
    expect(result.chargeLines.find((line) => line.id === 'subsidy-low-use')?.status).toBe('excluded');
  });

  it('uses the documented tax base after FAC and other included components', () => {
    const result = estimate(250);
    expect(result.chargeLines.find((line) => line.id === 'tax-0')?.amountPaise).toBe(2713n);
  });

  it('raises a bill to a tariff minimum charge when otherwise eligible charges fall below it', () => {
    const minimumOnly = { ...fixture, fixedCharge: undefined, demandCharge: undefined, meterRent: undefined, fuelAdjustment: undefined, taxes: undefined, subsidies: undefined };
    const result = calculateTariffBill(minimumOnly, { asOfDate: '2026-06-01', consumptionKwh: 1, billingDays: 30 });
    expect(result.ok && result.value.minimumChargeAdjustmentPaise).toBe(19900n);
    expect(result.ok && result.value.estimatedPayablePaise).toBe(20000n);
  });

  it('supports a single applicable slab separately from cumulative slabs', () => {
    const single = { ...fixture, slabMethod: 'single-applicable-rate' as const, slabs: [{ upToKwh: 100, ratePaisePerKwh: 100 }, { ratePaisePerKwh: 300 }], fixedCharge: undefined, demandCharge: undefined, meterRent: undefined, fuelAdjustment: undefined, taxes: undefined, subsidies: undefined, minimumCharge: undefined };
    const result = calculateTariffBill(single, { asOfDate: '2026-06-01', consumptionKwh: 101, billingDays: 30 });
    expect(result.ok && result.value.slabLines[0].amountPaise).toBe(30300n);
  });

  it('rejects invalid inputs, unverified records and unavailable tariff data', () => {
    expect(calculateTariffBill(fixture, { asOfDate: '2026-06-01', consumptionKwh: 1.5, billingDays: 30, sanctionedLoadMilliKva: 1000 }).ok).toBe(false);
    expect(calculateTariffBill({ ...fixture, verification: 'unavailable' }, { asOfDate: '2026-06-01', consumptionKwh: 1, billingDays: 30, sanctionedLoadMilliKva: 1000 }).ok).toBe(false);
    expect(calculateTariffBill(undefined, { asOfDate: '2026-06-01', consumptionKwh: 1, billingDays: 30 }).ok).toBe(false);
  });

  it('rejects a tariff outside its effective dates', () => {
    expect(calculateTariffBill(fixture, { asOfDate: '2027-01-01', consumptionKwh: 1, billingDays: 30, sanctionedLoadMilliKva: 1000 }).ok).toBe(false);
  });

  it('checks tariff effective-date applicability', () => {
    expect(tariffAppliesOn(fixture, '2026-06-01')).toBe(true);
    expect(tariffAppliesOn(fixture, '2025-12-31')).toBe(false);
    expect(tariffAppliesOn(fixture, '2027-01-01')).toBe(false);
  });
});

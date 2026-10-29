import { describe, expect, it } from 'vitest';
import { cescKolkataDomestic, wbsedclDomesticUnavailable } from '../../data/tariffs/west-bengal';
import { calculateTariffBill } from '../../lib/tariffs/calculator';

describe('West Bengal tariff records', () => {
  it('calculates CESC’s official 2025–26 Rate G energy schedule', () => {
    const result = calculateTariffBill(cescKolkataDomestic, { asOfDate: '2026-10-29', consumptionKwh: 376, billingDays: 30, sanctionedLoadMilliKva: 2700, meterPhase: 'single' });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.errors.join(', '));
    expect(result.value.slabLines.map((line) => line.amountPaise)).toEqual([12950n, 19915n, 26800n, 37250n, 38100n, 76200n, 69996n]);
    expect(result.value.chargeLines.find((line) => line.id === 'energy')?.amountPaise).toBe(281211n);
    expect(result.value.chargeLines.find((line) => line.id === 'fixed')?.amountPaise).toBe(4050n);
    expect(result.value.chargeLines.find((line) => line.id === 'meter-rent')).toBeUndefined();
    expect(result.value.estimatedPayablePaise).toBe(285261n);
  });

  it('does not present the source-only WBSEDCL record as an estimate', () => {
    const result = calculateTariffBill(wbsedclDomesticUnavailable, { asOfDate: '2026-10-29', consumptionKwh: 100, billingDays: 30 });
    expect(result.ok).toBe(false);
  });
});

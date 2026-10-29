import { describe, expect, it } from 'vitest';
import { andhraPradeshTariffs } from '../../data/tariffs/andhra-pradesh';
import { calculateTariffBill } from '../../lib/tariffs/calculator';

describe('Andhra Pradesh domestic tariff records', () => {
  it('applies APERC FY 2026–27 domestic slabs, kW fixed charges and customer charge', () => {
    const tariff = andhraPradeshTariffs[0];
    const result = calculateTariffBill(tariff, {
      asOfDate: '2026-10-29',
      consumptionKwh: 100,
      billingDays: 30,
      sanctionedLoadMilliKw: 2500,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.errors.join(', '));
    expect(result.value.slabLines.map((line) => line.amountPaise)).toEqual([5700n, 13500n, 11250n]);
    expect(result.value.chargeLines.find((line) => line.id === 'fixed')?.amountPaise).toBe(2500n);
    expect(result.value.chargeLines.find((line) => line.id === 'customer')?.amountPaise).toBe(4500n);
    expect(result.value.estimatedPayablePaise).toBe(37450n);
  });

  it('requires sanctioned load in kW and rejects dates outside the order period', () => {
    const tariff = andhraPradeshTariffs[1];
    expect(calculateTariffBill(tariff, { asOfDate: '2026-10-29', consumptionKwh: 30, billingDays: 30 }).ok).toBe(false);
    expect(calculateTariffBill(tariff, { asOfDate: '2027-04-01', consumptionKwh: 30, billingDays: 30, sanctionedLoadMilliKw: 1000 }).ok).toBe(false);
    expect(calculateTariffBill(tariff, { asOfDate: '2026-10-29', consumptionKwh: 30, billingDays: 30, sanctionedLoadMilliKw: 76000 }).ok).toBe(false);
  });
});

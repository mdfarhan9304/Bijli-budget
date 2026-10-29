import { describe, expect, it } from 'vitest';
import { estimateAppliance, estimateBillTotals, type Appliance } from '../lib/calculations';

const ac: Appliance = {
  id: 'ac', name: 'AC', watts: 1200, quantity: 1, hoursPerDay: 5,
  daysPerMonth: 30, reduceHoursPerDay: 1, replacementWatts: 900, replacementCost: 30000,
};

describe('estimateAppliance', () => {
  it('calculates monthly kWh and estimated cost', () => {
    const result = estimateAppliance(ac, 8);
    expect(result.monthlyKwh).toBeCloseTo(180);
    expect(result.monthlyCost).toBeCloseTo(1440);
    expect(result.savedKwh).toBeCloseTo(36);
    expect(result.savedCost).toBeCloseTo(288);
  });

  it('calculates upgrade savings and payback from supplied assumptions', () => {
    const result = estimateAppliance(ac, 8);
    expect(result.upgradeSavedKwh).toBeCloseTo(45);
    expect(result.upgradeSavedCost).toBeCloseTo(360);
    expect(result.upgradePaybackMonths).toBeCloseTo(30000 / 360);
  });

  it('does not return negative costs for invalid inputs', () => {
    const result = estimateAppliance({ ...ac, watts: -200, quantity: -1, hoursPerDay: 40 }, -5);
    expect(result.monthlyKwh).toBe(0);
    expect(result.monthlyCost).toBe(0);
  });
});

describe('estimateBillTotals', () => {
  it('sums appliance estimates', () => {
    const result = estimateBillTotals([ac, { ...ac, id: 'fan', watts: 70, hoursPerDay: 8, reduceHoursPerDay: 0, replacementWatts: undefined, replacementCost: undefined }], 8);
    expect(result.totalKwh).toBeCloseTo(196.8);
    expect(result.potentialMonthlySavings).toBeCloseTo(288);
  });
});

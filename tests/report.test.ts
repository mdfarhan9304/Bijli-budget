import { describe, expect, it } from 'vitest';
import { createLocalReport, type ReportInput } from '../lib/report';

const baseInput: ReportInput = {
  region: 'West Bengal', amount: 0, units: 240, billingDays: 30, provider: 'CESC', billDate: '', rate: 8,
  applianceKwh: 100, applianceCost: 800, potentialSavings: 100,
  actions: [{ name: 'Fan', monthlyKwh: 100, savedKwh: 12.5, savedCost: 100, reduceHours: 1 }],
};

describe('createLocalReport', () => {
  it('uses the planning rate instead of displaying a zero bill average when bill total is missing', () => {
    const report = createLocalReport(baseInput);
    expect(report.observations[0]).toContain('planning rate is ₹8 per kWh');
    expect(report.observations[0]).toContain('Add both bill total and billed units');
  });

  it('uses the actual bill average only when both bill total and units are present', () => {
    const report = createLocalReport({ ...baseInput, amount: 1_920 });
    expect(report.observations[0]).toContain('bill average is ₹8 per kWh');
  });
});

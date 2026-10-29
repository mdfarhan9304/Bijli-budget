import { describe, expect, it } from 'vitest';
import { parseBillText } from '../lib/bill-parser';

describe('parseBillText', () => {
  it('extracts a labelled payable amount, units and provider', () => {
    const result = parseBillText('CESC Electricity Bill\nTotal Amount Payable: Rs. 2,450.00\nUnits Consumed: 312 kWh\nBilling Period: 30 days');
    expect(result.provider).toBe('CESC');
    expect(result.amount).toBe(2450);
    expect(result.units).toBe(312);
    expect(result.billingDays).toBe(30);
  });

  it('asks for manual correction when values are missing', () => {
    const result = parseBillText('Electricity statement');
    expect(result.amount).toBeNull();
    expect(result.units).toBeNull();
    expect(result.notes.length).toBeGreaterThan(0);
  });
});

import type { TariffRecord } from '../../lib/tariffs/types';

const verifiedOn = '2026-10-29';

/** CESC Rate G schedule in its official 2025–26 tariff order. */
export const cescKolkataDomestic: TariffRecord = {
  id: 'wb-cesc-domestic-g-2025-26',
  version: 1,
  verification: 'verified',
  stateId: 'west-bengal',
  stateName: 'West Bengal',
  discomId: 'cesc-kolkata',
  discomName: 'CESC Limited (Kolkata)',
  categoryId: 'domestic',
  categoryName: 'Domestic / Residential',
  consumerSubgroup: 'Rate G, low-tension domestic',
  effectiveFrom: '2025-04-01',
  billingUnit: 'monthly-kwh',
  standardBillingDays: 30,
  slabMethod: 'cumulative',
  slabs: [
    { upToKwh: 25, ratePaisePerKwh: 518, label: 'First 25 kWh' },
    { upToKwh: 60, ratePaisePerKwh: 569, label: 'Next 35 kWh (26–60)' },
    { upToKwh: 100, ratePaisePerKwh: 670, label: 'Next 40 kWh (61–100)' },
    { upToKwh: 150, ratePaisePerKwh: 745, label: 'Next 50 kWh (101–150)' },
    { upToKwh: 200, ratePaisePerKwh: 762, label: 'Next 50 kWh (151–200)' },
    { upToKwh: 300, ratePaisePerKwh: 762, label: 'Next 100 kWh (201–300)' },
    { ratePaisePerKwh: 921, label: 'Above 300 kWh' },
  ],
  fixedCharge: { basis: 'per-kva-per-billing-period', paise: 1500, requiresSanctionedLoad: true, label: '₹15 per KVA of sanctioned load per billing period' },
  rounding: 'half-up-to-paise',
  source: {
    url: 'https://www.cesc.co.in/storage/uploads/tariff/Tariff%20and%20Associated%20Terms%20and%20Conditions%20of%20tariff%20for%202025-26.pdf',
    title: 'CESC Tariff and Associated Terms and Conditions for 2025–26',
    reference: 'WBERC order dated 25 March 2025; Rate G (Domestic Urban); effective 1 April 2025 onwards until further order.',
    verifiedOn,
  },
  excludedChargeNotes: [
    'Monthly FPPAS/MVCA is not included because it changes and no current, verified value is stored in this record.',
    'Meter rent is not included because the current tariff schedule states that existing meter-rent charges continue but does not state the applicable amount.',
    'Government duty is not included because CESC calculates it after FPPAS and any timely-payment rebate; without the current FPPAS, that base cannot be calculated reliably.',
    'Timely-payment rebate, arrears, deposits, late-payment charges and bill-specific adjustments are not included.',
  ],
};

/** Official tariff source located; schedule requires further normalisation before it can be estimated safely. */
export const wbsedclDomesticUnavailable: TariffRecord = {
  id: 'wb-wbsedcl-domestic-unavailable-2025-26',
  version: 1,
  verification: 'unavailable',
  stateId: 'west-bengal',
  stateName: 'West Bengal',
  discomId: 'wbsedcl',
  discomName: 'WBSEDCL',
  categoryId: 'domestic',
  categoryName: 'Domestic / Residential',
  consumerSubgroup: 'Domestic tariff schedule',
  effectiveFrom: '2025-04-01',
  billingUnit: 'monthly-kwh',
  standardBillingDays: 30,
  slabMethod: 'cumulative',
  slabs: [],
  rounding: 'half-up-to-paise',
  source: {
    url: 'https://www.wbsedcl.in/irj/go/km/docs/internet/new_website/pdf/Tariff_Volumn/Gist%20of%20Tariff%20Order%202025-26_28_03.pdf',
    title: 'WBSEDCL Gist of Tariff Order 2025–26',
    reference: 'Official PDF, dated 20 March 2025.',
    verifiedOn,
  },
  excludedChargeNotes: ['Unavailable for estimation until the applicable domestic scheme, subsidy conditions, and bill-period treatment are independently normalised and verified.'],
};

export const westBengalTariffs = [cescKolkataDomestic, wbsedclDomesticUnavailable] as const;

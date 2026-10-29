import type { TariffRecord } from '../../lib/tariffs/types';

const source = {
  url: 'https://www.apspdcl.in/files/regulatory/Tariff%20Order%20for%20the%20year%202026-27.pdf',
  title: 'APERC Tariff Order for Retail Sale of Electricity during FY 2026–27',
  reference: 'APERC order dated 25 March 2026. Table 11 (pages 171–174) and Category I(A) Domestic-LT terms (pages 175–176). Applies to APSPDCL, APCPDCL and APEPDCL from 1 April 2026 to 31 March 2027.',
  verifiedOn: '2026-10-29',
} as const;

const domesticSchedule = {
  categoryId: 'domestic' as const,
  categoryName: 'Domestic / Residential',
  consumerSubgroup: 'Category I(A), Domestic-LT, telescopic billing',
  effectiveFrom: '2026-04-01',
  effectiveTo: '2027-03-31',
  billingUnit: 'monthly-kwh' as const,
  standardBillingDays: 30,
  slabMethod: 'cumulative' as const,
  slabs: [
    { upToKwh: 30, ratePaisePerKwh: 190, label: 'First 30 kWh' },
    { upToKwh: 75, ratePaisePerKwh: 300, label: 'Next 45 kWh (31–75)' },
    { upToKwh: 125, ratePaisePerKwh: 450, label: 'Next 50 kWh (76–125)' },
    { upToKwh: 225, ratePaisePerKwh: 600, label: 'Next 100 kWh (126–225)' },
    { upToKwh: 400, ratePaisePerKwh: 875, label: 'Next 175 kWh (226–400)' },
    { ratePaisePerKwh: 975, label: 'Above 400 kWh' },
  ],
  fixedCharge: { basis: 'per-kw-per-billing-period' as const, paise: 1000, requiresSanctionedLoadKw: true, maximumSanctionedLoadMilliKw: 75000, label: '₹10 per kW of sanctioned load per month (supported up to 75 kW)' },
  customerCharges: [
    { upToKwh: 30, paise: 2500, label: '₹25/month for 0–30 kWh' },
    { upToKwh: 75, paise: 3000, label: '₹30/month for 31–75 kWh' },
    { upToKwh: 125, paise: 4500, label: '₹45/month for 76–125 kWh' },
    { upToKwh: 225, paise: 5000, label: '₹50/month for 126–225 kWh' },
    { upToKwh: 400, paise: 5500, label: '₹55/month for 226–400 kWh' },
    { paise: 5500, label: '₹55/month above 400 kWh' },
  ],
  rounding: 'half-up-to-paise' as const,
  source,
  excludedChargeNotes: [
    'This tariff order states that electricity duty, FPPCA, true-up/true-down and any other recovery ordered separately are excluded from the published tariff; they are not included in this estimate.',
    'The ₹10/kW fixed-charge calculation supports sanctioned loads up to 75 kW. Above 75 kW, the official schedule changes the applicable fixed charge for excess load.',
    'Arrears, deposits, late-payment charges, meter-specific adjustments and bill-specific corrections are not included.',
  ],
};

function domesticTariff(discomId: string, discomName: string): TariffRecord {
  return {
    id: `ap-${discomId}-domestic-2026-27`,
    version: 1,
    verification: 'verified',
    stateId: 'andhra-pradesh',
    stateName: 'Andhra Pradesh',
    discomId,
    discomName,
    ...domesticSchedule,
  };
}

export const andhraPradeshTariffs = [
  domesticTariff('apeasternpower', 'Eastern Power Distribution Company of Andhra Pradesh Limited'),
  domesticTariff('apcpdcl', 'Central Power Distribution Company of Andhra Pradesh Limited'),
  domesticTariff('apspdcl', 'Southern Power Distribution Company of Andhra Pradesh Limited'),
] as const;

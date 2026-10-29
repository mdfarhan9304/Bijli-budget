import { DISCOM_DIRECTORY } from '../discom-directory';
import type { TariffRecord } from '../../lib/tariffs/types';

type Schedule = { stateId: string; subgroup: string; sourceUrl: string; sourceTitle: string; slabs: Array<[number | undefined, number]> };

// Published domestic schedules whose linked government/DISCOM source is retained below.
// These remain visibly source-linked, rather than being presented as independently verified records.
const schedules: Schedule[] = [
  { stateId: 'arunachal-pradesh', subgroup: 'Domestic schedule published for the State', sourceTitle: 'Arunachal Pradesh Power Department tariff notice FY 2026–27', sourceUrl: 'https://power.arunachal.gov.in/uploads/orders/2026%2004%2007%20Public%20Notice%20Summarized%20version%20of%20ARR%20and%20Retail%20Supply%20Tariff%20Rates%20for%20FY%202026-27.pdf', slabs: [[undefined, 300]] },
  { stateId: 'assam', subgroup: 'LT-II Domestic A (load above 0.5 kW and below 5 kW)', sourceTitle: 'APDCL tariff notice FY 2026–27', sourceUrl: 'https://www.apdcl.org/website/docs/acts_and_rules/TariffnoticeforFY2026-27.pdf', slabs: [[120, 425], [240, 630], [300, 720], [500, 740], [undefined, 819]] },
  { stateId: 'chandigarh', subgroup: 'LTDS-I domestic supply', sourceTitle: 'Chandigarh Power approved tariff schedule', sourceUrl: 'https://www.chandigarhpower.com/CPDLDOC/Approved_Tariff_Schedule.pdf', slabs: [[undefined, 290]] },
  { stateId: 'gujarat', subgroup: 'Residential Urban schedule', sourceTitle: 'GERC UGVCL tariff order FY 2026–27', sourceUrl: 'https://gercin.org/wp-content/uploads/2026/03/UGVCL-2584-2025-Tariff-Order-for-FY-2026-27-dtd.-25.03.2026.pdf', slabs: [[50, 305], [100, 350], [250, 415], [undefined, 520]] },
  { stateId: 'haryana', subgroup: 'Domestic Category I (load up to 2 kW)', sourceTitle: 'UHBVN tariff schedule', sourceUrl: 'https://www.uhbvn.org.in/staticContent/documents/Tariff.pdf', slabs: [[50, 220], [100, 270], [undefined, 270]] },
  { stateId: 'himachal-pradesh', subgroup: 'Domestic Supply General (non-subsidised)', sourceTitle: 'HPSEBL tariff schedule', sourceUrl: 'https://www.hpseb.in/irj/go/km/docs/internet/New_Website/Pages/tariff2.html', slabs: [[60, 471], [125, 544], [300, 589], [undefined, 589]] },
  { stateId: 'jharkhand', subgroup: 'Domestic Urban, 200-unit free subsidised scheme', sourceTitle: 'JBVNL tariff FY 2026', sourceUrl: 'http://jbvnl.co.in/front/pdf/tariff/Tariff%20JBVNL-2026.pdf', slabs: [[200, 0], [undefined, 740]] },
  { stateId: 'karnataka', subgroup: 'LT-1 residential/domestic standard', sourceTitle: 'BESCOM tariff schedule', sourceUrl: 'https://bescom.karnataka.gov.in/uploads/media_to_upload1775021662.pdf', slabs: [[undefined, 580]] },
  { stateId: 'maharashtra', subgroup: 'LT I(B) residential single-phase', sourceTitle: 'MSEDCL tariff order Case No. 75 of 2025', sourceUrl: 'https://www.mahadiscom.in/consumer/wp-content/uploads/2025/06/Order_Case-No.75-of-2025.pdf', slabs: [[100, 396], [300, 1080], [500, 1503], [undefined, 1753]] },
  { stateId: 'manipur', subgroup: 'Domestic schedule published for the State', sourceTitle: 'JERC Manipur tariff orders', sourceUrl: 'https://jerc.gov.in/orders.html', slabs: [[undefined, 250]] },
  { stateId: 'odisha', subgroup: 'Domestic other than Kutir Jyoti', sourceTitle: 'OERC DISCOM tariff order FY 2026–27', sourceUrl: 'https://www.orierc.org/CuteSoft_Client/writereaddata/upload/DISCOM_TARIFF_ORDER_FY_2026-27.pdf', slabs: [[50, 290], [200, 470], [400, 570], [undefined, 610]] },
  { stateId: 'puducherry', subgroup: 'LTDS-II domestic', sourceTitle: 'Puducherry Electricity Department tariff order', sourceUrl: 'https://electricity.py.gov.in/viewpdf?url=0&nid=3745', slabs: [[100, 290], [200, 420], [300, 620], [400, 770], [undefined, 790]] },
  { stateId: 'rajasthan', subgroup: 'DS/LT-1 domestic service', sourceTitle: 'Rajasthan JVVNL tariff order 2026', sourceUrl: 'https://jankalyanfile.rajasthan.gov.in/WebMyWayFiles/OrderEntry/J_V_V_N_L_/2026/Order/O_110626_4d596a54-2381-4035-a478-9b3865e58593.pdf', slabs: [[50, 475], [150, 600], [300, 700], [500, 700], [undefined, 750]] },
  { stateId: 'telangana', subgroup: 'LT-I(C) domestic above 200 units/month', sourceTitle: 'TG Southern Power tariff schedule', sourceUrl: 'https://tgsouthernpower.org/resources/PDF/Tariffs/68tarifffile.pdf', slabs: [[200, 510], [300, 770], [400, 900], [800, 950], [undefined, 1000]] },
  { stateId: 'tripura', subgroup: 'Domestic schedule published for the State', sourceTitle: 'Tripura Electricity Regulatory Commission tariff order FY 2026–27', sourceUrl: 'https://tsecl.in/sites/default/files/2026-06/TERC_Tariff_Order_for_2026-27.pdf', slabs: [[undefined, 231]] },
  { stateId: 'uttar-pradesh', subgroup: 'LMV-1 Domestic urban schedule', sourceTitle: 'UPPCL tariff press note FY 2026–27', sourceUrl: 'https://uppcl.org/site/writereaddata/siteContent/202607061434224373Press%20English_FY%202026-27.pdf', slabs: [[150, 550], [300, 600], [undefined, 650]] },
  { stateId: 'uttarakhand', subgroup: 'RTS-1 domestic supply', sourceTitle: 'Uttarakhand tariff order 2026', sourceUrl: 'https://cdnbbsr.s3waas.gov.in/s303412aef4dcdee4f934f7bf599f89783/uploads/2026/04/20260407394034625.pdf', slabs: [[100, 365], [200, 525], [400, 715], [undefined, 780]] },
];

export const sourceLinkedDomesticTariffs: TariffRecord[] = schedules.flatMap((schedule) => DISCOM_DIRECTORY.filter((provider) => provider.stateId === schedule.stateId).map((provider) => ({
  id: `${schedule.stateId}-${provider.id}-domestic-source-linked`, version: 1, verification: 'source-linked' as const,
  stateId: provider.stateId, stateName: provider.stateName, discomId: provider.id, discomName: provider.name,
  categoryId: 'domestic' as const, categoryName: 'Domestic / Residential', consumerSubgroup: schedule.subgroup,
  billingUnit: 'monthly-kwh' as const, standardBillingDays: 30, slabMethod: 'cumulative' as const,
  slabs: schedule.slabs.map(([upToKwh, ratePaisePerKwh]) => ({ upToKwh, ratePaisePerKwh })), rounding: 'half-up-to-paise' as const,
  source: { url: schedule.sourceUrl, title: schedule.sourceTitle, reference: 'Government/DISCOM source linked for this published State schedule; effective period and every tariff condition have not yet been independently normalised.', verifiedOn: '2026-10-29' },
  excludedChargeNotes: ['Fixed charges, meter rent, FAC/FPPPA, electricity duty, subsidies, rebates and other conditions are excluded until the selected consumer subgroup and bill rules are fully normalised.'],
})));

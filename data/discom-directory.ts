import type { TariffSource } from '../lib/tariffs/types';

export type DiscomDirectoryEntry = {
  id: string;
  stateId: string;
  stateName: string;
  name: string;
  shortName?: string;
};

/**
 * Provider directory only — this is deliberately separate from tariff records.
 * A listed provider may be selected in the UI, but a bill is calculated only when
 * a matching verified TariffRecord exists in the tariff registry.
 *
 * The Delhi Transco government utility directory is the primary cross-state source.
 * The Ministry of New and Renewable Energy portal is used to cross-check entries
 * which have since been reorganised (notably the merged Dadra & Nagar Haveli and
 * Daman & Diu territory).
 */
export const DISCOM_DIRECTORY_SOURCES: readonly TariffSource[] = [
  {
    url: 'https://www.dtl.gov.in/content/202_6_stateutgencotranscodiscom.aspx',
    title: 'States / UTs Wise Power Utilities',
    reference: 'Delhi Transco Limited official directory; page states it was last updated 2 September 2025.',
    verifiedOn: '2026-10-29',
  },
  {
    url: 'https://solarrooftop.pmsuryaghar.gov.in/Report/DiscomList/details',
    title: 'PM Surya Ghar: DISCOM Information',
    reference: 'Ministry of New and Renewable Energy official DISCOM contact directory.',
    verifiedOn: '2026-10-29',
  },
] as const;

const entry = (stateId: string, stateName: string, id: string, name: string, shortName?: string): DiscomDirectoryEntry => ({ id, stateId, stateName, name, shortName });

/**
 * Public distribution utilities presented by State/UT. Supply area is address- and
 * connection-specific; consumers should select the provider printed on their bill.
 */
export const DISCOM_DIRECTORY: readonly DiscomDirectoryEntry[] = [
  entry('andhra-pradesh', 'Andhra Pradesh', 'apeasternpower', 'Eastern Power Distribution Company of Andhra Pradesh Limited', 'APEPDCL'),
  entry('andhra-pradesh', 'Andhra Pradesh', 'apcpdcl', 'Central Power Distribution Company of Andhra Pradesh Limited', 'APCPDCL'),
  entry('andhra-pradesh', 'Andhra Pradesh', 'apspdcl', 'Southern Power Distribution Company of Andhra Pradesh Limited', 'APSPDCL'),
  entry('arunachal-pradesh', 'Arunachal Pradesh', 'arunachal-power', 'Department of Power, Arunachal Pradesh'),
  entry('assam', 'Assam', 'apdcl', 'Assam Power Distribution Company Limited', 'APDCL'),
  entry('bihar', 'Bihar', 'nbpdcl', 'North Bihar Power Distribution Company Limited', 'NBPDCL'),
  entry('bihar', 'Bihar', 'sbpdcl', 'South Bihar Power Distribution Company Limited', 'SBPDCL'),
  entry('chhattisgarh', 'Chhattisgarh', 'cspdcl', 'Chhattisgarh State Power Distribution Company Limited', 'CSPDCL'),
  entry('goa', 'Goa', 'goa-electricity', 'Electricity Department of Goa'),
  entry('gujarat', 'Gujarat', 'ugvcl', 'Uttar Gujarat Vij Company Limited', 'UGVCL'),
  entry('gujarat', 'Gujarat', 'dgvcl', 'Dakshin Gujarat Vij Company Limited', 'DGVCL'),
  entry('gujarat', 'Gujarat', 'mgvcl', 'Madhya Gujarat Vij Company Limited', 'MGVCL'),
  entry('gujarat', 'Gujarat', 'pgvcl', 'Paschim Gujarat Vij Company Limited', 'PGVCL'),
  entry('gujarat', 'Gujarat', 'torrent-gujarat', 'Torrent Power Limited'),
  entry('haryana', 'Haryana', 'uhbvn', 'Uttar Haryana Bijli Vitran Nigam Limited', 'UHBVNL'),
  entry('haryana', 'Haryana', 'dhbvn', 'Dakshin Haryana Bijli Vitran Nigam Limited', 'DHBVNL'),
  entry('himachal-pradesh', 'Himachal Pradesh', 'hpsebl', 'Himachal Pradesh State Electricity Board Limited', 'HPSEBL'),
  entry('jharkhand', 'Jharkhand', 'jbvnl', 'Jharkhand Bijli Vitran Nigam Limited', 'JBVNL'),
  entry('jharkhand', 'Jharkhand', 'tpjusc', 'Tata Power Jamshedpur Utilities and Services Company Limited', 'TPJUSCO'),
  entry('jharkhand', 'Jharkhand', 'bpscl', 'Bokaro Power Supply Company Private Limited', 'BPSCL'),
  entry('karnataka', 'Karnataka', 'bescom', 'Bangalore Electricity Supply Company Limited', 'BESCOM'),
  entry('karnataka', 'Karnataka', 'chescom', 'Chamundeshwari Electricity Supply Corporation Limited', 'CESC Mysuru'),
  entry('karnataka', 'Karnataka', 'gescom', 'Gulbarga Electricity Supply Company Limited', 'GESCOM'),
  entry('karnataka', 'Karnataka', 'hescom', 'Hubli Electricity Supply Company Limited', 'HESCOM'),
  entry('karnataka', 'Karnataka', 'mescom', 'Mangalore Electricity Supply Company Limited', 'MESCOM'),
  entry('kerala', 'Kerala', 'ksebl', 'Kerala State Electricity Board Limited', 'KSEBL'),
  entry('madhya-pradesh', 'Madhya Pradesh', 'mpmkvvcl', 'Madhya Pradesh Madhya Kshetra Vidyut Vitaran Company Limited', 'MPMKVVCL'),
  entry('madhya-pradesh', 'Madhya Pradesh', 'mppkvvcl', 'Madhya Pradesh Poorv Kshetra Vidyut Vitaran Company Limited', 'MPPKVVCL'),
  entry('madhya-pradesh', 'Madhya Pradesh', 'mppkvvcl-west', 'Madhya Pradesh Paschim Kshetra Vidyut Vitaran Company Limited', 'MPPKVVCL'),
  entry('maharashtra', 'Maharashtra', 'msedcl', 'Maharashtra State Electricity Distribution Company Limited', 'MSEDCL / Mahavitaran'),
  entry('maharashtra', 'Maharashtra', 'adani-mumbai', 'Adani Electricity Mumbai Limited', 'AEML'),
  entry('maharashtra', 'Maharashtra', 'best', 'BEST Undertaking'),
  entry('maharashtra', 'Maharashtra', 'tata-power-mumbai', 'Tata Power Company Limited (Mumbai distribution)'),
  entry('manipur', 'Manipur', 'mspdcl', 'Manipur State Power Distribution Company Limited', 'MSPDCL'),
  entry('meghalaya', 'Meghalaya', 'mepdcl', 'Meghalaya Power Distribution Corporation Limited', 'MePDCL'),
  entry('mizoram', 'Mizoram', 'mizoram-power', 'Power and Electricity Department, Mizoram'),
  entry('nagaland', 'Nagaland', 'nagaland-power', 'Department of Power, Nagaland'),
  entry('odisha', 'Odisha', 'tp-central-odisha', 'TP Central Odisha Distribution Limited', 'TPCODL'),
  entry('odisha', 'Odisha', 'tp-northern-odisha', 'TP Northern Odisha Distribution Limited', 'TPNODL'),
  entry('odisha', 'Odisha', 'tp-southern-odisha', 'TP Southern Odisha Distribution Limited', 'TPSODL'),
  entry('odisha', 'Odisha', 'tp-western-odisha', 'TP Western Odisha Distribution Limited', 'TPWODL'),
  entry('punjab', 'Punjab', 'pspcl', 'Punjab State Power Corporation Limited', 'PSPCL'),
  entry('rajasthan', 'Rajasthan', 'avvnl', 'Ajmer Vidyut Vitran Nigam Limited', 'AVVNL'),
  entry('rajasthan', 'Rajasthan', 'jdvvnl', 'Jodhpur Vidyut Vitran Nigam Limited', 'JDVVNL'),
  entry('rajasthan', 'Rajasthan', 'jvvnl', 'Jaipur Vidyut Vitran Nigam Limited', 'JVVNL'),
  entry('sikkim', 'Sikkim', 'sikkim-power', 'Energy and Power Department, Government of Sikkim'),
  entry('tamil-nadu', 'Tamil Nadu', 'tnpdcl', 'Tamil Nadu Power Distribution Corporation Limited', 'TNPDCL'),
  entry('telangana', 'Telangana', 'tsnpdcl', 'Northern Power Distribution Company of Telangana Limited', 'TSNPDCL'),
  entry('telangana', 'Telangana', 'tsspdcl', 'Southern Power Distribution Company of Telangana Limited', 'TSSPDCL'),
  entry('tripura', 'Tripura', 'tsecl', 'Tripura State Electricity Corporation Limited', 'TSECL'),
  entry('uttar-pradesh', 'Uttar Pradesh', 'dvvnl', 'Dakshinanchal Vidyut Vitran Nigam Limited', 'DVVNL'),
  entry('uttar-pradesh', 'Uttar Pradesh', 'mvvnl', 'Madhyanchal Vidyut Vitran Nigam Limited', 'MVVNL'),
  entry('uttar-pradesh', 'Uttar Pradesh', 'pvvnl', 'Pashchimanchal Vidyut Vitran Nigam Limited', 'PVVNL'),
  entry('uttar-pradesh', 'Uttar Pradesh', 'puvvnl', 'Purvanchal Vidyut Vitran Nigam Limited', 'PUVVNL'),
  entry('uttar-pradesh', 'Uttar Pradesh', 'kesco', 'Kanpur Electricity Supply Company Limited', 'KESCO'),
  entry('uttar-pradesh', 'Uttar Pradesh', 'npcl', 'Noida Power Company Limited', 'NPCL'),
  entry('uttar-pradesh', 'Uttar Pradesh', 'torrent-agra', 'Torrent Power Limited (Agra distribution)'),
  entry('uttarakhand', 'Uttarakhand', 'upcl', 'Uttarakhand Power Corporation Limited', 'UPCL'),
  entry('west-bengal', 'West Bengal', 'cesc-kolkata', 'CESC Limited (Kolkata)', 'CESC'),
  entry('west-bengal', 'West Bengal', 'wbsedcl', 'West Bengal State Electricity Distribution Company Limited', 'WBSEDCL'),
  entry('west-bengal', 'West Bengal', 'dvc', 'Damodar Valley Corporation', 'DVC'),
  entry('west-bengal', 'West Bengal', 'ipcl-west-bengal', 'India Power Corporation Limited', 'IPCL'),
  entry('andaman-and-nicobar-islands', 'Andaman and Nicobar Islands', 'andaman-electricity', 'Electricity Department, Andaman and Nicobar Administration'),
  entry('chandigarh', 'Chandigarh', 'chandigarh-electricity', 'Electricity Department, Chandigarh Administration'),
  entry('dadra-and-nagar-haveli-and-daman-and-diu', 'Dadra and Nagar Haveli and Daman and Diu', 'dnhddpcl', 'Dadra and Nagar Haveli and Daman and Diu Power Distribution Corporation Limited', 'DNHDDPCL'),
  entry('delhi-(nct)', 'Delhi (NCT)', 'tpddl', 'Tata Power Delhi Distribution Limited', 'TPDDL'),
  entry('delhi-(nct)', 'Delhi (NCT)', 'brpl', 'BSES Rajdhani Power Limited', 'BRPL'),
  entry('delhi-(nct)', 'Delhi (NCT)', 'bypl', 'BSES Yamuna Power Limited', 'BYPL'),
  entry('delhi-(nct)', 'Delhi (NCT)', 'ndmc', 'New Delhi Municipal Council', 'NDMC'),
  entry('jammu-and-kashmir', 'Jammu and Kashmir', 'jpdcl', 'Jammu Power Distribution Corporation Limited', 'JPDCL'),
  entry('jammu-and-kashmir', 'Jammu and Kashmir', 'kpdcl', 'Kashmir Power Distribution Corporation Limited', 'KPDCL'),
  entry('ladakh', 'Ladakh', 'ladakh-power', 'Power Development Department, Ladakh'),
  entry('lakshadweep', 'Lakshadweep', 'lakshadweep-electricity', 'Lakshadweep Electricity Department'),
  entry('puducherry', 'Puducherry', 'puducherry-electricity', 'Electricity Department, Government of Puducherry'),
] as const;

export function discomsForState(stateId: string): DiscomDirectoryEntry[] {
  return DISCOM_DIRECTORY.filter((provider) => provider.stateId === stateId);
}

export function findDiscom(providerId: string): DiscomDirectoryEntry | undefined {
  return DISCOM_DIRECTORY.find((provider) => provider.id === providerId);
}

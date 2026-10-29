export type ExtractedBill = {
  amount: number | null;
  units: number | null;
  billingDays: number | null;
  billDate: string | null;
  provider: string | null;
  rawText: string;
  notes: string[];
};

const money = (value: string) => Number(value.replace(/,/g, ''));

/** Heuristic extraction only. Always ask the user to review the values before calculating. */
export function parseBillText(rawText: string): ExtractedBill {
  const text = rawText.replace(/\u00a0/g, ' ').replace(/[₹]/g, '₹');
  const notes: string[] = [];
  const amountPatterns = [
    /(?:total\s+(?:amount\s+)?payable|amount\s+payable|net\s+amount\s+payable|bill\s+amount|total\s+bill|total\s+amount)[^\d₹]{0,30}₹?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /₹\s*([\d,]+(?:\.\d{1,2})?)\s*(?:only)?/i,
  ];
  let amount: number | null = null;
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = money(match[1]);
      if (Number.isFinite(parsed) && parsed > 0) { amount = parsed; break; }
    }
  }

  const unitPatterns = [
    /(?:units?\s+consumed|consumption|energy\s+consumed|total\s+units|units\s+billed|kwh\s+consumed)[^\d]{0,24}([\d,]+(?:\.\d+)?)/i,
    /([\d,]+(?:\.\d+)?)\s*(?:kwh|units)\b/i,
  ];
  let units: number | null = null;
  for (const pattern of unitPatterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = money(match[1]);
      if (Number.isFinite(parsed) && parsed >= 0) { units = parsed; break; }
    }
  }

  const dayMatch = text.match(/(?:billing\s+period|period)\s*[:\-]?\s*(\d{1,2})\s*(?:days|day)\b/i);
  const billingDays = dayMatch ? Number(dayMatch[1]) : null;
  const dateMatch = text.match(/(?:bill\s+date|date\s+of\s+issue|issue\s+date)\s*[:\-]?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i);
  const billDate = dateMatch ? dateMatch[1] : null;
  const provider = /\bCESC\b/i.test(text) ? 'CESC' : /\bWBSEDCL\b/i.test(text) ? 'WBSEDCL' : null;

  if (amount == null) notes.push('Could not confidently find the payable amount. Enter it from the bill.');
  if (units == null) notes.push('Could not confidently find billed units. Enter the units from the bill.');
  if (billingDays == null) notes.push('Billing days were not detected; this field is optional.');
  notes.push('Extraction is heuristic. Check every value against your original bill before using the estimate.');
  return { amount, units, billingDays, billDate, provider, rawText, notes };
}

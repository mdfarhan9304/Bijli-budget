export type ReportInput = {
  region: string;
  amount: number;
  units: number;
  billingDays: number;
  provider: string;
  billDate: string;
  rate: number;
  applianceKwh: number;
  applianceCost: number;
  potentialSavings: number;
  actions: Array<{ name: string; monthlyKwh: number; savedKwh: number; savedCost: number; reduceHours: number }>;
};

export type SavingsReport = {
  headline: string;
  summary: string;
  observations: string[];
  actions: Array<{ title: string; detail: string; saving: string }>;
  caveat: string;
  generatedBy: 'OpenAI' | 'BijliBudget';
};

const inr = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.max(0, value));

/** A transparent local report used when a server-side AI key is not configured. */
export function createLocalReport(input: ReportInput): SavingsReport {
  const averageRate = input.units > 0 ? input.amount / input.units : input.rate;
  const coverage = input.units > 0 ? Math.round((input.applianceKwh / input.units) * 100) : 0;
  const ranked = [...input.actions].filter((action) => action.savedCost > 0).sort((a, b) => b.savedCost - a.savedCost);
  const actions = ranked.slice(0, 3).map((action) => ({
    title: `Reduce ${action.name.toLowerCase()} use by ${action.reduceHours} h/day`,
    detail: `That removes about ${action.savedKwh.toFixed(1)} kWh from a ${input.billingDays || 30}-day month at the usage pattern you entered.`,
    saving: `${inr(action.savedCost)}/month`,
  }));
  if (!actions.length) actions.push({ title: 'Set a realistic reduction target', detail: 'Add “hours to reduce per day” for the appliances you can change. The report will rank the impact automatically.', saving: 'Needs an input' });
  const top = ranked[0];
  return {
    headline: input.amount > 0 ? `${inr(input.amount)} bill, with a clear first move.` : 'Start with the largest controllable load.',
    summary: input.units > 0
      ? `Your bill records ${input.units.toFixed(0)} kWh over ${input.billingDays || 30} days. The entered appliances account for roughly ${coverage}% of that usage; treat the difference as other loads, appliance cycling, or input uncertainty.`
      : 'Add billed units to compare your entered appliance pattern against the utility bill.',
    observations: [
      `Your all-in bill average is ${inr(averageRate)} per kWh. This is useful for planning, but it is not necessarily the marginal tariff for the next unit.`,
      `The appliances you listed model ${input.applianceKwh.toFixed(1)} kWh/month (${inr(input.applianceCost)} at your chosen rate).`,
      top ? `${top.name} is the highest-impact listed behaviour change: ${top.savedKwh.toFixed(1)} kWh or ${inr(top.savedCost)} per month.` : 'No behaviour-change scenario is set yet.',
    ],
    actions,
    caveat: 'This is a planning estimate, not a tariff calculation. Fixed charges, slab pricing, appliance duty cycles and actual household behaviour can change the bill result.',
    generatedBy: 'BijliBudget',
  };
}

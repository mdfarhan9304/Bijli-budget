export type Appliance = {
  id: string;
  name: string;
  watts: number;
  quantity: number;
  hoursPerDay: number;
  daysPerMonth: number;
  reduceHoursPerDay: number;
  /** Optional replacement appliance power. Used only for upgrade payback estimates. */
  replacementWatts?: number;
  replacementCost?: number;
};

export type ApplianceEstimate = {
  appliance: Appliance;
  monthlyKwh: number;
  monthlyCost: number;
  savedKwh: number;
  savedCost: number;
  upgradeSavedKwh: number;
  upgradeSavedCost: number;
  upgradePaybackMonths: number | null;
};

export function estimateAppliance(appliance: Appliance, effectiveRate: number): ApplianceEstimate {
  const validRate = Math.max(0, finite(effectiveRate));
  const watts = Math.max(0, finite(appliance.watts));
  const quantity = Math.max(0, finite(appliance.quantity));
  const hours = clamp(finite(appliance.hoursPerDay), 0, 24);
  const days = clamp(finite(appliance.daysPerMonth), 0, 31);
  const reduced = clamp(finite(appliance.reduceHoursPerDay), 0, hours);
  const monthlyKwh = (watts / 1000) * quantity * hours * days;
  const savedKwh = (watts / 1000) * quantity * reduced * days;
  const replacementWatts = appliance.replacementWatts == null ? null : Math.max(0, finite(appliance.replacementWatts));
  const upgradeSavedKwh = replacementWatts == null ? 0 : Math.max(0, ((watts - replacementWatts) / 1000) * quantity * hours * days);
  const upgradeSavedCost = upgradeSavedKwh * validRate;
  const replacementCost = Math.max(0, finite(appliance.replacementCost ?? 0));
  return {
    appliance,
    monthlyKwh,
    monthlyCost: monthlyKwh * validRate,
    savedKwh,
    savedCost: savedKwh * validRate,
    upgradeSavedKwh,
    upgradeSavedCost,
    upgradePaybackMonths: upgradeSavedCost > 0 && replacementCost > 0 ? replacementCost / upgradeSavedCost : null,
  };
}

export function estimateBillTotals(appliances: Appliance[], effectiveRate: number) {
  const estimates = appliances.map((item) => estimateAppliance(item, effectiveRate));
  return {
    estimates,
    totalKwh: estimates.reduce((sum, item) => sum + item.monthlyKwh, 0),
    totalEstimatedCost: estimates.reduce((sum, item) => sum + item.monthlyCost, 0),
    potentialMonthlySavings: estimates.reduce((sum, item) => sum + item.savedCost, 0),
    totalUpgradeSavings: estimates.reduce((sum, item) => sum + item.upgradeSavedCost, 0),
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function finite(value: number) {
  return Number.isFinite(value) ? value : 0;
}

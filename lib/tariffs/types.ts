/** Money is stored in paise. Calculation internals use bigint to avoid floating-point rounding. */
export type Paise = bigint;
export type TariffVerification = 'verified' | 'source-linked' | 'unavailable' | 'fixture';
export type ChargeStatus = 'included' | 'excluded' | 'unknown' | 'depends-on-input';
export type SlabMethod = 'cumulative' | 'single-applicable-rate';

export type TariffSource = {
  url: string;
  title: string;
  reference: string;
  verifiedOn: string;
};

export type EnergySlab = {
  /** Inclusive upper boundary. Omit for the final unbounded slab. */
  upToKwh?: number;
  ratePaisePerKwh: number;
  label?: string;
};

export type FixedCharge = {
  basis: 'per-kva-per-billing-period' | 'per-kva-per-30-days' | 'per-kw-per-billing-period' | 'flat-per-billing-period' | 'per-day';
  paise: number;
  requiresSanctionedLoad?: boolean;
  requiresSanctionedLoadKw?: boolean;
  maximumSanctionedLoadMilliKw?: number;
  label: string;
};

/** A once-per-billing-period charge selected by the applicable consumption band. */
export type ConsumptionBandCharge = {
  upToKwh?: number;
  paise: number;
  label?: string;
};

export type MeterRent = {
  byPhasePaise: Partial<Record<'single' | 'three', number>>;
  label: string;
};

export type FuelAdjustment = {
  basis: 'per-kwh' | 'percentage-of-energy';
  paisePerKwh?: number;
  basisPoints?: number;
  label: string;
};

export type PercentageCharge = {
  /** 100 basis points = 1%. */
  basisPoints: number;
  appliesTo: Array<'energy' | 'fixed' | 'demand' | 'fac' | 'meter-rent'>;
  label: string;
};

export type Subsidy = {
  id: string;
  label: string;
  /** The scheme is applied only when every supplied condition matches. */
  maxConsumptionKwh?: number;
  maxSanctionedLoadMilliKva?: number;
  perKwhPaise?: number;
  flatPaise?: number;
};

export type MinimumCharge = {
  paise: number;
  label: string;
};

export type TariffRecord = {
  id: string;
  version: number;
  verification: TariffVerification;
  stateId: string;
  stateName: string;
  discomId: string;
  discomName: string;
  categoryId: 'domestic';
  categoryName: string;
  consumerSubgroup: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  billingUnit: 'monthly-kwh';
  standardBillingDays: number;
  slabMethod: SlabMethod;
  slabs: EnergySlab[];
  fixedCharge?: FixedCharge;
  customerCharges?: ConsumptionBandCharge[];
  demandCharge?: FixedCharge;
  meterRent?: MeterRent;
  fuelAdjustment?: FuelAdjustment;
  taxes?: PercentageCharge[];
  subsidies?: Subsidy[];
  minimumCharge?: MinimumCharge;
  rounding: 'half-up-to-paise';
  source: TariffSource;
  /** Charges that are not safely computable from the required fields. */
  excludedChargeNotes: string[];
};

export type TariffInput = {
  /** Date of the billed consumption, used to verify that the tariff is applicable. */
  asOfDate: string;
  consumptionKwh: number;
  billingDays: number;
  /** KVA × 1,000. This keeps decimal sanctioned loads exact. */
  sanctionedLoadMilliKva?: number;
  /** kW × 1,000. Used only where the tariff expresses charges against kW. */
  sanctionedLoadMilliKw?: number;
  meterPhase?: 'single' | 'three';
  timelyPaymentEligible?: boolean;
};

export type ChargeLine = {
  id: string;
  label: string;
  amountPaise: Paise | null;
  status: ChargeStatus;
  basis: string;
};

export type SlabLine = {
  label: string;
  unitsKwh: number;
  ratePaisePerKwh: number;
  amountPaise: Paise;
};

export type TariffCalculation = {
  tariff: TariffRecord;
  input: TariffInput;
  slabLines: SlabLine[];
  chargeLines: ChargeLine[];
  subtotalPaise: Paise;
  totalSubsidyPaise: Paise;
  minimumChargeAdjustmentPaise: Paise;
  estimatedPayablePaise: Paise;
  warnings: string[];
};

export type TariffCalculationFailure = { ok: false; errors: string[] };
export type TariffCalculationSuccess = { ok: true; value: TariffCalculation };
export type TariffCalculationResult = TariffCalculationFailure | TariffCalculationSuccess;

'use client';

import { useMemo, useState } from 'react';
import { DISCOM_DIRECTORY_SOURCES, discomsForState, findDiscom } from '@/data/discom-directory';
import { INDIA_REGIONS } from '@/lib/india-regions';
import { calculateTariffBill, formatPaise } from '@/lib/tariffs/calculator';
import { tariffForDiscom } from '@/lib/tariffs/registry';
import type { TariffCalculation, TariffCalculationResult, TariffRecord } from '@/lib/tariffs/types';

function parseMilliKva(value: string): number | undefined {
  const match = /^(\d+)(?:\.(\d{1,3}))?$/.exec(value.trim());
  if (!match) return undefined;
  return Number(match[1]) * 1000 + Number((match[2] || '').padEnd(3, '0'));
}

export function TariffEstimator() {
  const [stateId, setStateId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [asOfDate, setAsOfDate] = useState('');
  const [units, setUnits] = useState('');
  const [days, setDays] = useState('30');
  const [load, setLoad] = useState('2.7');
  const [result, setResult] = useState<TariffCalculationResult | null>(null);
  const providers = useMemo(() => discomsForState(stateId), [stateId]);
  const selectedProvider = findDiscom(providerId);
  const selected = tariffForDiscom(stateId, providerId);
  const loadIsKw = selected?.fixedCharge?.basis === 'per-kw-per-billing-period';

  function selectState(nextState: string) {
    setStateId(nextState);
    setProviderId('');
    setResult(null);
  }

  function calculate() {
    const consumptionKwh = Number(units);
    const billingDays = Number(days);
    const parsedLoad = parseMilliKva(load);
    setResult(calculateTariffBill(selected, {
      asOfDate,
      consumptionKwh,
      billingDays,
      sanctionedLoadMilliKva: loadIsKw ? undefined : parsedLoad,
      sanctionedLoadMilliKw: loadIsKw ? parsedLoad : undefined,
    }));
  }

  const hasProvider = Boolean(stateId && providerId);
  const requiresLoad = Boolean(selected?.fixedCharge?.basis);

  return <section id="tariff-estimate" className="screen-only mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
    <div className="rounded-3xl border border-hairline bg-white p-6 shadow-product sm:p-8">
      <div className="max-w-2xl"><span className="inline-flex rounded-full bg-[#e6f0ff] px-2 py-1 text-xs font-semibold text-cobalt">Tariff bill estimate</span><h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-.03em] text-ink sm:text-[48px]">Let&apos;s estimate your next bill.</h2><p className="mt-3 text-base leading-7 text-slate">Answer one short step at a time. You only need your provider, expected units and billing period.</p></div>
      <ol className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3" aria-label="Estimate steps"><li className={`bg-white px-4 py-3 text-sm font-semibold ${stateId ? 'text-cobalt' : 'text-ink'}`}><span className="mr-2 text-signal">1</span>Where do you live?</li><li className={`bg-white px-4 py-3 text-sm font-semibold ${hasProvider ? 'text-cobalt' : 'text-slate'}`}><span className="mr-2 text-signal">2</span>How much will you use?</li><li className={`bg-white px-4 py-3 text-sm font-semibold ${result ? 'text-cobalt' : 'text-slate'}`}><span className="mr-2 text-signal">3</span>See your estimate</li></ol>
      <div className="mt-6 grid gap-5 lg:grid-cols-[.82fr_1.18fr]">
        <div className="rounded-2xl bg-pebble p-5"><p className="text-xs font-semibold uppercase tracking-[.14em] text-signal">Step 1</p><h3 className="mt-2 text-xl font-bold tracking-[-.03em] text-ink">Your electricity provider</h3><p className="mt-2 text-sm leading-6 text-slate">Pick the State or UT on your bill, then choose the provider name printed there.</p><div className="mt-5 space-y-4"><EstimatorSelect id="tariff-state" label="State / Union Territory" value={stateId} onChange={selectState}><option value="">Choose your State or UT</option><optgroup label="States">{INDIA_REGIONS.states.map((region) => <option key={region} value={region === 'West Bengal' ? 'west-bengal' : region.toLowerCase().replaceAll(' ', '-')}>{region}</option>)}</optgroup><optgroup label="Union Territories">{INDIA_REGIONS.unionTerritories.map((region) => <option key={region} value={region.toLowerCase().replaceAll(' ', '-')}>{region}</option>)}</optgroup></EstimatorSelect>{stateId && <EstimatorSelect id="tariff-discom" label="Provider shown on your bill" value={providerId} onChange={(value) => { setProviderId(value); setResult(null); }} disabled={!providers.length}><option value="">{providers.length ? 'Choose your provider' : 'No provider listed'}</option>{providers.map((provider) => { const tariff = tariffForDiscom(stateId, provider.id); return <option key={provider.id} value={provider.id}>{provider.shortName ? `${provider.shortName} — ${provider.name}` : provider.name}{tariff?.verification === 'verified' ? ' — estimate ready' : tariff?.verification === 'source-linked' ? ' — source-linked estimate' : ' — tariff pending'}</option>; })}</EstimatorSelect>}</div></div>
        <div className={`rounded-2xl border border-hairline p-5 transition ${hasProvider ? 'bg-white' : 'bg-pebble/60 opacity-65'}`}><p className="text-xs font-semibold uppercase tracking-[.14em] text-signal">Step 2</p><h3 className="mt-2 text-xl font-bold tracking-[-.03em] text-ink">Your expected use</h3><p className="mt-2 text-sm leading-6 text-slate">Enter the units you expect to use. A recent bill is a good place to find this number.</p>{hasProvider ? <><div className="mt-5 grid gap-4 sm:grid-cols-2"><Input id="tariff-units" label="Expected electricity units (kWh)" value={units} onChange={setUnits} type="number" min="0" step="1" placeholder="For example: 376" /><Input id="tariff-days" label="Billing period (days)" value={days} onChange={setDays} type="number" min="1" step="1" />{requiresLoad && <Input id="tariff-load" label={`Sanctioned load (${loadIsKw ? 'kW' : 'KVA'})`} value={load} onChange={setLoad} type="text" placeholder={loadIsKw ? 'For example: 2.5' : 'For example: 2.7'} />}</div><details className="mt-4 text-sm text-slate"><summary className="cursor-pointer font-semibold text-cobalt">Add a bill date (optional)</summary><div className="mt-3 max-w-xs"><Input id="tariff-date" label="Bill / consumption date" value={asOfDate} onChange={setAsOfDate} type="date" /></div></details><button type="button" onClick={calculate} className="mt-6 w-full rounded-lg bg-signal px-5 py-3 text-base font-semibold text-white shadow-product transition hover:bg-cobalt">Show my bill estimate <span aria-hidden>→</span></button></> : <div className="mt-6 rounded-xl border border-dashed border-hairline bg-white/70 p-4 text-sm leading-6 text-slate">Choose your State and provider first. We will then show only the inputs needed for that tariff.</div>}</div>
      </div>
      {selected ? <TariffProvenance tariff={selected} /> : selectedProvider ? <ProviderDirectoryNote providerName={selectedProvider.name} /> : null}
      {result && <TariffResult result={result} />}
    </div>
  </section>;
}

function TariffProvenance({ tariff }: { tariff: TariffRecord }) {
  return <div className="mt-7 border-t border-hairline pt-5 text-xs leading-5 text-slate"><b className="text-ink">Tariff record:</b> {tariff.categoryName} · {tariff.consumerSubgroup} · {tariff.effectiveFrom ? `effective from ${tariff.effectiveFrom}` : 'effective period not independently normalised'}. <a className="font-semibold text-cobalt underline" href={tariff.source.url} target="_blank" rel="noreferrer">{tariff.source.title}</a> · {tariff.source.reference} · last checked {tariff.source.verifiedOn}.</div>;
}

function ProviderDirectoryNote({ providerName }: { providerName: string }) {
  const primary = DISCOM_DIRECTORY_SOURCES[0];
  return <div className="mt-7 border-t border-hairline pt-5 text-xs leading-5 text-slate"><b className="text-ink">Provider directory:</b> {providerName} is listed from the official cross-state utility directory. <a className="font-semibold text-cobalt underline" href={primary.url} target="_blank" rel="noreferrer">{primary.title}</a> · {primary.reference} · directory checked {primary.verifiedOn}. <span className="font-semibold text-[#76511c]">Its tariff schedule has not yet been verified for calculation.</span></div>;
}

function TariffResult({ result }: { result: TariffCalculationResult }) {
  if (!result.ok) return <div role="alert" className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"><b>This estimate cannot be calculated yet.</b><ul className="mt-1 list-disc pl-5">{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div>;
  return <Breakdown calculation={result.value} />;
}

function Breakdown({ calculation }: { calculation: TariffCalculation }) {
  const { tariff, input, slabLines, chargeLines } = calculation;
  return <div aria-live="polite" className="mt-7 border-t border-hairline pt-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-signal">Estimated payable amount</p><p className="mt-1 text-4xl font-bold tracking-[-.05em] text-ink">{formatPaise(calculation.estimatedPayablePaise)}</p><p className="mt-1 text-sm text-slate">{tariff.stateName} · {tariff.discomName} · {input.consumptionKwh} kWh over {input.billingDays} days</p></div><span className="rounded-full bg-[#e6f0ff] px-3 py-1.5 text-xs font-semibold text-cobalt">{tariff.verification === 'verified' ? 'Verified tariff record' : 'Source-linked estimate'}</span></div>
    <div className="mt-6 overflow-x-auto rounded-2xl border border-hairline"><table className="min-w-full text-left text-sm"><caption className="sr-only">Slab-wise energy charge calculation</caption><thead className="bg-pebble text-xs font-semibold text-slate"><tr><th className="px-4 py-3">Slab</th><th className="px-4 py-3 text-right">Units</th><th className="px-4 py-3 text-right">Rate</th><th className="px-4 py-3 text-right">Amount</th></tr></thead><tbody>{slabLines.length ? slabLines.map((line) => <tr key={line.label} className="border-t border-hairline"><td className="px-4 py-3 text-ink">{line.label}</td><td className="px-4 py-3 text-right text-slate">{line.unitsKwh}</td><td className="px-4 py-3 text-right text-slate">{formatPaise(BigInt(line.ratePaisePerKwh))}/kWh</td><td className="px-4 py-3 text-right font-semibold text-ink">{formatPaise(line.amountPaise)}</td></tr>) : <tr><td className="px-4 py-3 text-slate" colSpan={4}>No energy consumption entered.</td></tr>}</tbody></table></div>
    <dl className="mt-5 divide-y divide-hairline rounded-2xl border border-hairline px-4">{chargeLines.map((line) => <div key={line.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"><div><dt className="font-semibold text-ink">{line.label} {line.status !== 'included' && <span className="ml-1 text-xs font-medium text-slate">({line.status.replaceAll('-', ' ')})</span>}</dt><dd className="text-xs leading-5 text-slate">{line.basis}</dd></div><dd className={`shrink-0 font-semibold ${line.status === 'unknown' || line.status === 'depends-on-input' ? 'text-slate' : 'text-ink'}`}>{line.amountPaise == null ? '—' : formatPaise(line.amountPaise)}</dd></div>)}</dl>
    {calculation.warnings.length > 0 && <div className="mt-5 rounded-2xl bg-[#fff8e8] p-4 text-sm leading-6 text-[#76511c]"><b>What this estimate does not include</b><ul className="mt-1 list-disc pl-5">{calculation.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}
    <p className="mt-5 text-xs leading-5 text-slate">Estimate only. Your actual bill can differ because of current-month adjustments, arrears, deposits, payment rebates, taxes, meter readings, supplier rounding and other bill-specific items.</p>
  </div>;
}

function Input({ id, label, value, onChange, type, min, step, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; type: string; min?: string; step?: string; placeholder?: string }) {
  return <label className="block text-sm font-medium text-ink" htmlFor={id}><span className="mb-2 block">{label}</span><input id={id} type={type} min={min} step={step} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-hairline bg-pebble px-3 py-3 outline-none placeholder:text-mist focus:border-signal focus:bg-white" /></label>;
}

function EstimatorSelect({ id, label, value, onChange, children, disabled = false }: { id: string; label: string; value: string; onChange: (value: string) => void; children: React.ReactNode; disabled?: boolean }) {
  return <label className="block text-sm font-medium text-ink" htmlFor={id}><span className="mb-2 block">{label}</span><select id={id} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="w-full rounded-lg border border-hairline bg-pebble px-3 py-3 outline-none focus:border-signal focus:bg-white disabled:cursor-not-allowed disabled:opacity-70">{children}</select></label>;
}

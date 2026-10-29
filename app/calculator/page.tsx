'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createWorker } from 'tesseract.js';
import { parseBillText } from '@/lib/bill-parser';
import { estimateBillTotals, type Appliance } from '@/lib/calculations';
import { createLocalReport, type ReportInput, type SavingsReport } from '@/lib/report';
import { INDIA_REGIONS, INDIA_REGIONS_SOURCE } from '@/lib/india-regions';
import { TariffEstimator } from './TariffEstimator';
import { SiteHeader } from '@/components/SiteHeader';

if (typeof window !== 'undefined') pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();

type BillFields = { region: string; amount: string; units: string; billingDays: string; provider: string; billDate: string };
type ApplianceForm = Omit<Appliance, 'id'> & { id: string };
const initialAppliances: ApplianceForm[] = [
  { id: 'ac', name: 'Air conditioner', watts: 1200, quantity: 1, hoursPerDay: 5, daysPerMonth: 30, reduceHoursPerDay: 1 },
  { id: 'fridge', name: 'Refrigerator', watts: 180, quantity: 1, hoursPerDay: 8, daysPerMonth: 30, reduceHoursPerDay: 0 },
  { id: 'geyser', name: 'Geyser', watts: 2000, quantity: 1, hoursPerDay: 0.5, daysPerMonth: 30, reduceHoursPerDay: 0.1 },
  { id: 'fans', name: 'Ceiling fan', watts: 70, quantity: 3, hoursPerDay: 10, daysPerMonth: 30, reduceHoursPerDay: 0 },
];
const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.max(0, value));
const number = (value: string, fallback = 0) => value.trim() === '' || !Number.isFinite(Number(value)) ? fallback : Number(value);

export default function Home() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fields, setFields] = useState<BillFields>({ region: 'West Bengal', amount: '', units: '', billingDays: '30', provider: 'CESC', billDate: '' });
  const [rate, setRate] = useState('8');
  const [appliances, setAppliances] = useState<ApplianceForm[]>(initialAppliances);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<SavingsReport | null>(null);

  const enteredAmount = number(fields.amount);
  const enteredUnits = number(fields.units);
  const days = Math.max(1, number(fields.billingDays, 30));
  // State tariffs vary by DISCOM, customer category, slab, fixed charge and subsidy.
  // Use the customer's own billed average when it is available.
  const effectiveRate = enteredUnits > 0 && enteredAmount > 0 ? enteredAmount / enteredUnits : number(rate, 0);
  const totals = useMemo(() => estimateBillTotals(appliances, effectiveRate), [appliances, effectiveRate]);
  const billRate = enteredUnits > 0 ? enteredAmount / enteredUnits : 0;
  const coverage = enteredUnits > 0 ? (totals.totalKwh / enteredUnits) * 100 : 0;
  const validBill = enteredAmount > 0 && enteredUnits > 0;

  const reportInput = (): ReportInput => ({
    region: fields.region, amount: enteredAmount, units: enteredUnits, billingDays: days, provider: fields.provider, billDate: fields.billDate,
    rate: effectiveRate, applianceKwh: totals.totalKwh, applianceCost: totals.totalEstimatedCost, potentialSavings: totals.potentialMonthlySavings,
    actions: totals.estimates.map((item) => ({ name: item.appliance.name, monthlyKwh: item.monthlyKwh, savedKwh: item.savedKwh, savedCost: item.savedCost, reduceHours: item.appliance.reduceHoursPerDay })),
  });

  async function extractPdf(file: File): Promise<string> {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const text: string[] = [];
    for (let pageNo = 1; pageNo <= Math.min(pdf.numPages, 5); pageNo++) {
      setProgress(`Reading page ${pageNo} of ${Math.min(pdf.numPages, 5)}…`);
      const content = await (await pdf.getPage(pageNo)).getTextContent();
      text.push(content.items.map((item) => 'str' in item ? item.str : '').join(' '));
    }
    if (text.join('').trim().length >= 12) return text.join('\n');
    throw new Error('This PDF has no readable text layer. Upload a clear bill image or enter the numbers below.');
  }

  async function extractImage(file: File): Promise<string> {
    const worker = await createWorker('eng', 1, { logger: (message) => message.status === 'recognizing text' && setProgress(`Reading image… ${Math.round((message.progress || 0) * 100)}%`) });
    try { return (await worker.recognize(file)).data.text; } finally { await worker.terminate(); }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(''); setNotes([]); setIsReading(true); setFileName(file.name); setProgress('Preparing your bill…');
    try {
      if (file.size > 15 * 1024 * 1024) throw new Error('Choose a file under 15 MB.');
      let text: string;
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) text = await extractPdf(file);
      else if (file.type.startsWith('image/')) text = await extractImage(file);
      else throw new Error('Use a PDF, JPG, PNG or WebP file.');
      const parsed = parseBillText(text);
      setFields((current) => ({ ...current, amount: parsed.amount == null ? current.amount : String(parsed.amount), units: parsed.units == null ? current.units : String(parsed.units), billingDays: parsed.billingDays == null ? current.billingDays : String(parsed.billingDays), provider: parsed.provider || current.provider, billDate: parsed.billDate || current.billDate }));
      setNotes(parsed.notes);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'We could not read that file.'); }
    finally { setIsReading(false); setProgress(''); event.target.value = ''; }
  }

  function updateField(key: keyof BillFields, value: string) { setFields((old) => ({ ...old, [key]: value })); setReport(null); }
  function updateAppliance(id: string, key: keyof ApplianceForm, value: string) { setAppliances((items) => items.map((item) => item.id === id ? { ...item, [key]: key === 'name' ? value : number(value) } : item)); setReport(null); }
  function addAppliance() { setAppliances((items) => [...items, { id: `item-${Date.now()}`, name: 'New appliance', watts: 100, quantity: 1, hoursPerDay: 1, daysPerMonth: days, reduceHoursPerDay: 0 }]); }
  function removeAppliance(id: string) { setAppliances((items) => items.filter((item) => item.id !== id)); setReport(null); }

  async function generateReport() {
    const payload = reportInput();
    setIsGenerating(true);
    try {
      const response = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json() as { report?: SavingsReport };
      setReport(data.report || createLocalReport(payload));
    } catch { setReport(createLocalReport(payload)); }
    finally { setIsGenerating(false); }
  }

  return <main className="atmosphere relative overflow-hidden pb-16">
    <SiteHeader page="calculator" className="screen-only" />

    <section id="top" className="screen-only mx-auto grid max-w-[1200px] gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:pt-20">
      <div><span className="inline-flex rounded-full bg-[#e6f0ff] px-2 py-1 text-xs font-semibold text-cobalt">A clearer look at your electricity bill</span><h1 className="mt-5 max-w-[600px] text-5xl font-bold leading-[1.13] tracking-[-.04em] text-ink sm:text-[68px]">Spend less energy. <span className="text-signal">See why.</span></h1><p className="mt-6 max-w-[510px] text-lg leading-7 text-slate">Turn a utility bill and your everyday appliance habits into a specific, printable savings plan. No vague promises—just the figures you confirm.</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => fileInput.current?.click()} className="rounded-lg bg-signal px-5 py-3 text-base font-semibold text-white shadow-product">Upload your bill</button><a href="#usage" className="rounded-lg border border-hairline bg-white px-5 py-3 text-base font-semibold text-ink">Enter manually</a></div></div>
      <div className="report-grid relative rounded-3xl border border-hairline bg-white p-5 shadow-product sm:p-8"><div className="absolute -right-6 -top-8 -z-10 h-36 w-36 rounded-full bg-[#e55cff]/35 blur-2xl" /><div className="absolute -bottom-7 -left-7 -z-10 h-32 w-32 rounded-full bg-[#0099ff]/30 blur-2xl" /><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate">Monthly energy snapshot</span><span className="rounded-full bg-[#e6f0ff] px-2 py-1 text-xs font-semibold text-cobalt">Live calculation</span></div><div className="mt-7 grid gap-3 sm:grid-cols-3"><Snapshot label="Bill total" value={enteredAmount ? money(enteredAmount) : '—'} /><Snapshot label="Billed use" value={enteredUnits ? `${enteredUnits} kWh` : '—'} /><Snapshot label="Possible cut" value={totals.potentialMonthlySavings ? money(totals.potentialMonthlySavings) : '—'} accent /></div><div className="mt-6 border-t border-hairline pt-5"><p className="text-sm font-semibold text-ink">Your plan builds from three checks</p><div className="mt-4 grid gap-3 text-sm text-slate sm:grid-cols-3"><span><b className="mr-1 text-signal">01</b>Verify bill data</span><span><b className="mr-1 text-signal">02</b>Map major loads</span><span><b className="mr-1 text-signal">03</b>Print next steps</span></div></div></div>
    </section>

    <input ref={fileInput} className="sr-only" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={handleFile} />
    <TariffEstimator />
    <section id="bill" className="screen-only mx-auto max-w-[1200px] px-5 py-8 sm:px-8">
      <SectionIntro eyebrow="01 / Bill details" title="Start with the bill, not a guess." body="Choose your location, upload a bill to extract likely values, then review every field before calculation." />
      <div className="mt-9 grid gap-6 lg:grid-cols-[.76fr_1.24fr]">
        <div className="rounded-3xl border border-hairline bg-white p-6 shadow-product"><p className="font-semibold text-ink">Bring in your bill</p><p className="mt-2 text-sm leading-6 text-slate">PDF, JPG, PNG or WebP. Reading happens in your browser; no bill file is sent to the report service.</p><button onClick={() => fileInput.current?.click()} disabled={isReading} className="mt-5 flex min-h-32 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-signal/40 bg-pebble p-4 text-center text-sm font-semibold text-signal transition hover:bg-[#e6f0ff] disabled:opacity-60"><span className="mb-2 text-2xl">↑</span>{isReading ? progress : fileName ? `Replace ${fileName}` : 'Choose bill file'}</button>{error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notes.length > 0 && <div className="mt-3 rounded-lg bg-[#e6f0ff] p-3 text-xs leading-5 text-cobalt"><b>Review before use</b>{notes.map((note) => <p key={note}>• {note}</p>)}</div>}</div>
        <div className="rounded-3xl border border-hairline bg-white p-6 shadow-product"><div className="flex items-center justify-between"><p className="font-semibold text-ink">Confirm the figures</p><span className="text-xs text-slate">All fields are editable</span></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><RegionSelect value={fields.region} onChange={(v) => updateField('region', v)} /><Field label="Electricity provider" value={fields.provider} onChange={(v) => updateField('provider', v)} placeholder="e.g. CESC" /><Field label="Total bill (₹)" value={fields.amount} onChange={(v) => updateField('amount', v)} type="number" placeholder="2,800" /><Field label="Billed units (kWh)" value={fields.units} onChange={(v) => updateField('units', v)} type="number" placeholder="320" /><Field label="Billing days" value={fields.billingDays} onChange={(v) => updateField('billingDays', v)} type="number" /><Field label="Bill date" value={fields.billDate} onChange={(v) => updateField('billDate', v)} placeholder="12/10/2026" /><Field label="Fallback rate (₹/kWh)" value={rate} onChange={(v) => { setRate(v); setReport(null); }} type="number" step="0.1" /></div><p className="mt-4 text-xs leading-5 text-slate">The State / UT list comes from the <a className="font-semibold text-cobalt underline" href={INDIA_REGIONS_SOURCE} target="_blank" rel="noreferrer">National Portal of India</a>. When total bill and billed units are entered, calculations use your actual all-in bill average ({billRate > 0 ? `${money(billRate)}/kWh` : 'enter bill figures to calculate'}). The fallback rate is used only until then; tariffs differ by provider, category and slab.</p>{validBill && <div className="mt-5 grid gap-3 sm:grid-cols-3"><Stat label="Bill average used" value={`${money(billRate)}/kWh`} /><Stat label="Daily use" value={`${(enteredUnits / days).toFixed(1)} kWh`} /><Stat label="Appliance coverage" value={`${coverage.toFixed(0)}%`} /></div>}</div>
      </div>
    </section>

    <section id="usage" className="screen-only mx-auto max-w-[1200px] px-5 py-16 sm:px-8"><SectionIntro eyebrow="02 / Home usage" title="Make the biggest loads visible." body="Use realistic hours, then set only the reductions you could genuinely sustain." /><div className="mt-9 rounded-3xl border border-hairline bg-white p-4 shadow-product sm:p-6"><div className="hidden grid-cols-[1.25fr_.65fr_.55fr_.7fr_.7fr_.7fr_32px] gap-3 border-b border-hairline px-3 pb-3 text-xs font-semibold text-slate lg:grid"><span>Appliance</span><span>Watts</span><span>Qty</span><span>Hours / day</span><span>Days / month</span><span>Reduce / day</span><span /></div><div className="space-y-3 pt-3">{appliances.map((item) => <ApplianceRow key={item.id} item={item} estimate={totals.estimates.find((entry) => entry.appliance.id === item.id)} onChange={updateAppliance} onRemove={removeAppliance} />)}</div><button onClick={addAppliance} className="mt-4 w-full rounded-lg border border-hairline bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-pebble">+ Add another appliance</button></div></section>

    <section id="report" className="screen-only mx-auto max-w-[1200px] px-5 pb-10 sm:px-8"><div className="rounded-3xl bg-ink p-7 text-white shadow-product sm:p-10"><div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end"><div><span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-white/80">03 / Savings report</span><h2 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">Ready when your inputs are.</h2><p className="mt-4 max-w-xl text-base leading-7 text-white/70">Generate a narrated report from the numbers above, then save its dedicated print layout as a professional PDF.</p></div><div className="grid grid-cols-2 gap-3"><DarkMetric label="Modelled usage" value={`${totals.totalKwh.toFixed(1)} kWh`} /><DarkMetric label="Scenario saving" value={`${money(totals.potentialMonthlySavings)}/mo`} /></div></div><div className="mt-8 flex flex-wrap gap-3"><button onClick={generateReport} disabled={isGenerating} className="rounded-lg bg-signal px-5 py-3 text-base font-semibold text-white shadow-product disabled:opacity-60">{isGenerating ? 'Writing your report…' : 'Generate savings report'}</button>{report && <button onClick={() => window.print()} className="rounded-lg border border-white/35 px-5 py-3 text-base font-semibold text-white">Save clean PDF</button>}</div></div></section>

    <SavingsReport report={report} fields={fields} amount={enteredAmount} units={enteredUnits} billRate={billRate} days={days} totals={totals} />
    <footer className="screen-only mx-auto mt-12 flex max-w-[1200px] flex-col justify-between gap-2 border-t border-hairline px-5 pt-6 text-xs text-slate sm:px-8 md:flex-row"><span>© {new Date().getFullYear()} BijliBudget</span><span>Estimates first. Verify before you spend.</span></footer>
  </main>;
}

function SavingsReport({ report, fields, amount, units, billRate, days, totals }: { report: SavingsReport | null; fields: BillFields; amount: number; units: number; billRate: number; days: number; totals: ReturnType<typeof estimateBillTotals> }) {
  if (!report) return null;
  return <section id="print-report" className="one-page-report mx-auto mb-10 max-w-[1200px] rounded-3xl border border-hairline bg-white p-6 shadow-product sm:p-8">
    <div className="flex items-start justify-between gap-4 border-b border-hairline pb-5"><div><div className="flex items-center gap-2 font-bold text-ink"><span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-white">ϟ</span>BijliBudget</div><p className="mt-4 text-[10px] font-semibold uppercase tracking-[.16em] text-slate">Electricity savings summary</p><h2 className="mt-1 max-w-xl text-2xl font-bold leading-tight text-ink sm:text-[30px]">{report.headline}</h2></div><div className="text-right text-[11px] leading-5 text-slate"><p className="font-semibold text-ink">{fields.region}</p><p>{fields.provider || 'Provider not supplied'}</p><p>{fields.billDate || 'Date not supplied'} · {days} days</p></div></div>
    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"><Stat label="Bill" value={amount ? money(amount) : '—'} /><Stat label="Use" value={units ? `${units.toFixed(0)} kWh` : '—'} /><Stat label="Average" value={units ? `${money(billRate)}/kWh` : '—'} /><Stat label="Target cut" value={`${money(totals.potentialMonthlySavings)}/mo`} /></div>
    <div className="mt-6 grid gap-6 md:grid-cols-[.82fr_1.18fr]"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-signal">Key findings</p><ul className="mt-3 space-y-2">{report.observations.slice(0, 3).map((item) => <li key={item} className="border-l-2 border-signal pl-3 text-xs leading-5 text-slate">{item}</li>)}</ul></div><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-signal">Do these first</p><div className="mt-3 space-y-2">{report.actions.slice(0, 3).map((action, index) => <div key={`${action.title}-${index}`} className="flex items-start justify-between gap-3 rounded-lg border border-hairline px-3 py-2.5"><div className="min-w-0"><p className="text-xs font-semibold text-ink">{index + 1}. {action.title}</p><p className="mt-0.5 text-[11px] leading-4 text-slate">{action.detail}</p></div><span className="shrink-0 text-xs font-bold text-signal">{action.saving}</span></div>)}</div></div></div>
    <p className="mt-5 border-t border-hairline pt-3 text-[10px] leading-4 text-slate"><b className="text-ink">Estimate only:</b> {report.caveat}</p>
  </section>;
}

function ApplianceRow({ item, estimate, onChange, onRemove }: { item: ApplianceForm; estimate: ReturnType<typeof estimateBillTotals>['estimates'][number] | undefined; onChange: (id: string, key: keyof ApplianceForm, value: string) => void; onRemove: (id: string) => void }) { return <div className="rounded-2xl border border-hairline bg-white p-3 lg:grid lg:grid-cols-[1.25fr_.65fr_.55fr_.7fr_.7fr_.7fr_32px] lg:items-center lg:gap-3 lg:border-0 lg:bg-transparent"><div><input aria-label="Appliance name" value={item.name} onChange={(e) => onChange(item.id, 'name', e.target.value)} className="w-full bg-transparent font-semibold text-ink outline-none" /><p className="mt-1 text-xs text-slate">{estimate?.monthlyKwh.toFixed(1) || '0.0'} kWh · {money(estimate?.monthlyCost || 0)}/month</p></div><Compact label="Watts" value={item.watts} onChange={(v) => onChange(item.id, 'watts', v)} /><Compact label="Qty" value={item.quantity} onChange={(v) => onChange(item.id, 'quantity', v)} /><Compact label="Hours/day" value={item.hoursPerDay} step="0.25" onChange={(v) => onChange(item.id, 'hoursPerDay', v)} /><Compact label="Days/month" value={item.daysPerMonth} onChange={(v) => onChange(item.id, 'daysPerMonth', v)} /><Compact label="Reduce/day" value={item.reduceHoursPerDay} step="0.25" onChange={(v) => onChange(item.id, 'reduceHoursPerDay', v)} /><button onClick={() => onRemove(item.id)} className="mt-3 text-sm text-slate hover:text-signal lg:mt-0" aria-label={`Remove ${item.name}`}>×</button></div>; }
function Compact({ label, value, onChange, step }: { label: string; value: number; onChange: (value: string) => void; step?: string }) { return <label className="mt-3 block text-xs text-slate lg:mt-0"><span className="lg:hidden">{label}</span><input aria-label={label} type="number" min="0" step={step} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-hairline bg-pebble px-2 py-2 text-sm text-ink outline-none focus:border-signal lg:mt-0" /></label>; }
function Field({ label, value, onChange, type = 'text', placeholder, step }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; step?: string }) { return <label className="block text-sm font-medium text-ink"><span className="mb-2 block">{label}</span><input type={type} min={type === 'number' ? 0 : undefined} step={step} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-hairline bg-pebble px-3 py-3 outline-none placeholder:text-mist focus:border-signal focus:bg-white" /></label>; }
function RegionSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <label className="block text-sm font-medium text-ink"><span className="mb-2 block">State / Union Territory</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-hairline bg-pebble px-3 py-3 outline-none focus:border-signal focus:bg-white"><optgroup label="States">{INDIA_REGIONS.states.map((region) => <option key={region}>{region}</option>)}</optgroup><optgroup label="Union Territories">{INDIA_REGIONS.unionTerritories.map((region) => <option key={region}>{region}</option>)}</optgroup></select></label>; }
function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) { return <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.16em] text-signal">{eyebrow}</p><h2 className="mt-3 text-4xl font-bold leading-tight tracking-[-.03em] text-ink sm:text-[50px]">{title}</h2><p className="mt-4 text-base leading-7 text-slate">{body}</p></div>; }
function Snapshot({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div className={`rounded-2xl p-4 ${accent ? 'bg-signal text-white' : 'border border-hairline bg-white'}`}><p className={`text-xs ${accent ? 'text-white/75' : 'text-slate'}`}>{label}</p><p className="mt-2 text-xl font-bold">{value}</p></div>; }
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-pebble p-3"><p className="text-xs text-slate">{label}</p><p className="mt-1 font-bold text-ink">{value}</p></div>; }
function DarkMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white/10 p-4"><p className="text-xs text-white/65">{label}</p><p className="mt-1 text-lg font-bold">{value}</p></div>; }

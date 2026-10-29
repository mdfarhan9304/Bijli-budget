import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'Electricity Bill Calculator India | Estimate Home Power Costs | BijliBudget',
  description: 'Estimate household electricity use, understand your bill average, and find practical ways to reduce power costs with BijliBudget’s free India electricity bill calculator.',
  keywords: ['electricity bill calculator India', 'home electricity calculator', 'calculate electricity consumption', 'appliance electricity cost calculator', 'bijli bill calculator'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Electricity Bill Calculator India | BijliBudget',
    description: 'Turn your electricity bill and appliance habits into a practical savings plan.',
    type: 'website',
  },
};

const steps = [
  ['01', 'Choose your place', 'Pick any Indian State or Union Territory, then name the electricity provider shown on your bill.'],
  ['02', 'Add bill figures', 'Enter the total bill and billed units. We calculate your real all-in average ₹/kWh.'],
  ['03', 'Find the big loads', 'Model appliances and test a realistic reduction. See the kWh and monthly estimate immediately.'],
];

const features = [
  ['01', 'Official tariff estimate', 'Choose your State or UT, provider and domestic connection. When an applicable tariff record is available, see slab-wise energy charges and every included charge with its source.'],
  ['02', 'Bill upload and reading', 'Upload a bill to capture useful figures, or enter the total and units yourself. You stay in control of every input before it is used.'],
  ['03', 'Your effective unit rate', 'Convert your own billed amount and kWh into an all-in ₹/kWh rate—more personal than a generic state average.'],
  ['04', 'Appliance cost planner', 'Add appliances, wattage, quantity and daily use to see their estimated monthly consumption and cost side by side.'],
  ['05', 'Savings scenarios', 'Reduce usage by a realistic amount and immediately compare the projected kWh and monthly saving for each appliance.'],
  ['06', 'Shareable home report', 'Generate a clear savings summary from your confirmed figures, then use the clean print layout to save it as a PDF.'],
] as const;

const faqs = [
  ['How do I calculate my electricity bill average?', 'Divide the total bill amount by the billed units (kWh). For example, a ₹2,400 bill for 300 units has an all-in average of ₹8 per kWh. BijliBudget does this automatically when you enter both figures.'],
  ['Does the calculator work for every Indian state?', 'Yes. You can select all 28 States and 8 Union Territories. The tool uses your own bill data, which is more useful than one generic state rate because tariffs can differ by DISCOM, slab, customer type, fixed charges and subsidy.'],
  ['Can this calculate an exact future electricity bill?', 'It is a planning calculator, not an official bill. Your supplier’s tariff schedule, taxes, fixed charges, meter readings and appliance duty cycles can change the final bill.'],
];

export default function MarketingHome() {
  return <main className="landing-shell overflow-hidden bg-cloud text-ink">
    <SiteHeader page="landing" />

    <section className="relative mx-auto grid max-w-[1200px] gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:pt-20">
      <div className="relative z-10"><p className="landing-reveal inline-flex items-center gap-2 rounded-full bg-[#e6f0ff] px-3 py-1.5 text-xs font-semibold text-cobalt"><span className="h-2 w-2 rounded-full bg-signal" /> Built for Indian home bills</p><h1 className="landing-reveal mt-6 max-w-[670px] text-5xl font-bold leading-[1.08] tracking-[-.05em] text-ink sm:text-[68px]">Your electricity bill is a clue. <span className="text-signal">Read it.</span></h1><p className="landing-reveal mt-6 max-w-[570px] text-lg leading-8 text-slate">A free electricity bill calculator for Indian homes. See what each appliance could cost, use your own billed rate, and make a savings plan that feels possible.</p><div className="landing-reveal mt-8 flex flex-wrap gap-3"><Link href="/calculator" className="rounded-lg bg-signal px-6 py-3.5 text-base font-semibold text-white shadow-product transition hover:-translate-y-0.5 hover:bg-cobalt">Calculate my bill <span aria-hidden>→</span></Link><a href="#how-it-works" className="rounded-lg border border-hairline bg-white px-6 py-3.5 text-base font-semibold text-ink transition hover:bg-pebble">See how it works</a></div><p className="landing-reveal mt-5 text-xs font-medium text-slate">No account. Your uploaded bill stays in your browser.</p></div>
      <div className="landing-reveal relative mx-auto w-full max-w-[500px] lg:justify-self-end"><div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#e55cff]/25 blur-2xl" /><div className="report-grid relative rounded-3xl border border-hairline bg-white p-5 shadow-product sm:p-7"><div className="flex items-center justify-between border-b border-hairline pb-5"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-slate">Bill average</p><p className="mt-1 text-4xl font-bold tracking-[-.06em] text-ink">₹8.00 <span className="text-base font-semibold text-slate">/ kWh</span></p></div><span className="rounded-full bg-[#e6f0ff] px-3 py-1.5 text-xs font-semibold text-cobalt">Your bill basis</span></div><div className="mt-6 space-y-4"><CostBar name="Air conditioner" amount="₹1,440" width="w-full" color="bg-signal" /><CostBar name="Refrigerator" amount="₹346" width="w-[38%]" color="bg-[#0099ff]" /><CostBar name="Ceiling fans" amount="₹403" width="w-[43%]" color="bg-cobalt" /></div><div className="mt-7 rounded-2xl bg-ink p-4 text-white"><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.13em] text-white/60">Try reducing AC use</p><p className="mt-1 text-2xl font-bold">Save ~₹288/mo</p></div><span className="text-2xl" aria-hidden>↘</span></div></div></div></div>
    </section>

    <section id="why-it-helps" className="border-y border-hairline bg-pebble"><div className="mx-auto grid max-w-[1200px] gap-0 px-5 sm:px-8 md:grid-cols-3">{[['36', 'States & UTs ready'], ['₹', 'Your own bill rate'], ['0', 'Account required']].map(([number, label], index) => <div key={label} className={`py-8 ${index ? 'border-t border-hairline md:border-l md:border-t-0' : ''} md:px-9`}><p className="text-5xl font-bold tracking-[-.06em] text-signal">{number}</p><p className="mt-1 text-sm font-semibold text-slate">{label}</p></div>)}</div></section>

    <section id="how-it-works" className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.16em] text-signal">A simple starting point</p><h2 className="mt-4 text-4xl font-bold tracking-[-.045em] text-ink sm:text-5xl">Less guessing. Better household decisions.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{steps.map(([number, title, body]) => <article key={number} className="rounded-3xl border border-hairline bg-white p-7 shadow-product"><p className="font-mono text-xs font-bold text-signal">{number}</p><h3 className="mt-10 text-2xl font-bold tracking-[-.04em] text-ink">{title}</h3><p className="mt-3 text-sm leading-6 text-slate">{body}</p></article>)}</div></section>

    <section id="features" className="border-y border-hairline bg-white"><div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8"><div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-signal">Everything in one place</p><h2 className="mt-4 text-4xl font-bold tracking-[-.045em] text-ink sm:text-5xl">One home energy toolkit. <span className="text-signal">Six useful views.</span></h2></div><p className="max-w-xl text-base leading-7 text-slate">Start with the question you have today—what a bill could be, what is using power, or what to reduce—and keep the answer in one practical workspace.</p></div><div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline md:grid-cols-2 lg:grid-cols-3">{features.map(([number, title, body]) => <article key={number} className="group min-h-[240px] bg-white p-7 transition hover:bg-[#f5f9ff]"><p className="font-mono text-xs font-bold text-signal">{number} / FEATURE</p><h3 className="mt-10 max-w-[250px] text-2xl font-bold leading-tight tracking-[-.04em] text-ink">{title}</h3><p className="mt-3 max-w-[310px] text-sm leading-6 text-slate">{body}</p></article>)}</div><div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-pebble px-5 py-4"><p className="text-sm font-semibold text-ink">No account required. Your appliance plan is based on figures you can review.</p><Link href="/calculator" className="text-sm font-bold text-cobalt underline decoration-signal decoration-2 underline-offset-4">Explore the calculator <span aria-hidden>→</span></Link></div></div></section>

    <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8"><div className="relative overflow-hidden rounded-3xl bg-ink px-7 py-12 text-white shadow-product sm:px-12 sm:py-16"><div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-[#0099ff]/25" /><div className="relative max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#b7dcff]">From bill to next step</p><h2 className="mt-4 text-4xl font-bold tracking-[-.045em] sm:text-5xl">The rate on your bill is more useful than a generic average.</h2><p className="mt-5 max-w-xl leading-7 text-white/70">State tariffs can vary across providers, slabs, customer categories, fixed charges and subsidies. BijliBudget starts with your entered bill amount and units, so your appliance comparisons use a rate rooted in your household.</p><Link href="/calculator" className="mt-8 inline-flex rounded-lg bg-signal px-6 py-3.5 font-semibold text-white shadow-product transition hover:bg-[#008cf0]">Start with my bill <span className="ml-2" aria-hidden>→</span></Link></div></div></section>

    <section id="questions" className="mx-auto max-w-[860px] px-5 pb-24 sm:px-8"><p className="text-xs font-semibold uppercase tracking-[.16em] text-signal">Common questions</p><h2 className="mt-4 text-4xl font-bold tracking-[-.045em] text-ink">Electricity bill calculator FAQs</h2><div className="mt-9 divide-y divide-hairline border-y border-hairline">{faqs.map(([question, answer]) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-bold tracking-[-.025em] text-ink">{question}<span className="text-2xl font-normal text-signal transition group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 leading-7 text-slate">{answer}</p></details>)}</div></section>

    <footer className="border-t border-hairline px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-4 text-sm text-slate sm:flex-row"><p><b className="text-ink">BijliBudget</b> · Practical electricity planning for Indian homes.</p><Link className="font-semibold text-ink underline decoration-signal underline-offset-4" href="/calculator">Electricity bill calculator</Link></div></footer>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'WebApplication', name: 'BijliBudget Electricity Bill Calculator', applicationCategory: 'UtilityApplication', operatingSystem: 'Web', description: 'An electricity bill calculator for Indian homes that estimates appliance costs from bill inputs.', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' } }, { '@type': 'FAQPage', mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) }] }) }} />
  </main>;
}

function CostBar({ name, amount, width, color }: { name: string; amount: string; width: string; color: string }) {
  return <div><div className="mb-1.5 flex justify-between text-sm font-semibold text-ink"><span>{name}</span><span>{amount}/mo</span></div><div className="h-2 overflow-hidden rounded-full bg-pebble"><div className={`h-full rounded-full ${width} ${color}`} /></div></div>;
}

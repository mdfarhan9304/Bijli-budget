import Link from 'next/link';

type SiteHeaderProps = { page: 'landing' | 'calculator'; className?: string };

const navigation = [
  ['Features', 'features'],
  ['Estimate bill', 'tariff-estimate'],
  ['Save energy', 'usage'],
] as const;

export function SiteHeader({ page, className = '' }: SiteHeaderProps) {
  const sectionHref = (id: string) => {
    if (id === 'features') return page === 'landing' ? '#features' : '/#features';
    return page === 'calculator' ? `#${id}` : `/calculator#${id}`;
  };

  return <header className={`mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-5 sm:px-8 ${className}`}>
    <Link href="/" className="shrink-0 flex items-center gap-2.5 font-bold text-ink" aria-label="BijliBudget home"><span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-lg text-white">ϟ</span><span>BijliBudget</span></Link>
    <nav aria-label="Primary navigation" className="ml-auto hidden items-center gap-6 text-sm font-semibold text-ink md:flex">
      {navigation.map(([label, id]) => <a key={id} href={sectionHref(id)} className="rounded-md px-1 py-2 transition hover:text-cobalt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt">{label}</a>)}
    </nav>
    <a href={sectionHref('tariff-estimate')} className="ml-auto rounded-lg bg-signal px-3.5 py-2 text-sm font-semibold text-white shadow-product transition hover:-translate-y-0.5 hover:bg-cobalt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt sm:px-4 md:ml-2">Start calculating <span aria-hidden>→</span></a>
    <details className="relative md:hidden">
      <summary className="flex h-9 cursor-pointer list-none items-center justify-center rounded-lg border border-hairline bg-white px-2.5 text-sm font-semibold text-ink transition hover:bg-pebble focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt [&::-webkit-details-marker]:hidden" aria-label="Open navigation">
        <span aria-hidden className="text-lg leading-none">☰</span><span className="sr-only">Menu</span>
      </summary>
      <nav aria-label="Mobile navigation" className="absolute right-0 top-full z-30 mt-2 w-52 rounded-2xl border border-hairline bg-white p-2 shadow-product">
        {navigation.map(([label, id]) => <a key={id} href={sectionHref(id)} className="block rounded-xl px-3 py-3 text-sm font-semibold text-ink transition hover:bg-pebble focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt">{label}</a>)}
      </nav>
    </details>
  </header>;
}

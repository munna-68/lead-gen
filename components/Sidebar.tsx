'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const NAV = [
  { href: '/', label: 'Pipeline', code: '01' },
  { href: '/prompt', label: 'Prompt', code: '02' },
  { href: '/import', label: 'Import', code: '03' },
  { href: '/skipped', label: 'Skipped', code: '04' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-ink-3 bg-ink-1 px-5 py-6 md:flex">
      <div>
        <Link href="/" className="group block">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl italic tracking-tightest text-fog-1">
              Lead
            </span>
            <span className="font-display text-2xl not-italic tracking-tightest text-amber">
              Flow
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
            <span className="h-1 w-1 animate-pulse-soft rounded-full bg-amber" />
            personal crm · v0.1
          </div>
        </Link>

        <nav className="mt-12 space-y-px">
          {NAV.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'group flex items-center justify-between border-l py-2 pl-3 pr-2 font-mono text-2xs uppercase tracking-extra-wide transition-colors',
                  active
                    ? 'border-amber text-fog-1'
                    : 'border-transparent text-fog-3 hover:border-fog-5 hover:text-fog-1'
                )}
              >
                <span className="flex items-center gap-3">
                  <span className={clsx('text-[10px]', active ? 'text-amber' : 'text-fog-4')}>
                    {item.code}
                  </span>
                  <span className="font-sans text-sm normal-case tracking-normal">
                    {item.label}
                  </span>
                </span>
                {active && <span className="text-amber">·</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-5">
        <div className="mb-2 flex items-center justify-between">
          <span>build</span>
          <span className="text-fog-3">2026.06</span>
        </div>
        <div className="flex items-center justify-between">
          <span>env</span>
          <span className="text-amber">vercel · pg</span>
        </div>
      </div>
    </aside>
  );
}

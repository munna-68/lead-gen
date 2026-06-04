'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const NAV = [
  { href: '/', label: 'Pipeline' },
  { href: '/prompt', label: 'Prompt' },
  { href: '/import', label: 'Import' },
  { href: '/skipped', label: 'Skipped' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col justify-between border-r border-border bg-background md:flex">
      <div>
        <div className="flex items-start justify-between px-6 pt-6">
          <Link href="/" className="group block">
            <div className="text-[15px] font-semibold tracking-tight text-foreground">
              LeadFlow
            </div>
            <div className="mt-0.5 font-num text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              v1.3 · personal crm
            </div>
          </Link>
          <ThemeToggle />
        </div>

        <nav className="mt-10 px-3">
          {NAV.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative block py-1.5 pl-4 pr-3 text-[13px] transition-colors',
                  active
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 bg-accent"
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-6 pb-6 font-num text-[11px] leading-relaxed text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>build</span>
          <span>2026.06</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span>env</span>
          <span>VERCEL · PG</span>
        </div>
      </div>
    </aside>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const NAV = [
  { href: '/', label: 'Pipeline', index: '01', tag: 'leads' },
  { href: '/prompt', label: 'Prompt', index: '02', tag: 'extract' },
  { href: '/import', label: 'Import', index: '03', tag: 'ingest' },
  { href: '/skipped', label: 'Skipped', index: '04', tag: 'archive' },
];

function currentSectionLabel(pathname: string): string {
  if (pathname === '/') return 'Pipeline';
  if (pathname.startsWith('/prompt')) return 'Prompt';
  if (pathname.startsWith('/import')) return 'Import';
  if (pathname.startsWith('/skipped')) return 'Skipped';
  return 'LeadFlow';
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open + close on Escape
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Reset scroll position of the menu when it opens
  useEffect(() => {
    if (open) {
      const el = document.getElementById('mobile-menu-panel');
      el?.scrollTo({ top: 0 });
    }
  }, [open]);

  const sectionLabel = currentSectionLabel(pathname);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/85 px-5 pt-safe backdrop-blur-md md:hidden',
          'supports-[backdrop-filter]:bg-background/70'
        )}
      >
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            LeadFlow
          </span>
          <span className="font-num text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            v1.3
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <span className="font-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {sectionLabel}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-surface-2"
          >
            <Menu className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </header>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className="fixed inset-0 z-[70] flex flex-col md:hidden"
        >
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px] animate-fade-in"
          />

          <div
            id="mobile-menu-panel"
            className="relative flex h-full w-full flex-col overflow-y-auto bg-background animate-slide-up pb-safe pt-safe"
          >
            <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur">
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-semibold tracking-tight text-foreground">
                  LeadFlow
                </span>
                <span className="font-num text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  v1.3 · personal crm
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-surface-2"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="flex-1 px-5 pt-8">
              <div className="font-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Navigate
              </div>
              <h2 className="mt-2 text-[40px] font-semibold leading-[1.05] tracking-tight text-foreground">
                Where to<br />next?
              </h2>

              <nav className="mt-10 -mx-1">
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                  {NAV.map((item, i) => {
                    const active =
                      item.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.href);
                    return (
                      <li
                        key={item.href}
                        style={{ animationDelay: `${80 + i * 45}ms` }}
                        className="animate-menu-in"
                      >
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'group flex items-center gap-4 px-4 py-4 transition-colors',
                            active
                              ? 'bg-accent-soft'
                              : 'hover:bg-surface-2'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-flex h-7 w-9 shrink-0 items-center justify-center rounded-sm font-num text-[11px] uppercase tracking-[0.08em]',
                              active
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-surface-2 text-muted-foreground'
                            )}
                          >
                            {item.index}
                          </span>
                          <span
                            className={cn(
                              'flex-1 text-[20px] font-semibold leading-none tracking-tight',
                              active ? 'text-accent' : 'text-foreground'
                            )}
                          >
                            {item.label}
                          </span>
                          <span className="font-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            {item.tag}
                          </span>
                          <ArrowUpRight
                            className={cn(
                              'h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
                              active ? 'text-accent' : 'text-muted-foreground'
                            )}
                            aria-hidden
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div
              className="mt-8 border-t border-border px-5 py-5"
              style={{ animationDelay: '320ms' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Appearance
                  </div>
                  <div className="mt-1 text-[13px] text-foreground">
                    Theme
                  </div>
                </div>
                <ThemeToggle className="h-10 w-10 border border-border bg-surface" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 font-num text-[11px] leading-relaxed text-muted-foreground">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                    Build
                  </div>
                  <div className="mt-1 text-foreground">2026.06</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                    Env
                  </div>
                  <div className="mt-1 text-foreground">VERCEL · PG</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

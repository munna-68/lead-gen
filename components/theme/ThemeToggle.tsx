'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground',
        className
      )}
    >
      <Sun
        className={cn(
          'h-4 w-4 transition-all',
          isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
        )}
        aria-hidden
      />
      <Moon
        className={cn(
          'absolute h-4 w-4 transition-all',
          isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
        )}
        aria-hidden
      />
    </button>
  );
}

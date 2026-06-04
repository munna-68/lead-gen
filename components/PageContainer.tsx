import * as React from 'react';
import { cn } from '@/lib/utils';

export function PageContainer({
  children,
  className,
  width = 'lg',
}: {
  children: React.ReactNode;
  className?: string;
  width?: 'lg' | 'md' | 'sm';
}) {
  const maxW =
    width === 'lg' ? 'max-w-[1200px]' : width === 'md' ? 'max-w-[1000px]' : 'max-w-[960px]';
  return (
    <div className={cn('mx-auto w-full px-5 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8', maxW, className)}>
      {children}
    </div>
  );
}

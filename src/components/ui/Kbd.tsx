import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KbdProps {
  children: ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center px-1.5 py-0.5 min-w-[22px] h-[22px]',
        'rounded-md border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm',
        'text-[11px] font-mono text-white/40 leading-none',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

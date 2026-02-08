import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'gray';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  size?: BadgeSize;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  green: 'bg-green-500/15 text-green-400 border-green-500/20',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  red: 'bg-red-500/15 text-red-400 border-red-500/20',
  gray: 'bg-white/[0.06] text-white/60 border-white/[0.08]',
};

const dotColors: Record<BadgeVariant, string> = {
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-400',
  red: 'bg-red-400',
  gray: 'bg-white/40',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  variant = 'gray',
  dot = false,
  pulse = false,
  size = 'md',
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border backdrop-blur-sm',
        variantClasses[variant],
        sizeClasses[size],
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                dotColors[variant],
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex h-2 w-2 rounded-full',
              dotColors[variant],
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}

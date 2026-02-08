import { cn } from '@/lib/utils';

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <span className="text-xs text-white/30 font-medium whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent',
        className,
      )}
    />
  );
}

import { cn } from '@/lib/utils';

type StatusType = 'working' | 'waiting' | 'done' | 'error' | 'idle';
type DotSize = 'sm' | 'md' | 'lg';

interface StatusDotProps {
  status: StatusType;
  size?: DotSize;
  pulse?: boolean;
}

const statusColors: Record<StatusType, string> = {
  working: 'bg-cyan-400',
  waiting: 'bg-yellow-400',
  done: 'bg-green-400',
  error: 'bg-red-400',
  idle: 'bg-white/25',
};

const sizeClasses: Record<DotSize, string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2.5 w-2.5',
  lg: 'h-3.5 w-3.5',
};

const pulseSizeClasses: Record<DotSize, string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2.5 w-2.5',
  lg: 'h-3.5 w-3.5',
};

export function StatusDot({
  status,
  size = 'md',
  pulse = false,
}: StatusDotProps) {
  const shouldPulse = pulse || status === 'working';

  return (
    <span className={cn('relative inline-flex', sizeClasses[size])}>
      {shouldPulse && (
        <span
          className={cn(
            'absolute inline-flex rounded-full opacity-60 animate-ping',
            pulseSizeClasses[size],
            statusColors[status],
          )}
        />
      )}
      <span
        className={cn(
          'relative inline-flex rounded-full',
          sizeClasses[size],
          statusColors[status],
        )}
      />
    </span>
  );
}

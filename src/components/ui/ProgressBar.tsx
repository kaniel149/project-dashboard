import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

type ProgressSize = 'sm' | 'md';

interface ProgressBarProps {
  value: number;
  color?: string;
  size?: ProgressSize;
  animated?: boolean;
  className?: string;
}

function getAutoColor(value: number): string {
  if (value >= 80) return 'bg-green-400';
  if (value >= 60) return 'bg-blue-400';
  if (value >= 40) return 'bg-yellow-400';
  if (value >= 20) return 'bg-orange-400';
  return 'bg-red-400';
}

const sizeClasses: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
};

export function ProgressBar({
  value,
  color,
  size = 'sm',
  animated = true,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const barColor = color || getAutoColor(clampedValue);

  return (
    <div
      className={cn(
        'w-full rounded-full overflow-hidden bg-white/[0.06] backdrop-blur-sm',
        sizeClasses[size],
        className,
      )}
    >
      <motion.div
        className={cn('h-full rounded-full', barColor)}
        initial={animated ? { width: 0 } : undefined}
        animate={{ width: `${clampedValue}%` }}
        transition={
          animated
            ? { type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }
            : { duration: 0 }
        }
      />
    </div>
  );
}

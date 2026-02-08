import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

type CardDepth = 1 | 2 | 3;
type CardStatus = 'success' | 'warning' | 'error' | 'info';

interface GlassCardProps {
  depth?: CardDepth;
  status?: CardStatus;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  blur?: boolean;
  loading?: boolean;
}

const depthClasses: Record<CardDepth, string> = {
  1: 'bg-white/[0.03] border-white/[0.05]',
  2: 'bg-white/[0.05] border-white/[0.08]',
  3: 'bg-white/[0.08] border-white/[0.12]',
};

const statusBorderColors: Record<CardStatus, string> = {
  success: 'border-s-green-500',
  warning: 'border-s-yellow-500',
  error: 'border-s-red-500',
  info: 'border-s-blue-500',
};

export function GlassCard({
  depth = 1,
  status,
  onClick,
  className,
  children,
  blur = true,
  loading = false,
}: GlassCardProps) {
  const isClickable = !!onClick;

  return (
    <motion.div
      whileHover={
        isClickable
          ? {
              y: -2,
              scale: 1.01,
              transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
            }
          : undefined
      }
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border overflow-hidden transition-shadow duration-300',
        blur && 'backdrop-blur-md',
        depthClasses[depth],
        status && 'border-s-[3px]',
        status && statusBorderColors[status],
        isClickable &&
          'cursor-pointer hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)] hover:border-white/[0.12]',
        className,
      )}
    >
      {/* Shimmer overlay on hover */}
      {isClickable && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
      )}

      {/* Shimmer loading state */}
      {loading && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        </div>
      )}

      {children}
    </motion.div>
  );
}

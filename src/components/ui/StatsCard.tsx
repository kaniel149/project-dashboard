import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from './AnimatedNumber';

type StatsColor = 'blue' | 'green' | 'purple' | 'cyan' | 'orange';
type TrendDirection = 'up' | 'down' | 'neutral';

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: { direction: TrendDirection; percentage: number };
  icon?: ReactNode;
  color?: StatsColor;
  glow?: boolean;
  onClick?: () => void;
  sparkline?: number[];
  className?: string;
}

const colorClasses: Record<StatsColor, { text: string; bg: string; glow: string; gradient: string }> = {
  blue: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    glow: 'shadow-[0_0_24px_-6px_rgba(59,130,246,0.25)]',
    gradient: 'from-blue-500/20 to-transparent',
  },
  green: {
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    glow: 'shadow-[0_0_24px_-6px_rgba(34,197,94,0.25)]',
    gradient: 'from-green-500/20 to-transparent',
  },
  purple: {
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    glow: 'shadow-[0_0_24px_-6px_rgba(139,92,246,0.25)]',
    gradient: 'from-purple-500/20 to-transparent',
  },
  cyan: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    glow: 'shadow-[0_0_24px_-6px_rgba(6,182,212,0.25)]',
    gradient: 'from-cyan-500/20 to-transparent',
  },
  orange: {
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    glow: 'shadow-[0_0_24px_-6px_rgba(249,115,22,0.25)]',
    gradient: 'from-orange-500/20 to-transparent',
  },
};

const trendIcons: Record<TrendDirection, string> = {
  up: '\u2191',
  down: '\u2193',
  neutral: '\u2192',
};

const trendColors: Record<TrendDirection, string> = {
  up: 'text-green-400',
  down: 'text-red-400',
  neutral: 'text-white/40',
};

const sparklineColors: Record<StatsColor, string> = {
  blue: '#60a5fa',
  green: '#4ade80',
  purple: '#a78bfa',
  cyan: '#22d3ee',
  orange: '#fb923c',
};

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 64;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-50">
      <polyline fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export function StatsCard({
  label,
  value,
  trend,
  icon,
  color = 'blue',
  glow = false,
  onClick,
  sparkline,
  className,
}: StatsCardProps) {
  const c = colorClasses[color];
  const isClickable = !!onClick;
  const numericValue = typeof value === 'number' ? value : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={
        isClickable
          ? { y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } }
          : undefined
      }
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-5 overflow-hidden transition-shadow duration-300',
        glow && c.glow,
        isClickable && 'cursor-pointer hover:border-white/[0.12] hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)]',
        className,
      )}
    >
      {/* Icon */}
      {icon && (
        <div className={cn('flex items-center justify-center h-9 w-9 rounded-xl mb-3', c.bg, c.text)}>
          {icon}
        </div>
      )}

      {/* Value */}
      <div className="text-3xl font-bold text-white/95 tracking-tight">
        {numericValue !== null ? (
          <AnimatedNumber value={numericValue} format="locale" />
        ) : (
          value
        )}
      </div>

      {/* Label + Trend + Sparkline */}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-sm text-white/50">{label}</span>
        <div className="flex items-center gap-2">
          {sparkline && <MiniSparkline data={sparkline} color={sparklineColors[color]} />}
          {trend && (
            <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', trendColors[trend.direction])}>
              <span>{trendIcons[trend.direction]}</span>
              <span>{trend.percentage}%</span>
            </span>
          )}
        </div>
      </div>

      {/* Gradient bg accent */}
      <div className={cn(
        'absolute -top-8 -end-8 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity duration-500',
        c.bg,
        isClickable && 'group-hover:opacity-35',
      )} />

      {/* Hover gradient border effect */}
      {isClickable && (
        <div className={cn(
          'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br',
          c.gradient,
        )} />
      )}
    </motion.div>
  );
}

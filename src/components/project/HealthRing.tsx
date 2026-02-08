import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { cn, getHealthStatus } from '@/lib/utils';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { zIndex } from '@/lib/tokens';

type RingSize = 'sm' | 'md' | 'lg';

interface HealthRingProps {
  score: number;
  size?: RingSize;
  showLabel?: boolean;
  className?: string;
  /** Breakdown data shown in tooltip */
  breakdown?: {
    daysSinceActivity?: number;
    uncommittedChanges?: number;
    remainingTasks?: number;
    completedTasks?: number;
  };
}

const sizeConfig: Record<RingSize, { px: number; stroke: number; font: string; labelSize: string }> = {
  sm: { px: 32, stroke: 3, font: 'text-[9px]', labelSize: 'text-[8px]' },
  md: { px: 48, stroke: 3.5, font: 'text-xs', labelSize: 'text-[10px]' },
  lg: { px: 72, stroke: 4.5, font: 'text-base', labelSize: 'text-xs' },
};

function getStrokeColor(score: number): string {
  if (score >= 80) return '#4ade80';
  if (score >= 60) return '#60a5fa';
  if (score >= 40) return '#fbbf24';
  if (score >= 20) return '#fb923c';
  return '#f87171';
}

function getGlowColor(score: number): string {
  if (score >= 80) return 'rgba(74, 222, 128, 0.3)';
  if (score >= 60) return 'rgba(96, 165, 250, 0.3)';
  if (score >= 40) return 'rgba(251, 191, 36, 0.3)';
  if (score >= 20) return 'rgba(251, 146, 60, 0.3)';
  return 'rgba(248, 113, 113, 0.3)';
}

export function HealthRing({ score, size = 'md', showLabel = true, className, breakdown }: HealthRingProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -20px 0px' });

  const config = sizeConfig[size];
  const radius = (config.px - config.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getStrokeColor(score);
  const glowColor = getGlowColor(score);
  const { label } = getHealthStatus(score);
  const showWarningPulse = score < 40;

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setShowTooltip(true), 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    setShowTooltip(false);
  };

  return (
    <div
      ref={ref}
      className={cn('relative inline-flex items-center justify-center', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Warning pulse glow */}
      {showWarningPulse && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 ${size === 'lg' ? 16 : 10}px ${glowColor}`,
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <svg
        width={config.px}
        height={config.px}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.px / 2}
          cy={config.px / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={config.stroke}
        />
        {/* Progress circle */}
        <motion.circle
          cx={config.px / 2}
          cy={config.px / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: isInView ? offset : circumference }}
          transition={{
            type: 'spring',
            stiffness: 60,
            damping: 15,
            delay: 0.15,
          }}
          style={{
            filter: `drop-shadow(0 0 ${size === 'lg' ? 4 : 2}px ${glowColor})`,
          }}
        />
      </svg>

      {/* Inner score */}
      {showLabel && (
        <span className={cn('absolute font-bold text-white/90 tabular-nums', config.font)}>
          <AnimatedNumber value={score} />
        </span>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && breakdown && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-full mb-2 start-1/2 -translate-x-1/2 px-3 py-2.5 rounded-xl bg-[#1a1a26]/95 border border-white/[0.08] backdrop-blur-md shadow-xl pointer-events-none whitespace-nowrap"
            style={{ zIndex: zIndex.tooltip }}
          >
            <div className="text-[10px] font-semibold text-white/80 mb-1.5">{label} - {score}/100</div>
            <div className="space-y-1">
              {breakdown.daysSinceActivity !== undefined && (
                <div className="flex items-center justify-between gap-4 text-[10px]">
                  <span className="text-white/40">ימים מאז פעילות</span>
                  <span className={cn(
                    'font-mono',
                    breakdown.daysSinceActivity > 7 ? 'text-orange-400' : 'text-white/60',
                  )}>
                    {breakdown.daysSinceActivity}
                  </span>
                </div>
              )}
              {breakdown.uncommittedChanges !== undefined && (
                <div className="flex items-center justify-between gap-4 text-[10px]">
                  <span className="text-white/40">שינויים לא שמורים</span>
                  <span className={cn(
                    'font-mono',
                    breakdown.uncommittedChanges > 10 ? 'text-yellow-400' : 'text-white/60',
                  )}>
                    {breakdown.uncommittedChanges}
                  </span>
                </div>
              )}
              {breakdown.remainingTasks !== undefined && (
                <div className="flex items-center justify-between gap-4 text-[10px]">
                  <span className="text-white/40">משימות פתוחות</span>
                  <span className="font-mono text-white/60">{breakdown.remainingTasks}</span>
                </div>
              )}
              {breakdown.completedTasks !== undefined && (
                <div className="flex items-center justify-between gap-4 text-[10px]">
                  <span className="text-white/40">משימות שהושלמו</span>
                  <span className="font-mono text-green-400/70">{breakdown.completedTasks}</span>
                </div>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute top-full start-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#1a1a26]/95 border-b border-e border-white/[0.08]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'motion/react';
import { cn } from '@/lib/utils';

type FormatFn = (value: number) => string;

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: FormatFn | 'compact' | 'locale';
  className?: string;
}

const defaultFormatters: Record<string, FormatFn> = {
  compact: (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return Math.round(v).toLocaleString('he-IL');
  },
  locale: (v: number) => Math.round(v).toLocaleString('he-IL'),
};

export function AnimatedNumber({
  value,
  duration = 800,
  format,
  className,
}: AnimatedNumberProps) {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    stiffness: 100,
    damping: 20,
    mass: 0.8,
    duration: duration,
  });
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  const formatFn: FormatFn =
    typeof format === 'function'
      ? format
      : format && defaultFormatters[format]
        ? defaultFormatters[format]
        : (v: number) => Math.round(v).toString();

  const display = useTransform(springVal, (v) => formatFn(v));

  useEffect(() => {
    motionVal.set(prevValue.current);
    motionVal.set(value);
    prevValue.current = value;
  }, [value, motionVal]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsubscribe;
  }, [display]);

  return (
    <motion.span
      ref={ref}
      className={cn('tabular-nums', className)}
      aria-label={formatFn(value)}
    >
      {formatFn(0)}
    </motion.span>
  );
}

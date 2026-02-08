import { useId } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

type ToggleSize = 'sm' | 'md';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: ToggleSize;
  disabled?: boolean;
  className?: string;
}

const sizes: Record<ToggleSize, { track: string; thumb: string; translate: number }> = {
  sm: { track: 'h-5 w-9', thumb: 'h-3.5 w-3.5', translate: 16 },
  md: { track: 'h-6 w-11', thumb: 'h-4.5 w-4.5', translate: 20 },
};

export function Toggle({
  checked,
  onChange,
  label,
  size = 'md',
  disabled = false,
  className,
}: ToggleProps) {
  const id = useId();
  const s = sizes[size];

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex flex-shrink-0 rounded-full border-2 border-transparent cursor-pointer',
          'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]',
          s.track,
          checked ? 'bg-blue-500' : 'bg-white/[0.12]',
          disabled && 'opacity-40 cursor-not-allowed',
        )}
      >
        <motion.span
          layout
          className={cn(
            'inline-block rounded-full bg-white shadow-sm pointer-events-none',
            s.thumb,
          )}
          animate={{ x: checked ? s.translate : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          aria-hidden="true"
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'text-sm text-white/70 select-none',
            disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}

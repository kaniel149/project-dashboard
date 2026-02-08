import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { ToastType } from '@/types';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
  onClose: (id: string) => void;
}

const typeConfig: Record<
  ToastType,
  { icon: string; border: string; bg: string; text: string; barColor: string }
> = {
  success: {
    icon: '\u2713',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    barColor: 'bg-green-500',
  },
  error: {
    icon: '\u2717',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    barColor: 'bg-red-500',
  },
  info: {
    icon: 'i',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    barColor: 'bg-blue-500',
  },
  warning: {
    icon: '!',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    barColor: 'bg-yellow-500',
  },
};

export function Toast({ id, type, title, message, action, duration = 4000, onClose }: ToastProps) {
  const config = typeConfig[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'relative flex flex-col w-80 rounded-xl border backdrop-blur-xl shadow-2xl overflow-hidden',
        'bg-[#12121a]/90',
        config.border,
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center h-6 w-6 rounded-lg text-xs font-bold flex-shrink-0',
            config.bg,
            config.text,
          )}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 truncate">{title}</p>
          {message && (
            <p className="text-xs text-white/45 mt-0.5 line-clamp-2">{message}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => onClose(id)}
          className="flex items-center justify-center h-5 w-5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors flex-shrink-0 cursor-pointer"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] w-full bg-white/[0.04]">
        <motion.div
          className={cn('h-full', config.barColor)}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

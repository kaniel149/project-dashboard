import { type ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/tokens';

type SheetSize = 'sm' | 'md' | 'lg';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: SheetSize;
  children: ReactNode;
  className?: string;
}

const sizeClasses: Record<SheetSize, string> = {
  sm: 'max-w-[320px]',
  md: 'max-w-[480px]',
  lg: 'max-w-[640px]',
};

export function Sheet({
  open,
  onClose,
  title,
  size = 'md',
  children,
  className,
}: SheetProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  const content = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0" style={{ zIndex: zIndex.modal }}>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel - slides from inline-end (right in LTR, left in RTL) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className={cn(
              'absolute inset-y-0 end-0 w-full flex flex-col',
              'border-s border-white/[0.06] bg-[#0e0e14]/98 backdrop-blur-xl shadow-2xl',
              sizeClasses[size],
              className,
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h2 className="text-base font-semibold text-white/90">{title}</h2>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

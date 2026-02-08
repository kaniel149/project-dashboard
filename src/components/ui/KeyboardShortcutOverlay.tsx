import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/tokens';
import { Kbd } from './Kbd';

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; label: string }[];
}

interface KeyboardShortcutOverlayProps {
  open: boolean;
  onClose: () => void;
  groups: ShortcutGroup[];
  className?: string;
}

export function KeyboardShortcutOverlay({
  open,
  onClose,
  groups,
  className,
}: KeyboardShortcutOverlayProps) {
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

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{ zIndex: zIndex.commandPalette + 10 }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={cn(
              'relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl',
              'border border-white/[0.08] bg-[#12121a]/95 backdrop-blur-xl shadow-2xl p-6',
              className,
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white/90">Keyboard Shortcuts</h2>
              <button
                onClick={onClose}
                className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.map((group, gi) => (
                <motion.div
                  key={group.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    delay: gi * 0.06,
                  }}
                >
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                    {group.title}
                  </h3>
                  <div className="space-y-2">
                    {group.shortcuts.map((shortcut, si) => (
                      <motion.div
                        key={si}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 25,
                          delay: gi * 0.06 + si * 0.03,
                        }}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span className="text-sm text-white/60">{shortcut.label}</span>
                        <div className="flex items-center gap-1 ms-4">
                          {shortcut.keys.map((key, ki) => (
                            <Kbd key={ki}>{key}</Kbd>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
              <span className="text-xs text-white/30">
                Press <Kbd>?</Kbd> to toggle this overlay
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

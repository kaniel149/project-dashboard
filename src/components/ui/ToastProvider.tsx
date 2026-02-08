import { useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAppStore } from '@/stores/appStore';
import { Toast } from './Toast';
import { zIndex } from '@/lib/tokens';

const MAX_VISIBLE = 3;

export default function ToastProvider() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  const visibleToasts = useMemo(() => toasts.slice(-MAX_VISIBLE), [toasts]);

  return (
    <div
      className="fixed bottom-4 end-4 flex flex-col-reverse gap-2"
      style={{ zIndex: zIndex.toast }}
    >
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

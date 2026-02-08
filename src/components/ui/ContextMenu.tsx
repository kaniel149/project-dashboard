import {
  type ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/tokens';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  children?: ContextMenuItem[];
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  onAction: (id: string) => void;
  children: ReactNode;
  className?: string;
}

export function ContextMenu({ items, onAction, children, className }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [highlight, setHighlight] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 300);
    setPos({ x, y });
    setOpen(true);
    setHighlight(-1);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const select = useCallback(
    (item: ContextMenuItem) => {
      if (item.disabled || item.separator) return;
      onAction(item.id);
      close();
    },
    [onAction, close],
  );

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      close();
    };
    const handleKey = (e: KeyboardEvent) => {
      const actionable = items.filter((i) => !i.separator);
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          close();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setHighlight((h) => (h + 1 >= actionable.length ? 0 : h + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlight((h) => (h - 1 < 0 ? actionable.length - 1 : h - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlight >= 0 && actionable[highlight]) select(actionable[highlight]);
          break;
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, close, highlight, items, select]);

  const menu = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed min-w-[200px] rounded-xl border border-white/[0.08] bg-[#12121a]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          style={{ zIndex: zIndex.tooltip + 10, top: pos.y, left: pos.x }}
          role="menu"
        >
          <div className="py-1">
            {items.map((item, i) => {
              if (item.separator) {
                return <div key={`sep-${i}`} className="my-1 border-t border-white/[0.06]" />;
              }
              const actionableIndex = items.filter((it, idx) => idx <= i && !it.separator).length - 1;
              return (
                <button
                  key={item.id}
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => select(item)}
                  onMouseEnter={() => setHighlight(actionableIndex)}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2 text-start text-sm cursor-pointer transition-colors',
                    actionableIndex === highlight && 'bg-white/[0.06]',
                    item.danger ? 'text-red-400' : 'text-white/80',
                    item.disabled && 'opacity-35 cursor-not-allowed',
                  )}
                >
                  {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[11px] text-white/30 font-mono ms-4">{item.shortcut}</span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div onContextMenu={handleContextMenu} className={className}>
      {children}
      {createPortal(menu, document.body)}
    </div>
  );
}

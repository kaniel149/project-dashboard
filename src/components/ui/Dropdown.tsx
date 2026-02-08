import {
  type ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/tokens';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
}

interface DropdownProps {
  value?: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  disabled?: boolean;
}

export function Dropdown({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  className,
  disabled = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, flip: false });

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
    );
  }, [options, search]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const flip = spaceBelow < 260;
    setPos({ top: flip ? rect.top : rect.bottom + 4, left: rect.left, width: rect.width, flip });
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    updatePosition();
    setOpen(true);
    setSearch('');
    const idx = value ? options.findIndex((o) => o.value === value) : 0;
    setHighlightIndex(idx >= 0 ? idx : 0);
  }, [disabled, updatePosition, value, options]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setSearch('');
    triggerRef.current?.focus();
  }, []);

  const selectOption = useCallback(
    (opt: DropdownOption) => {
      if (opt.disabled) return;
      onChange(opt.value);
      closeMenu();
    },
    [onChange, closeMenu],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node) || listRef.current?.contains(e.target as Node)) return;
      closeMenu();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeMenu]);

  useEffect(() => {
    if (open && searchable) requestAnimationFrame(() => searchRef.current?.focus());
  }, [open, searchable]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
          e.preventDefault();
          openMenu();
        }
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightIndex((i) => (i + 1 >= filtered.length ? 0 : i + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightIndex((i) => (i - 1 < 0 ? filtered.length - 1 : i - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightIndex >= 0 && filtered[highlightIndex]) selectOption(filtered[highlightIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          closeMenu();
          break;
      }
    },
    [open, openMenu, closeMenu, selectOption, filtered, highlightIndex],
  );

  useEffect(() => {
    if (!open || highlightIndex < 0) return;
    listRef.current?.querySelector(`[data-index="${highlightIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [highlightIndex, open]);

  const menu = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={listRef}
          initial={{ opacity: 0, scale: 0.96, y: pos.flip ? 6 : -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: pos.flip ? 6 : -6 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed overflow-hidden rounded-xl border border-white/[0.08] bg-[#12121a]/95 backdrop-blur-xl shadow-2xl"
          style={{
            zIndex: zIndex.tooltip + 10,
            top: pos.flip ? undefined : pos.top,
            bottom: pos.flip ? window.innerHeight - pos.top + 4 : undefined,
            left: pos.left,
            width: Math.max(pos.width, 200),
          }}
          role="listbox"
        >
          {searchable && (
            <div className="p-2 border-b border-white/[0.06]">
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setHighlightIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-blue-500/40"
              />
            </div>
          )}
          <div className="max-h-[220px] overflow-y-auto py-1 scrollbar-thin">
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-sm text-white/30 text-center">No results</div>
            )}
            {filtered.map((opt, i) => (
              <button
                key={opt.value}
                data-index={i}
                role="option"
                aria-selected={opt.value === value}
                disabled={opt.disabled}
                onClick={() => selectOption(opt)}
                onMouseEnter={() => setHighlightIndex(i)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3 py-2 text-start text-sm cursor-pointer transition-colors',
                  i === highlightIndex && 'bg-white/[0.06]',
                  opt.value === value ? 'text-blue-400' : 'text-white/80',
                  opt.disabled && 'opacity-35 cursor-not-allowed',
                )}
              >
                {opt.icon && <span className="flex-shrink-0 text-white/50">{opt.icon}</span>}
                <span className="flex-1 min-w-0">
                  <span className="block truncate">{opt.label}</span>
                  {opt.description && <span className="block text-xs text-white/35 truncate mt-0.5">{opt.description}</span>}
                </span>
                {opt.value === value && (
                  <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center justify-between gap-2 w-full px-3 py-2.5 rounded-xl border text-sm text-start',
          'bg-white/[0.03] border-white/[0.08] transition-all cursor-pointer',
          'hover:border-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
          open && 'border-blue-500/40 ring-2 ring-blue-500/20',
          disabled && 'opacity-40 cursor-not-allowed',
          className,
        )}
      >
        <span className={cn('truncate', !selected && 'text-white/35')}>
          {selected ? (
            <span className="flex items-center gap-2">
              {selected.icon}
              <span className="text-white/90">{selected.label}</span>
            </span>
          ) : placeholder}
        </span>
        <svg
          className={cn('h-4 w-4 text-white/35 flex-shrink-0 transition-transform duration-200', open && 'rotate-180')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {createPortal(menu, document.body)}
    </>
  );
}

import { type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { Kbd } from './Kbd';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  shortcutHint?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  shortcutHint = '\u2318K',
  className,
}: SearchInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div
      className={cn(
        'relative flex items-center rounded-xl border backdrop-blur-sm transition-all duration-200',
        'bg-white/[0.04] border-white/[0.08]',
        'focus-within:border-blue-500/40 focus-within:shadow-[0_0_12px_-4px_rgba(59,130,246,0.2)]',
        className,
      )}
    >
      {/* Magnifying glass icon */}
      <svg
        className="ml-3 h-4 w-4 flex-shrink-0 text-white/30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-transparent px-3 py-2.5 text-sm text-white/90 placeholder:text-white/25 outline-none"
      />

      {/* Right side: shortcut hint when empty, X button when has value */}
      <div className="flex items-center pr-3">
        {value ? (
          <button
            onClick={handleClear}
            className="flex items-center justify-center h-5 w-5 rounded-md bg-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.10] transition-colors cursor-pointer"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : shortcutHint ? (
          <Kbd>{shortcutHint}</Kbd>
        ) : null}
      </div>
    </div>
  );
}

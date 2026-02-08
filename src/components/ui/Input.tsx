import {
  type ReactNode,
  type InputHTMLAttributes,
  forwardRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-white/70"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative flex items-center rounded-xl border backdrop-blur-sm transition-all duration-200',
            'bg-white/[0.04] border-white/[0.08]',
            focused && !error && 'border-blue-500/50 shadow-[0_0_12px_-4px_rgba(59,130,246,0.3)]',
            error && 'border-red-500/50 shadow-[0_0_12px_-4px_rgba(239,68,68,0.3)]',
          )}
        >
          {icon && (
            <span className="flex items-center pl-3 text-white/30">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-transparent px-3 py-2.5 text-sm text-white/90 placeholder:text-white/25 outline-none',
              icon && 'pl-2',
              className,
            )}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-white/35">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

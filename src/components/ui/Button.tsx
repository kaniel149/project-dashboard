import { type ReactNode, forwardRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:brightness-110',
  secondary:
    'bg-white/[0.06] border border-white/[0.08] text-white/90 backdrop-blur-sm hover:bg-white/[0.10] hover:border-white/[0.14]',
  ghost:
    'bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white/90',
  danger:
    'bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25 hover:border-red-500/30',
  accent:
    'bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/25 hover:border-cyan-500/30',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const Spinner = ({ size }: { size: ButtonSize }) => (
  <svg
    className={cn('animate-spin', iconSizeClasses[size])}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      disabled,
      className,
      children,
      onClick,
      type = 'button',
      title,
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none',
          variantClasses[variant],
          sizeClasses[size],
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className,
        )}
        disabled={isDisabled}
        onClick={onClick}
        type={type}
        title={title}
      >
        {loading ? (
          <Spinner size={size} />
        ) : icon ? (
          <span className={cn('flex-shrink-0', iconSizeClasses[size])}>
            {icon}
          </span>
        ) : null}
        {children && <span>{children}</span>}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

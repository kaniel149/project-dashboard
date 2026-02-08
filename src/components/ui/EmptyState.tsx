import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className,
      )}
    >
      {icon && (
        <div className="text-4xl mb-4 opacity-60">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-white/80 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-white/40 max-w-sm mb-5">{description}</p>
      )}
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

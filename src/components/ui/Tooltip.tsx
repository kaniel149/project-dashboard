import { type ReactNode, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/tokens';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: ReactNode;
  /** @deprecated Use `side` instead */
  position?: TooltipSide;
  side?: TooltipSide;
  delay?: number;
  arrow?: boolean;
  children: ReactNode;
  className?: string;
}

const sideClasses: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'end-full top-1/2 -translate-y-1/2 me-2',
  right: 'start-full top-1/2 -translate-y-1/2 ms-2',
};

const arrowClasses: Record<TooltipSide, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-[#1a1a26] border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#1a1a26] border-x-transparent border-t-transparent',
  left: 'start-full top-1/2 -translate-y-1/2 border-s-[#1a1a26] border-y-transparent border-e-transparent',
  right: 'end-full top-1/2 -translate-y-1/2 border-e-[#1a1a26] border-y-transparent border-s-transparent',
};

const getMotionProps = (side: TooltipSide) => {
  const offset = 4;
  switch (side) {
    case 'top':
      return { initial: { opacity: 0, y: offset }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: offset } };
    case 'bottom':
      return { initial: { opacity: 0, y: -offset }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -offset } };
    case 'left':
      return { initial: { opacity: 0, x: offset }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: offset } };
    case 'right':
      return { initial: { opacity: 0, x: -offset }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -offset } };
  }
};

export function Tooltip({
  content,
  position,
  side,
  delay = 200,
  arrow = true,
  children,
  className,
}: TooltipProps) {
  const resolvedSide = side || position || 'top';
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  const motionProps = getMotionProps(resolvedSide);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {visible && content && (
          <motion.div
            initial={motionProps.initial}
            animate={motionProps.animate}
            exit={motionProps.exit}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'absolute px-2.5 py-1.5 rounded-lg pointer-events-none',
              'bg-[#1a1a26]/95 border border-white/[0.08] backdrop-blur-sm',
              'text-xs text-white/80 font-medium shadow-xl',
              typeof content === 'string' && 'whitespace-nowrap',
              sideClasses[resolvedSide],
              className,
            )}
            style={{ zIndex: zIndex.tooltip }}
          >
            {content}
            {arrow && (
              <span
                className={cn(
                  'absolute w-0 h-0 border-[4px]',
                  arrowClasses[resolvedSide],
                )}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

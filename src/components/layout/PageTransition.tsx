import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { pageTransition, pageSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to top on page change
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <motion.div
      ref={containerRef}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageSpring}
      className={cn('flex-1 min-h-0 p-6', className)}
    >
      {children}
    </motion.div>
  );
}

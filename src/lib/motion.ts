import type { Variants, Transition } from 'motion/react';

// ===== Page Transitions =====

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
};

export const pageSpring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

// ===== Fade Variants =====

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeScale: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.92 },
};

// ===== Scale Variants =====

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.85 },
};

// ===== Slide Variants =====

export const slideRight: Variants = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export const slideLeft: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 24 },
};

// ===== Stagger =====

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.06 },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.03 },
  },
};

export function staggerContainerCustom(delay: number): Variants {
  return {
    initial: {},
    animate: {
      transition: { staggerChildren: delay },
    },
  };
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export const staggerItemScale: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

// ===== Hover Effects =====

export const glassHover = {
  whileHover: {
    y: -2,
    scale: 1.01,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  whileTap: {
    scale: 0.98,
  },
};

export const cardHover = {
  whileHover: {
    y: -4,
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  whileTap: {
    scale: 0.98,
  },
};

export const buttonPress = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
};

export const scaleBounce = {
  whileHover: { scale: 1.05 },
  whileTap: {
    scale: 0.92,
    transition: { type: 'spring', stiffness: 500, damping: 15 },
  },
};

// ===== Modal =====

export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.92, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.92, y: 20 },
};

// ===== Sidebar =====

export const sidebarExpand: Variants = {
  collapsed: { width: 60 },
  expanded: { width: 240 },
};

export const sidebarItem: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

// ===== View Crossfade =====

export const viewCrossfade: Variants = {
  initial: { opacity: 0, scale: 0.96, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.25 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    filter: 'blur(4px)',
    transition: { duration: 0.15 },
  },
};

// ===== Directional Slide =====

export function directionalSlide(direction: 'left' | 'right'): Variants {
  const offset = direction === 'left' ? -40 : 40;
  return {
    initial: { opacity: 0, x: offset },
    animate: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    exit: {
      opacity: 0,
      x: -offset,
      transition: { duration: 0.15 },
    },
  };
}

// ===== Scroll Reveal =====

export const scrollReveal: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },
};

// ===== Number Spring =====

export const numberSpring: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  mass: 1,
};

// ===== Shimmer Overlay =====

export const shimmerOverlay: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: '200%',
    transition: { duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: 'linear' },
  },
};

// ===== Pulse =====

export const pulse = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.6, 1],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

export const glowPulse = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

// ===== List Item =====

export const listItem = (index: number): Variants => ({
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.06,
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
});

// ===== Collapse =====

export const collapse: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

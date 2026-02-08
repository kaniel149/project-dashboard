import { motion } from 'motion/react';
import type { Project } from '@/types';

interface MiniIconProps {
  projects: Project[];
  onExpand: () => void;
}

export default function MiniIcon({ projects, onExpand }: MiniIconProps) {
  const activeCount = projects.filter(
    (p) => p.claudeLive?.status === 'working' || p.claudeLive?.status === 'waiting'
  ).length;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-transparent cursor-pointer"
      onClick={onExpand}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 drag-region"
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
          <path d="M2 6L8 1.5L14 6V13.5C14 14.05 13.55 14.5 13 14.5H3C2.45 14.5 2 14.05 2 13.5V6Z" fill="white" fillOpacity="0.9" />
        </svg>
        {activeCount > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-400 text-[9px] font-bold text-white flex items-center justify-center status-pulse">
            {activeCount}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

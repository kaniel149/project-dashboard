import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTimeAgo } from '../utils/time';
import ProjectCard from './ProjectCard';

function GroupCard({ group, onSelectProject }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { stats } = group;

  const getStatusColor = () => {
    if (stats.hasClaudeActive) return 'from-blue-500 to-cyan-500';
    if (stats.totalUncommitted > 0) return 'from-orange-500 to-red-500';
    if (stats.totalTasks > 0) return 'from-yellow-500 to-amber-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <motion.div
      className="glass-card rounded-2xl overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Status indicator line */}
      <motion.div
        className={`absolute right-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b ${getStatusColor()}`}
        initial={{ opacity: 0.5, scaleY: 0.8 }}
        whileHover={{ opacity: 1, scaleY: 1 }}
      />

      {/* Header - Always visible */}
      <motion.div
        className="p-4 cursor-pointer relative z-10 pr-4"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Group Icon */}
            <motion.div
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.08] flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="text-xl">{group.emoji}</span>
            </motion.div>

            {/* Group Info */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-[15px]">
                  {group.name}
                </span>
                <span className="text-white/30 text-xs bg-white/[0.06] px-1.5 py-0.5 rounded">
                  {group.count}
                </span>
              </div>
              <div className="text-white/25 text-xs">
                {formatTimeAgo(group.stats.lastActivity)}
              </div>
            </div>
          </div>

          {/* Expand/Collapse Arrow */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-white/30"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.div>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {stats.hasClaudeActive && (
            <motion.div
              className="badge badge-blue"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-blue-400"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span>🤖 Claude פעיל</span>
            </motion.div>
          )}
          {stats.totalUncommitted > 0 && (
            <div className="badge badge-orange">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span>{stats.totalUncommitted} שינויים</span>
            </div>
          )}
          {stats.totalTasks > 0 && (
            <div className="badge badge-yellow">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span>{stats.totalTasks} משימות</span>
            </div>
          )}
          {stats.totalUncommitted === 0 && stats.totalTasks === 0 && !stats.hasClaudeActive && (
            <div className="badge badge-green">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span>הכל מעודכן</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] px-3 py-3 space-y-2">
              {group.projects.map((project, index) => (
                <motion.div
                  key={project.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProjectCard
                    project={project}
                    onClick={() => onSelectProject(project)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default GroupCard;

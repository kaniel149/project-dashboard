import { motion } from 'motion/react';
import { formatTimeAgo } from '../utils/time';

function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

function ProjectCard({ project, onClick }) {
  const hasUncommitted = project.uncommittedChanges > 0;
  const hasRemainingTasks = project.remainingTasks?.length > 0;

  const getStatus = () => {
    if (hasUncommitted) return { color: 'orange', label: 'שינויים' };
    if (hasRemainingTasks) return { color: 'yellow', label: 'משימות' };
    return { color: 'green', label: 'מעודכן' };
  };

  const status = getStatus();
  const commitMessage = project.lastCommit?.message || '';
  const messageDir = isHebrew(commitMessage) ? 'rtl' : 'ltr';

  const statusColors = {
    orange: 'from-orange-500 to-red-500',
    yellow: 'from-yellow-500 to-amber-500',
    green: 'from-green-500 to-emerald-500',
  };

  return (
    <motion.div
      onClick={onClick}
      className="glass-card rounded-2xl p-4 cursor-pointer relative overflow-hidden"
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Status indicator line */}
      <motion.div
        className={`absolute right-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b ${statusColors[status.color]}`}
        initial={{ opacity: 0.5, scaleY: 0.8 }}
        whileHover={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 pr-4 relative z-10">
        <div className="flex items-center gap-3">
          {/* Project Icon */}
          <motion.div
            className="icon-wrapper w-11 h-11 rounded-xl flex items-center justify-center relative overflow-hidden"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span className="text-white/80 font-semibold text-sm tracking-wide relative z-10">
              {project.name.substring(0, 2).toUpperCase()}
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
          </motion.div>

          {/* Project Info */}
          <div className="space-y-0.5">
            <div className="text-white font-medium text-[15px] tracking-tight">
              {project.name}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/25 text-xs font-mono">{project.branch}</span>
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="text-white/20 text-xs font-medium">
          {formatTimeAgo(project.lastActivity)}
        </div>
      </div>

      {/* Commit Message */}
      {commitMessage && (
        <p
          className="text-white/35 text-sm mb-3 truncate pr-4 relative z-10"
          style={{ direction: messageDir, textAlign: messageDir === 'rtl' ? 'right' : 'left' }}
        >
          {commitMessage}
        </p>
      )}

      {/* Summary */}
      {project.summary && (
        <div
          className="text-white/50 text-sm mb-3 line-clamp-2 pr-4 leading-relaxed relative z-10"
          style={{ direction: isHebrew(project.summary) ? 'rtl' : 'ltr' }}
        >
          {project.summary}
        </div>
      )}

      {/* Stats Badges */}
      <div className="flex items-center gap-2 pr-4 relative z-10">
        {hasRemainingTasks && (
          <motion.div
            className="badge badge-yellow"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-yellow-400"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>{project.remainingTasks.length} משימות</span>
          </motion.div>
        )}
        {hasUncommitted && (
          <motion.div
            className="badge badge-orange"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-orange-400"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <span>{project.uncommittedChanges} שינויים</span>
          </motion.div>
        )}
        {!hasRemainingTasks && !hasUncommitted && (
          <motion.div
            className="badge badge-green"
            whileHover={{ scale: 1.05 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span>מעודכן</span>
          </motion.div>
        )}
      </div>

      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
        initial={{ backgroundPosition: '-200% 0' }}
        whileHover={{
          backgroundPosition: '200% 0',
          transition: { duration: 0.8, ease: 'easeInOut' }
        }}
      />
    </motion.div>
  );
}

export default ProjectCard;

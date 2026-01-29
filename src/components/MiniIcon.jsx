import { motion } from 'motion/react';

function MiniIcon({ projects, onExpand }) {
  const changesCount = projects.filter(p => p.uncommittedChanges > 0).length;
  const tasksCount = projects.reduce((acc, p) => acc + (p.remainingTasks?.length || 0), 0);
  const hasAlerts = changesCount > 0 || tasksCount > 0;

  return (
    <motion.div
      onClick={onExpand}
      className="w-[70px] h-[70px] glass-container rounded-2xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
      style={{ WebkitAppRegion: 'drag' }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent"
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Animated ring */}
      <motion.div
        className="absolute inset-[3px] rounded-xl border border-white/10"
        animate={{
          borderColor: hasAlerts
            ? ['rgba(255,255,255,0.1)', 'rgba(249,115,22,0.3)', 'rgba(255,255,255,0.1)']
            : 'rgba(255,255,255,0.1)'
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Icon */}
      <motion.div
        className="no-drag relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
        whileHover={{
          boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)',
          rotate: 5,
        }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </motion.div>

      {/* Badges */}
      {hasAlerts && (
        <motion.div
          className="no-drag flex gap-1 mt-2 relative z-10"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {changesCount > 0 && (
            <motion.div
              className="text-[10px] text-orange-200 font-bold bg-orange-500/40 backdrop-blur-sm px-2 py-0.5 rounded-md min-w-[20px] text-center border border-orange-400/30 shadow-sm shadow-orange-500/20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {changesCount}
            </motion.div>
          )}
          {tasksCount > 0 && (
            <motion.div
              className="text-[10px] text-yellow-200 font-bold bg-yellow-500/40 backdrop-blur-sm px-2 py-0.5 rounded-md min-w-[20px] text-center border border-yellow-400/30 shadow-sm shadow-yellow-500/20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              {tasksCount}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Status indicator for no alerts */}
      {!hasAlerts && projects.length > 0 && (
        <motion.div
          className="absolute bottom-2 w-6 h-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Pulse effect when has alerts */}
      {hasAlerts && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-orange-400/30 pointer-events-none"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

export default MiniIcon;

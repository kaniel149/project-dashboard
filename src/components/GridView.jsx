import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

function GridView({ projects, onSelectProject, isFullscreen, onToggleFullscreen }) {
  const [focusedProject, setFocusedProject] = useState(null);

  // Show all projects, prioritize those with Claude active
  const sortedProjects = [...projects].sort((a, b) => {
    // Claude active projects first
    const aActive = a.claudeLive?.status === 'working' || a.claudeLive?.status === 'waiting';
    const bActive = b.claudeLive?.status === 'working' || b.claudeLive?.status === 'waiting';
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    // Then by last activity
    return new Date(b.lastActivity) - new Date(a.lastActivity);
  });

  // In fullscreen show more, otherwise limit to 6
  const maxProjects = isFullscreen ? 12 : 6;
  const displayProjects = sortedProjects.slice(0, maxProjects);

  const activeCount = projects.filter(
    p => p.claudeLive?.status === 'working' || p.claudeLive?.status === 'waiting'
  ).length;

  // Dynamic grid columns based on count and fullscreen
  const getGridCols = () => {
    if (isFullscreen) {
      if (displayProjects.length <= 4) return 2;
      if (displayProjects.length <= 6) return 3;
      return 4;
    }
    if (displayProjects.length <= 2) return 2;
    if (displayProjects.length <= 4) return 2;
    return 3;
  };

  const gridCols = getGridCols();

  return (
    <div className="h-full flex flex-col">
      {/* Grid Header */}
      <div className="flex items-center justify-between px-2 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs font-medium">
            🎛️ {displayProjects.length} פרויקטים
          </span>
          {activeCount > 0 && (
            <span className="text-blue-400 text-xs bg-blue-500/10 px-2 py-0.5 rounded-full">
              {activeCount} פעילים
            </span>
          )}
        </div>
        {onToggleFullscreen && (
          <motion.button
            onClick={onToggleFullscreen}
            className="text-white/40 hover:text-white/70 p-1 rounded-lg hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isFullscreen ? "צמצם" : "הגדל למסך מלא"}
          >
            {isFullscreen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 14 10 14 10 20"/>
                <polyline points="20 10 14 10 14 4"/>
                <line x1="14" y1="10" x2="21" y2="3"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            )}
          </motion.button>
        )}
      </div>

      {/* Grid */}
      <div
        className={`flex-1 grid gap-2 auto-rows-fr`}
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        }}
      >
        <AnimatePresence mode="popLayout">
          {displayProjects.map((project, index) => (
            <GridCard
              key={project.path}
              project={project}
              index={index}
              isFocused={focusedProject === project.path}
              onFocus={() => setFocusedProject(
                focusedProject === project.path ? null : project.path
              )}
              onSelect={() => onSelectProject(project)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {displayProjects.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/30 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm">אין פרויקטים פעילים</div>
          </div>
        </div>
      )}
    </div>
  );
}

function GridCard({ project, index, isFocused, onFocus, onSelect }) {
  const claudeLive = project.claudeLive;
  const hasActivity = claudeLive && claudeLive.status !== 'idle';

  const getStatusColor = () => {
    if (!claudeLive) return 'border-white/10';
    switch (claudeLive.status) {
      case 'working': return 'border-blue-500/50 bg-blue-500/5';
      case 'waiting': return 'border-yellow-500/50 bg-yellow-500/5';
      case 'done': return 'border-green-500/50 bg-green-500/5';
      case 'error': return 'border-red-500/50 bg-red-500/5';
      default: return 'border-white/10';
    }
  };

  const getStatusIcon = () => {
    if (!claudeLive) return null;
    switch (claudeLive.status) {
      case 'working': return '🤖';
      case 'waiting': return '⏳';
      case 'done': return '✅';
      case 'error': return '❌';
      default: return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: isFocused ? 1.02 : 1,
        zIndex: isFocused ? 10 : 1,
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      onClick={onFocus}
      onDoubleClick={onSelect}
      className={`
        relative rounded-xl p-3 cursor-pointer overflow-hidden
        border ${getStatusColor()}
        bg-gradient-to-br from-white/[0.03] to-transparent
        hover:from-white/[0.06] transition-colors
        ${isFocused ? 'ring-2 ring-blue-500/30' : ''}
      `}
    >
      {/* Status Pulse for active projects */}
      {hasActivity && claudeLive.status === 'working' && (
        <motion.div
          className="absolute inset-0 bg-blue-500/10 rounded-xl"
          animate={{ opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
            {project.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="truncate">
            <div className="text-white font-medium text-sm truncate max-w-[100px]">
              {project.name}
            </div>
            <div className="text-white/30 text-xs font-mono">
              {project.branch}
            </div>
          </div>
        </div>

        {/* Status Icon */}
        {getStatusIcon() && (
          <motion.div
            animate={claudeLive.status === 'working' ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-lg"
          >
            {getStatusIcon()}
          </motion.div>
        )}
      </div>

      {/* Status Message */}
      {claudeLive?.message && (
        <div className="text-xs text-white/50 truncate mb-2 relative z-10">
          {claudeLive.message}
        </div>
      )}

      {/* Quick Stats */}
      <div className="flex items-center gap-2 relative z-10">
        {project.uncommittedChanges > 0 && (
          <span className="text-xs text-orange-400/80 bg-orange-500/10 px-1.5 py-0.5 rounded">
            {project.uncommittedChanges} שינויים
          </span>
        )}
        {project.remainingTasks?.length > 0 && (
          <span className="text-xs text-yellow-400/80 bg-yellow-500/10 px-1.5 py-0.5 rounded">
            {project.remainingTasks.length} משימות
          </span>
        )}
      </div>

      {/* Quick Actions (on focus) */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 pt-2 border-t border-white/10 flex gap-1 relative z-10"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                window.electronAPI?.openClaude(project.path);
              }}
              className="flex-1 text-xs py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
            >
              🤖 Claude
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                window.electronAPI?.openVSCode(project.path);
              }}
              className="flex-1 text-xs py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
            >
              💻 Code
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                window.electronAPI?.openProjectMap(project.path);
              }}
              className="flex-1 text-xs py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
            >
              🗺️ מפה
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double-click hint */}
      {isFocused && (
        <div className="absolute bottom-1 right-2 text-[10px] text-white/20">
          לחץ פעמיים לפרטים
        </div>
      )}
    </motion.div>
  );
}

export default GridView;

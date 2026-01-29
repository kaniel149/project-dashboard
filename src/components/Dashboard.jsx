import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProjectCard from './ProjectCard';
import ProjectExpanded from './ProjectExpanded';

function Dashboard({ projects, onCollapse }) {
  const [expandedProject, setExpandedProject] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-[420px] h-[550px] glass-container rounded-3xl flex flex-col overflow-hidden relative noise-overlay"
    >
      {/* Ambient glow effects */}
      <motion.div
        animate={{
          opacity: [0.15, 0.25, 0.15],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"
      />

      {/* Close button */}
      <motion.button
        onClick={onCollapse}
        className="close-btn absolute top-4 left-4 z-50 no-drag"
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        ×
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="flex items-center justify-center px-6 py-5 border-b border-white/[0.06] relative"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg glow-blue"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </motion.div>
          <div>
            <h1 className="text-white font-semibold text-lg tracking-tight">הפרויקטים שלי</h1>
            <p className="text-white/30 text-xs">Desktop Dashboard</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="wait">
          {expandedProject ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <ProjectExpanded
                project={expandedProject}
                onClose={() => setExpandedProject(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              {projects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between px-2 pb-3"
                >
                  <span className="text-white/30 text-xs font-medium tracking-wide">
                    {projects.length} פרויקטים פעילים
                  </span>
                  <div className="h-px flex-1 mx-3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </motion.div>
              )}

              {projects.map((project, index) => (
                <motion.div
                  key={project.path}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.08,
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                >
                  <ProjectCard
                    project={project}
                    onClick={() => setExpandedProject(project)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-white/40 text-center py-20 flex flex-col items-center gap-5"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] flex items-center justify-center"
            >
              <div className="w-10 h-10 border-2 border-white/20 border-t-blue-400 rounded-full" />
            </motion.div>
            <div className="space-y-1">
              <div className="text-white/50 font-medium">סורק פרויקטים...</div>
              <div className="text-white/25 text-sm">מחפש פרויקטי Git בתיקייה</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[rgba(12,12,14,0.95)] to-transparent pointer-events-none" />
    </motion.div>
  );
}

export default Dashboard;

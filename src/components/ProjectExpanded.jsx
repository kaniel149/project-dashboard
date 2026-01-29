import { motion, AnimatePresence } from 'motion/react';
import TaskList from './TaskList';
import { formatTimeAgo } from '../utils/time';

function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

function ProjectExpanded({ project, onClose }) {
  const hasUncommitted = project.uncommittedChanges > 0;
  const hasRemainingTasks = project.remainingTasks?.length > 0;

  const getStatusInfo = () => {
    if (hasUncommitted) return {
      label: 'יש שינויים לא שמורים',
      color: 'text-orange-400',
      bg: 'bg-orange-500/15',
      dot: 'bg-orange-400',
    };
    if (hasRemainingTasks) return {
      label: 'יש משימות פתוחות',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/15',
      dot: 'bg-yellow-400',
    };
    return {
      label: 'הכל מוכן',
      color: 'text-green-400',
      bg: 'bg-green-500/15',
      dot: 'bg-green-400',
    };
  };

  const status = getStatusInfo();

  const handleOpenTerminal = () => {
    window.electronAPI?.openTerminal(project.path);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    }),
  };

  return (
    <motion.div
      className="rounded-2xl border border-white/[0.06] overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent"
      layout
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent"
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="icon-wrapper w-12 h-12 rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span className="text-white/80 font-semibold text-base">
              {project.name.substring(0, 2).toUpperCase()}
            </span>
          </motion.div>
          <div>
            <h2 className="text-white font-semibold text-lg tracking-tight">{project.name}</h2>
            <div className={`flex items-center gap-2 text-xs mt-0.5 ${status.color}`}>
              <motion.span
                className={`w-2 h-2 rounded-full ${status.dot}`}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {status.label}
            </div>
          </div>
        </div>
        <motion.button
          onClick={onClose}
          className="close-btn"
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
          whileTap={{ scale: 0.9 }}
        >
          ×
        </motion.button>
      </motion.div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[340px] overflow-y-auto">
        {/* Summary */}
        {project.summary && (
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Section title="על מה עבדתי" icon="💡" color="blue">
              <p
                className="text-white/70 text-sm leading-relaxed"
                style={{ direction: isHebrew(project.summary) ? 'rtl' : 'ltr' }}
              >
                {project.summary}
              </p>
            </Section>
          </motion.div>
        )}

        {/* Completed Tasks */}
        {project.completedTasks?.length > 0 && (
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Section title={`מה עשיתי (${project.completedTasks.length})`} icon="✓" color="green">
              <TaskList tasks={project.completedTasks} completed />
            </Section>
          </motion.div>
        )}

        {/* Remaining Tasks */}
        {project.remainingTasks?.length > 0 && (
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Section title={`מה נשאר (${project.remainingTasks.length})`} icon="○" color="yellow">
              <TaskList tasks={project.remainingTasks} />
            </Section>
          </motion.div>
        )}

        {/* Next Steps */}
        {project.nextSteps && (
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Section title="מה הלאה" icon="→" color="emerald" highlighted>
              <p
                className="text-white/80 text-sm font-medium"
                style={{ direction: isHebrew(project.nextSteps) ? 'rtl' : 'ltr' }}
              >
                {project.nextSteps}
              </p>
            </Section>
          </motion.div>
        )}

        {/* Recent Commits */}
        {project.recentCommits?.length > 0 && (
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Section title="שינויים אחרונים" icon="⟳" color="slate">
              <div className="space-y-2">
                {project.recentCommits.slice(0, 3).map((commit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between text-sm gap-3 py-1"
                    style={{ direction: isHebrew(commit.message) ? 'rtl' : 'ltr' }}
                  >
                    <span className="text-white/50 truncate flex-1">{commit.message}</span>
                    <span className="text-white/20 text-xs whitespace-nowrap font-mono">{formatTimeAgo(commit.date)}</span>
                  </motion.div>
                ))}
              </div>
            </Section>
          </motion.div>
        )}

        {/* Changed Files */}
        {project.changedFiles?.length > 0 && (
          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Section title={`קבצים לא שמורים (${project.changedFiles.length})`} icon="◈" color="orange">
              <div className="space-y-1.5 max-h-24 overflow-y-auto">
                {project.changedFiles.map((file, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="text-white/40 text-xs font-mono flex gap-2 py-0.5"
                    dir="ltr"
                  >
                    <span className={
                      file.status === 'M' ? 'text-yellow-400 font-bold' :
                      file.status === 'A' ? 'text-green-400 font-bold' :
                      file.status === 'D' ? 'text-red-400 font-bold' :
                      file.status === '?' ? 'text-blue-400 font-bold' :
                      'text-white/40'
                    }>
                      {file.status}
                    </span>
                    <span className="truncate opacity-70 hover:opacity-100 transition-opacity">{file.path}</span>
                  </motion.div>
                ))}
              </div>
            </Section>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4 py-3 border-t border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent flex items-center justify-between"
      >
        <div className="text-xs text-white/25 flex items-center gap-3">
          <span className="bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 rounded-lg font-mono text-white/40">
            {project.branch}
          </span>
          <span className="text-white/20">
            עדכון {formatTimeAgo(project.lastActivity)}
          </span>
        </div>
        <motion.button
          onClick={handleOpenTerminal}
          className="btn-premium flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium relative overflow-hidden"
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <span className="relative z-10 flex items-center gap-2">
            <TerminalIcon />
            <span>פתח טרמינל</span>
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function Section({ title, icon, color, highlighted, children }) {
  const colorClasses = {
    blue: { border: 'border-blue-500/15', bg: 'bg-blue-500/5', title: 'text-blue-400/80' },
    green: { border: 'border-green-500/15', bg: '', title: 'text-green-400/80' },
    yellow: { border: 'border-yellow-500/15', bg: '', title: 'text-yellow-400/80' },
    orange: { border: 'border-orange-500/15', bg: '', title: 'text-orange-400/80' },
    emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', title: 'text-emerald-400/90' },
    slate: { border: 'border-white/[0.06]', bg: '', title: 'text-white/40' },
  };

  const c = colorClasses[color] || colorClasses.slate;

  return (
    <motion.div
      className={`rounded-xl p-3.5 border ${c.border} ${highlighted ? c.bg : 'bg-white/[0.02]'}`}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      transition={{ duration: 0.2 }}
    >
      <div className={`text-xs mb-2.5 font-semibold tracking-wide flex items-center gap-2 ${c.title}`}>
        <span className="opacity-60">{icon}</span>
        {title}
      </div>
      {children}
    </motion.div>
  );
}

function TerminalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

export default ProjectExpanded;

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TaskList from './TaskList';
import { formatTimeAgo } from '../utils/time';

function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

function ProjectExpanded({ project, onClose }) {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleOpenVSCode = () => {
    window.electronAPI?.openVSCode(project.path);
  };

  const handleOpenMap = () => {
    window.electronAPI?.openProjectMap(project.path, project);
  };

  const handleOpenClaude = () => {
    window.electronAPI?.openClaude(project.path);
  };

  const handleSaveSession = async () => {
    setSaving(true);
    try {
      // Build session changes object
      const changes = {
        summary: sessionNotes || `סשן עבודה - ${new Date().toLocaleDateString('he-IL')}`,
        features: [],
        todos: project.completedTasks?.map(task => ({ text: task })) || [],
        notes: sessionNotes,
      };

      // If we have remaining tasks, add them as planned features
      if (project.remainingTasks?.length > 0) {
        changes.features = project.remainingTasks.slice(0, 5).map(task => ({
          name: task,
          status: 'planned',
        }));
      }

      const result = await window.electronAPI?.updateProjectState(project.path, changes);
      if (result?.success) {
        setShowSessionModal(false);
        setSessionNotes('');
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
    setSaving(false);
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
            <Section title="על הפרויקט" icon="💡" color="blue">
              <p
                className="text-white/70 text-sm leading-relaxed"
                style={{ direction: isHebrew(project.summary) ? 'rtl' : 'ltr' }}
              >
                {project.summary}
              </p>
            </Section>
          </motion.div>
        )}

        {/* Tech Stack */}
        {project.techStack?.length > 0 && (
          <motion.div
            custom={0.5}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Section title="טכנולוגיות" icon="⚙" color="slate">
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.slice(0, 6).map((tech, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-xs bg-white/[0.08] text-white/60 px-2 py-1 rounded-md border border-white/[0.06]"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </Section>
          </motion.div>
        )}

        {/* Known Issues */}
        {project.knownIssues?.length > 0 && (
          <motion.div
            custom={0.7}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Section title={`בעיות ידועות (${project.knownIssues.length})`} icon="⚠" color="orange">
              <div className="space-y-1.5">
                {project.knownIssues.slice(0, 3).map((issue, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-white/50 text-sm flex items-start gap-2"
                    style={{ direction: isHebrew(issue) ? 'rtl' : 'ltr' }}
                  >
                    <span className="text-orange-400/60 mt-0.5">•</span>
                    <span>{issue}</span>
                  </motion.div>
                ))}
              </div>
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

      {/* Session Modal */}
      <AnimatePresence>
        {showSessionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSessionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <span>💾</span>
                שמירת סשן עבודה
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">מה עשית היום?</label>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="תיאור קצר של העבודה שבוצעה..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm resize-none focus:outline-none focus:border-white/20"
                    dir="rtl"
                  />
                </div>

                {project.completedTasks?.length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <div className="text-green-400 text-xs font-medium mb-2">✅ משימות שהושלמו ({project.completedTasks.length})</div>
                    <div className="space-y-1">
                      {project.completedTasks.slice(0, 3).map((task, i) => (
                        <div key={i} className="text-white/50 text-xs">{task}</div>
                      ))}
                    </div>
                  </div>
                )}

                {project.uncommittedChanges > 0 && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                    <div className="text-orange-400 text-xs font-medium">
                      ⚠️ {project.uncommittedChanges} שינויים לא committed
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-5">
                <motion.button
                  onClick={() => setShowSessionModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm"
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  ביטול
                </motion.button>
                <motion.button
                  onClick={handleSaveSession}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium"
                  whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? 'שומר...' : '💾 שמור'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4 py-3 border-t border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent flex items-center justify-between"
      >
        <div className="text-xs text-white/25 flex items-center gap-3">
          <motion.button
            onClick={() => setShowSessionModal(true)}
            className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-emerald-400/80 hover:bg-emerald-500/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            💾 שמור סשן
          </motion.button>
          <span className="bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 rounded-lg font-mono text-white/40">
            {project.branch}
          </span>
          <span className="text-white/20">
            עדכון {formatTimeAgo(project.lastActivity)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleOpenMap}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium"
            whileHover={{ scale: 1.03, y: -1, backgroundColor: 'rgba(168, 85, 247, 0.3)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <MapIcon />
            <span>מפה</span>
          </motion.button>
          <motion.button
            onClick={handleOpenClaude}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#D97706]/20 border border-[#D97706]/30 text-[#F59E0B] text-sm font-medium"
            whileHover={{ scale: 1.03, y: -1, backgroundColor: 'rgba(217, 119, 6, 0.3)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <ClaudeIcon />
            <span>Claude</span>
          </motion.button>
          <motion.button
            onClick={handleOpenVSCode}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#007ACC]/20 border border-[#007ACC]/30 text-[#007ACC] text-sm font-medium"
            whileHover={{ scale: 1.03, y: -1, backgroundColor: 'rgba(0, 122, 204, 0.3)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <VSCodeIcon />
            <span>VS Code</span>
          </motion.button>
          <motion.button
            onClick={handleOpenTerminal}
            className="btn-premium flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm font-medium relative overflow-hidden"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <TerminalIcon />
              <span>טרמינל</span>
            </span>
          </motion.button>
        </div>
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

function VSCodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.583 2.041L12.2 6.78 6.817 2.041 5 3.358v17.284l1.817 1.317 5.383-4.739 5.383 4.739L19 20.642V3.358l-1.417-1.317zM6.5 17.5v-11l4.5 5.5-4.5 5.5zm11 0l-4.5-5.5 4.5-5.5v11z"/>
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
  );
}

export default ProjectExpanded;

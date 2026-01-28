import TaskList from './TaskList';
import { formatTimeAgo } from '../utils/time';

function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

function ProjectExpanded({ project, onClose }) {
  const hasUncommitted = project.uncommittedChanges > 0;
  const hasRemainingTasks = project.remainingTasks?.length > 0;

  const getStatusInfo = () => {
    if (hasUncommitted) return { label: 'יש שינויים לא שמורים', color: 'text-orange-400', bg: 'bg-orange-500/20', dot: 'bg-orange-400' };
    if (hasRemainingTasks) return { label: 'יש משימות פתוחות', color: 'text-yellow-400', bg: 'bg-yellow-500/20', dot: 'bg-yellow-400' };
    return { label: 'הכל מוכן', color: 'text-green-400', bg: 'bg-green-500/20', dot: 'bg-green-400' };
  };

  const status = getStatusInfo();

  const handleOpenTerminal = () => {
    window.electronAPI?.openTerminal(project.path);
  };

  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/[0.08] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.03] to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-white/70 font-medium text-sm border border-white/10">
            {project.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-white font-semibold">{project.name}</h2>
            <div className={`flex items-center gap-1.5 text-xs ${status.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></div>
              {status.label}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all flex items-center justify-center"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[360px] overflow-y-auto">

        {/* Summary */}
        {project.summary && (
          <Section title="על מה עבדתי" color="blue">
            <p
              className="text-white/80 text-sm leading-relaxed"
              style={{ direction: isHebrew(project.summary) ? 'rtl' : 'ltr' }}
            >
              {project.summary}
            </p>
          </Section>
        )}

        {/* Completed Tasks */}
        {project.completedTasks?.length > 0 && (
          <Section title={`מה עשיתי (${project.completedTasks.length})`} color="green">
            <TaskList tasks={project.completedTasks} completed />
          </Section>
        )}

        {/* Remaining Tasks */}
        {project.remainingTasks?.length > 0 && (
          <Section title={`מה נשאר (${project.remainingTasks.length})`} color="yellow">
            <TaskList tasks={project.remainingTasks} />
          </Section>
        )}

        {/* Next Steps */}
        {project.nextSteps && (
          <Section title="מה הלאה" color="emerald" highlighted>
            <p
              className="text-white/90 text-sm"
              style={{ direction: isHebrew(project.nextSteps) ? 'rtl' : 'ltr' }}
            >
              {project.nextSteps}
            </p>
          </Section>
        )}

        {/* Recent Commits */}
        {project.recentCommits?.length > 0 && (
          <Section title="שינויים אחרונים" color="slate">
            <div className="space-y-2">
              {project.recentCommits.slice(0, 3).map((commit, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm gap-3"
                  style={{ direction: isHebrew(commit.message) ? 'rtl' : 'ltr' }}
                >
                  <span className="text-white/60 truncate flex-1">{commit.message}</span>
                  <span className="text-white/25 text-xs whitespace-nowrap">{formatTimeAgo(commit.date)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Changed Files */}
        {project.changedFiles?.length > 0 && (
          <Section title={`קבצים לא שמורים (${project.changedFiles.length})`} color="orange">
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {project.changedFiles.map((file, i) => (
                <div key={i} className="text-white/40 text-xs font-mono flex gap-2" dir="ltr">
                  <span className={
                    file.status === 'M' ? 'text-yellow-400' :
                    file.status === 'A' ? 'text-green-400' :
                    file.status === 'D' ? 'text-red-400' : 'text-white/40'
                  }>
                    {file.status}
                  </span>
                  <span className="truncate">{file.path}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
        <div className="text-xs text-white/25 flex items-center gap-2">
          <span className="bg-white/10 px-2 py-0.5 rounded">{project.branch}</span>
          <span>עדכון {formatTimeAgo(project.lastActivity)}</span>
        </div>
        <button
          onClick={handleOpenTerminal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
        >
          <TerminalIcon />
          <span>פתח טרמינל</span>
        </button>
      </div>
    </div>
  );
}

function Section({ title, color, highlighted, children }) {
  const colors = {
    blue: 'border-blue-500/20 bg-blue-500/5',
    green: 'border-green-500/20',
    yellow: 'border-yellow-500/20',
    orange: 'border-orange-500/20',
    emerald: 'border-emerald-500/30 bg-emerald-500/10',
    slate: 'border-white/5',
  };

  const titleColors = {
    blue: 'text-blue-400/80',
    green: 'text-green-400/80',
    yellow: 'text-yellow-400/80',
    orange: 'text-orange-400/80',
    emerald: 'text-emerald-400/80',
    slate: 'text-white/40',
  };

  return (
    <div className={`rounded-lg p-3 border ${colors[color]} ${highlighted ? '' : 'bg-white/[0.02]'}`}>
      <div className={`text-xs mb-2 font-medium ${titleColors[color]}`}>
        {title}
      </div>
      {children}
    </div>
  );
}

function TerminalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  );
}

export default ProjectExpanded;

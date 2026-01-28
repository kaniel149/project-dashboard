import TaskList from './TaskList';
import { formatTimeAgo } from '../utils/time';

// Detect if text is Hebrew
function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

function ProjectExpanded({ project, onClose }) {
  const hasUncommitted = project.uncommittedChanges > 0;
  const hasRemainingTasks = project.remainingTasks?.length > 0;

  const getStatusInfo = () => {
    if (hasUncommitted) return { label: 'יש שינויים לא שמורים', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    if (hasRemainingTasks) return { label: 'יש משימות פתוחות', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'הכל מוכן', color: 'text-green-400', bg: 'bg-green-500/20' };
  };

  const status = getStatusInfo();

  const handleOpenTerminal = () => {
    window.electronAPI?.openTerminal(project.path);
  };

  return (
    <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <h2 className="text-white text-lg font-semibold">{project.name}</h2>
          <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
            {status.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-5 max-h-[340px] overflow-y-auto">

        {/* על מה הפרויקט - Summary */}
        {project.summary && (
          <div className="glass-card rounded-lg p-3 border border-blue-500/20 bg-blue-500/5">
            <h3 className="text-blue-400/80 text-xs mb-2 flex items-center gap-1">
              <span>📌</span> על מה עבדתי לאחרונה
            </h3>
            <p
              className="text-white/90 text-sm leading-relaxed"
              style={{ direction: isHebrew(project.summary) ? 'rtl' : 'ltr' }}
            >
              {project.summary}
            </p>
          </div>
        )}

        {/* מה בוצע - Completed Tasks */}
        {project.completedTasks?.length > 0 && (
          <div>
            <h3 className="text-white/50 text-xs mb-2 flex items-center gap-1">
              <span>✅</span> מה כבר עשיתי ({project.completedTasks.length})
            </h3>
            <TaskList tasks={project.completedTasks} completed />
          </div>
        )}

        {/* מה נשאר - Remaining Tasks */}
        {project.remainingTasks?.length > 0 && (
          <div>
            <h3 className="text-white/50 text-xs mb-2 flex items-center gap-1">
              <span>📋</span> מה עוד צריך לעשות ({project.remainingTasks.length})
            </h3>
            <TaskList tasks={project.remainingTasks} />
          </div>
        )}

        {/* הצעד הבא - Next Steps */}
        {project.nextSteps && (
          <div className="glass-card rounded-lg p-3 border border-green-500/20 bg-green-500/5">
            <h3 className="text-green-400/70 text-xs mb-1 flex items-center gap-1">
              <span>👉</span> מה לעשות עכשיו
            </h3>
            <p
              className="text-white/90 text-sm"
              style={{ direction: isHebrew(project.nextSteps) ? 'rtl' : 'ltr' }}
            >
              {project.nextSteps}
            </p>
          </div>
        )}

        {/* שינויים אחרונים - Recent Commits */}
        {project.recentCommits?.length > 0 && (
          <div>
            <h3 className="text-white/50 text-xs mb-2 flex items-center gap-1">
              <span>📝</span> שינויים אחרונים בקוד
            </h3>
            <div className="space-y-2">
              {project.recentCommits.slice(0, 3).map((commit, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between text-sm gap-2 bg-white/5 rounded-lg p-2"
                  style={{ direction: isHebrew(commit.message) ? 'rtl' : 'ltr' }}
                >
                  <span className="text-white/70 truncate flex-1">{commit.message}</span>
                  <span className="text-white/30 text-xs whitespace-nowrap">{formatTimeAgo(commit.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* קבצים שהשתנו - Changed Files */}
        {project.changedFiles?.length > 0 && (
          <div>
            <h3 className="text-orange-400/70 text-xs mb-2 flex items-center gap-1">
              <span>⚠️</span> קבצים שעדיין לא נשמרו ({project.changedFiles.length})
            </h3>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {project.changedFiles.map((file, i) => (
                <div key={i} className="text-white/50 text-xs font-mono flex gap-2" dir="ltr">
                  <span className={file.status === 'M' ? 'text-yellow-400' : file.status === 'A' ? 'text-green-400' : 'text-red-400'}>
                    {file.status}
                  </span>
                  <span className="truncate">{file.path}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer with Terminal Button */}
      <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between">
        <div className="text-xs text-white/30">
          <span>branch: {project.branch}</span>
          <span className="mx-2">•</span>
          <span>עדכון: {formatTimeAgo(project.lastActivity)}</span>
        </div>
        <button
          onClick={handleOpenTerminal}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white text-sm transition-all"
        >
          <span>💻</span>
          <span>פתח טרמינל</span>
        </button>
      </div>
    </div>
  );
}

export default ProjectExpanded;

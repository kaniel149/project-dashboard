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
    if (hasUncommitted) return { label: 'יש שינויים', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    if (hasRemainingTasks) return { label: 'בעבודה', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'מעודכן', color: 'text-green-400', bg: 'bg-green-500/20' };
  };

  const status = getStatusInfo();

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

      <div className="p-4 space-y-5 max-h-[380px] overflow-y-auto">
        {/* Summary */}
        {project.summary && (
          <div className="glass-card rounded-lg p-3 border border-white/5">
            <h3 className="text-white/50 text-xs mb-2 flex items-center gap-1">
              <span>💬</span> סיכום אחרון
            </h3>
            <p
              className="text-white/90 text-sm leading-relaxed"
              style={{ direction: isHebrew(project.summary) ? 'rtl' : 'ltr' }}
            >
              {project.summary}
            </p>
          </div>
        )}

        {/* Completed Tasks */}
        {project.completedTasks?.length > 0 && (
          <div>
            <h3 className="text-white/50 text-xs mb-2 flex items-center gap-1">
              <span>✅</span> בוצע לאחרונה ({project.completedTasks.length})
            </h3>
            <TaskList tasks={project.completedTasks} completed />
          </div>
        )}

        {/* Remaining Tasks */}
        {project.remainingTasks?.length > 0 && (
          <div>
            <h3 className="text-white/50 text-xs mb-2 flex items-center gap-1">
              <span>📋</span> משימות להמשך ({project.remainingTasks.length})
            </h3>
            <TaskList tasks={project.remainingTasks} />
          </div>
        )}

        {/* Recent Commits */}
        {project.recentCommits?.length > 0 && (
          <div>
            <h3 className="text-white/50 text-xs mb-2 flex items-center gap-1">
              <span>📝</span> קומיטים אחרונים
            </h3>
            <div className="space-y-2">
              {project.recentCommits.slice(0, 4).map((commit, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between text-sm gap-2"
                  style={{ direction: isHebrew(commit.message) ? 'rtl' : 'ltr' }}
                >
                  <span className="text-white/70 truncate flex-1">{commit.message}</span>
                  <span className="text-white/30 text-xs whitespace-nowrap">{formatTimeAgo(commit.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Changed Files */}
        {project.changedFiles?.length > 0 && (
          <div>
            <h3 className="text-white/50 text-xs mb-2 flex items-center gap-1">
              <span>📁</span> קבצים שהשתנו ({project.changedFiles.length})
            </h3>
            <div className="space-y-1 max-h-24 overflow-y-auto">
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

        {/* Next Steps */}
        {project.nextSteps && (
          <div className="glass-card rounded-lg p-3 border border-green-500/20 bg-green-500/5">
            <h3 className="text-green-400/70 text-xs mb-1 flex items-center gap-1">
              <span>👉</span> הצעד הבא
            </h3>
            <p
              className="text-white/90 text-sm"
              style={{ direction: isHebrew(project.nextSteps) ? 'rtl' : 'ltr' }}
            >
              {project.nextSteps}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-xs text-white/30">
          <span>branch: {project.branch}</span>
          <span>עדכון: {formatTimeAgo(project.lastActivity)}</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectExpanded;

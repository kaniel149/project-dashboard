import TaskList from './TaskList';
import { formatTimeAgo } from '../utils/time';

const statusLabels = {
  active: 'פעיל',
  paused: 'מושהה',
  blocked: 'חסום',
  completed: 'הושלם'
};

const statusColors = {
  active: 'text-green-400',
  paused: 'text-yellow-400',
  blocked: 'text-red-400',
  completed: 'text-blue-400',
  default: 'text-white/50'
};

function ProjectExpanded({ project, onClose }) {
  const statusLabel = statusLabels[project.status] || project.status;
  const statusColor = statusColors[project.status] || statusColors.default;

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h2 className="text-white text-lg font-medium">{project.name}</h2>
          <span className={`text-sm ${statusColor}`}>{statusLabel}</span>
        </div>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors text-xl"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary */}
        {project.summary && (
          <div>
            <h3 className="text-white/70 text-sm mb-2">סיכום</h3>
            <p className="text-white/90">{project.summary}</p>
          </div>
        )}

        {/* Tasks */}
        <div className="grid grid-cols-2 gap-4">
          {/* Completed Tasks */}
          {project.completedTasks?.length > 0 && (
            <div>
              <h3 className="text-white/70 text-sm mb-2">הושלם</h3>
              <TaskList tasks={project.completedTasks} completed />
            </div>
          )}

          {/* Remaining Tasks */}
          {project.remainingTasks?.length > 0 && (
            <div>
              <h3 className="text-white/70 text-sm mb-2">נותר</h3>
              <TaskList tasks={project.remainingTasks} />
            </div>
          )}
        </div>

        {/* Recent Commits */}
        {project.recentCommits?.length > 0 && (
          <div>
            <h3 className="text-white/70 text-sm mb-2">קומיטים אחרונים</h3>
            <div className="space-y-2">
              {project.recentCommits.map((commit, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white/80 truncate flex-1">{commit.message}</span>
                  <span className="text-white/40 mr-2">{formatTimeAgo(commit.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Changed Files */}
        {project.changedFiles?.length > 0 && (
          <div>
            <h3 className="text-white/70 text-sm mb-2">קבצים שהשתנו</h3>
            <div className="flex flex-wrap gap-1">
              {project.changedFiles.map((file, i) => (
                <span
                  key={i}
                  className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded"
                >
                  {file}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {project.nextSteps?.length > 0 && (
          <div>
            <h3 className="text-white/70 text-sm mb-2">צעדים הבאים</h3>
            <ul className="space-y-1">
              {project.nextSteps.map((step, i) => (
                <li key={i} className="text-white/80 text-sm flex items-start gap-2">
                  <span className="text-white/40">→</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Last Activity */}
        {project.lastActivity && (
          <div className="pt-4 border-t border-white/10">
            <span className="text-white/40 text-xs">
              עדכון אחרון: {formatTimeAgo(project.lastActivity)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectExpanded;

import { formatTimeAgo } from '../utils/time';

const statusColors = {
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  blocked: 'bg-red-500',
  completed: 'bg-blue-500',
  default: 'bg-white/30'
};

function ProjectCard({ project, onClick }) {
  const statusColor = statusColors[project.status] || statusColors.default;
  const completedCount = project.completedTasks?.length || 0;
  const remainingCount = project.remainingTasks?.length || 0;
  const totalTasks = completedCount + remainingCount;

  return (
    <div
      onClick={onClick}
      className="bg-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/10 border border-white/5 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="text-white font-medium">{project.name}</span>
        </div>
        {project.lastActivity && (
          <span className="text-white/40 text-xs">{formatTimeAgo(project.lastActivity)}</span>
        )}
      </div>

      {project.lastCommit && (
        <p className="text-white/50 text-sm mt-2 truncate">
          {project.lastCommit}
        </p>
      )}

      {totalTasks > 0 && (
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(completedCount / totalTasks) * 100}%` }}
            />
          </div>
          <span className="text-white/40 text-xs">
            {completedCount}/{totalTasks}
          </span>
        </div>
      )}
    </div>
  );
}

export default ProjectCard;

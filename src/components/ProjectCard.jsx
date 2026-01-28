import { formatTimeAgo } from '../utils/time';

function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

function ProjectCard({ project, onClick }) {
  const hasUncommitted = project.uncommittedChanges > 0;
  const hasRemainingTasks = project.remainingTasks?.length > 0;

  const getStatusColor = () => {
    if (hasUncommitted) return 'from-orange-500 to-red-500';
    if (hasRemainingTasks) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const commitMessage = project.lastCommit?.message || '';
  const messageDir = isHebrew(commitMessage) ? 'rtl' : 'ltr';

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/[0.03] hover:bg-white/[0.08] rounded-xl p-4 cursor-pointer border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
    >
      {/* Status indicator line */}
      <div className={`absolute right-0 top-3 bottom-3 w-1 rounded-full bg-gradient-to-b ${getStatusColor()} opacity-80`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 pr-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-white/70 font-medium text-sm border border-white/10">
            {project.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-white font-medium">{project.name}</div>
            <div className="text-white/30 text-xs">{project.branch}</div>
          </div>
        </div>
        <div className="text-white/25 text-xs">
          {formatTimeAgo(project.lastActivity)}
        </div>
      </div>

      {/* Last Commit */}
      {commitMessage && (
        <p
          className="text-white/40 text-sm mb-3 truncate pr-3"
          style={{ direction: messageDir, textAlign: messageDir === 'rtl' ? 'right' : 'left' }}
        >
          {commitMessage}
        </p>
      )}

      {/* Summary */}
      {project.summary && (
        <div
          className="text-white/60 text-sm mb-3 line-clamp-2 pr-3 leading-relaxed"
          style={{ direction: isHebrew(project.summary) ? 'rtl' : 'ltr' }}
        >
          {project.summary}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs pr-3">
        {hasRemainingTasks && (
          <div className="flex items-center gap-1.5 text-yellow-400/70 bg-yellow-500/10 px-2 py-1 rounded-md">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
            <span>{project.remainingTasks.length} משימות</span>
          </div>
        )}
        {hasUncommitted && (
          <div className="flex items-center gap-1.5 text-orange-400/70 bg-orange-500/10 px-2 py-1 rounded-md">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
            <span>{project.uncommittedChanges} שינויים</span>
          </div>
        )}
        {!hasRemainingTasks && !hasUncommitted && (
          <div className="flex items-center gap-1.5 text-green-400/70 bg-green-500/10 px-2 py-1 rounded-md">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
            <span>מעודכן</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectCard;

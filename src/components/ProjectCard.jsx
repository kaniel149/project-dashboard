import { formatTimeAgo } from '../utils/time';

// Detect if text is Hebrew
function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

function ProjectCard({ project, onClick }) {
  const hasUncommitted = project.uncommittedChanges > 0;
  const hasRemainingTasks = project.remainingTasks?.length > 0;

  const getStatusColor = () => {
    if (hasUncommitted) return 'bg-orange-500';
    if (hasRemainingTasks) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusGlow = () => {
    if (hasUncommitted) return 'shadow-orange-500/50';
    if (hasRemainingTasks) return 'shadow-yellow-500/50';
    return 'shadow-green-500/50';
  };

  const commitMessage = project.lastCommit?.message || '';
  const messageDir = isHebrew(commitMessage) ? 'rtl' : 'ltr';

  return (
    <div
      onClick={onClick}
      className="glass-card rounded-xl p-4 cursor-pointer hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group"
    >
      {/* Header: Name + Branch + Time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()} shadow-lg ${getStatusGlow()}`} />
          <span className="text-white font-medium text-base">{project.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/40 bg-white/5 px-2 py-0.5 rounded">{project.branch}</span>
          <span className="text-white/30">{formatTimeAgo(project.lastActivity)}</span>
        </div>
      </div>

      {/* Last Commit */}
      {commitMessage && (
        <p
          className="text-white/50 text-sm mb-3 truncate"
          style={{ direction: messageDir, textAlign: messageDir === 'rtl' ? 'right' : 'left' }}
        >
          "{commitMessage}"
        </p>
      )}

      {/* Summary if exists */}
      {project.summary && (
        <p
          className="text-white/70 text-sm mb-3 line-clamp-2 auto-dir"
          style={{ direction: isHebrew(project.summary) ? 'rtl' : 'ltr' }}
        >
          💬 {project.summary}
        </p>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-xs">
        {project.remainingTasks?.length > 0 && (
          <span className="text-yellow-400/80 flex items-center gap-1">
            <span>📋</span>
            <span>{project.remainingTasks.length} משימות</span>
          </span>
        )}
        {hasUncommitted && (
          <span className="text-orange-400/80 flex items-center gap-1">
            <span>⚡</span>
            <span>{project.uncommittedChanges} שינויים</span>
          </span>
        )}
        {!hasRemainingTasks && !hasUncommitted && (
          <span className="text-green-400/80 flex items-center gap-1">
            <span>✓</span>
            <span>הכל מעודכן</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default ProjectCard;

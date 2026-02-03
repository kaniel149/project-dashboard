import { motion } from 'motion/react';
import GitCard from './GitCard';

function GitView({ projects, isFullscreen, onToggleFullscreen }) {
  // Filter to only show projects that are git repos
  const gitProjects = projects.filter(p => p.gitInfo);

  // Sort: Claude active first, then by uncommitted changes, then by name
  const sortedProjects = [...gitProjects].sort((a, b) => {
    // Claude active first
    if (a.claudeLive && !b.claudeLive) return -1;
    if (!a.claudeLive && b.claudeLive) return 1;

    // Then by uncommitted changes (more changes = higher priority)
    const aChanges = a.gitInfo?.status?.uncommitted || 0;
    const bChanges = b.gitInfo?.status?.uncommitted || 0;
    if (aChanges !== bChanges) return bChanges - aChanges;

    // Then alphabetically
    return a.name.localeCompare(b.name);
  });

  const displayedProjects = isFullscreen ? sortedProjects.slice(0, 12) : sortedProjects.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-4 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-white/60 text-xs">
          {gitProjects.length} repos
        </div>
        <motion.button
          onClick={onToggleFullscreen}
          className="text-white/40 hover:text-white/80 text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isFullscreen ? '⛶' : '⛶'}
        </motion.button>
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid gap-3"
        style={{
          gridTemplateColumns: isFullscreen
            ? 'repeat(4, 1fr)'
            : 'repeat(2, 1fr)',
        }}
      >
        {displayedProjects.map((project, index) => (
          <motion.div
            key={project.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GitCard project={project} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty state */}
      {gitProjects.length === 0 && (
        <div className="flex items-center justify-center h-32 text-white/40 text-sm">
          No git repositories found
        </div>
      )}
    </motion.div>
  );
}

export default GitView;

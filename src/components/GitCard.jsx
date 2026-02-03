import { motion } from 'motion/react';
import { Gitgraph, templateExtend, TemplateName } from '@gitgraph/react';

// Custom template for mini graph
const miniTemplate = templateExtend(TemplateName.Metro, {
  colors: ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171'],
  branch: {
    lineWidth: 2,
    spacing: 20,
    label: {
      display: false,
    },
  },
  commit: {
    spacing: 25,
    dot: {
      size: 6,
    },
    message: {
      display: false,
    },
  },
});

function GitCard({ project }) {
  const { name, gitInfo, claudeLive } = project;

  if (!gitInfo) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-xl p-3 flex flex-col"
        style={{ width: 180, height: 200 }}
      >
        <div className="text-white/60 text-xs text-center mt-8">
          Not a git repo
        </div>
      </motion.div>
    );
  }

  const { currentBranch, commits, branches, status } = gitInfo;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-card rounded-xl p-3 flex flex-col cursor-pointer relative overflow-hidden"
      style={{ width: 180, height: 200 }}
    >
      {/* Claude indicator */}
      {claudeLive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full"
          style={{ boxShadow: '0 0 8px rgba(96, 165, 250, 0.8)' }}
        />
      )}

      {/* Header */}
      <div className="mb-2">
        <div className="text-white text-sm font-medium truncate" title={name}>
          {name}
        </div>
        <div className="flex items-center gap-1 text-xs text-white/50">
          <span>🌿</span>
          <span className="truncate">{currentBranch}</span>
        </div>
      </div>

      {/* Mini Git Graph */}
      <div className="flex-1 overflow-hidden rounded-lg bg-black/20 p-2">
        <div style={{ transform: 'scale(0.6)', transformOrigin: 'top left', height: 150 }}>
          <Gitgraph options={{ template: miniTemplate }}>
            {(gitgraph) => {
              // Create branches map
              const branchMap = {};

              // Create main branch
              branchMap['main'] = gitgraph.branch('main');

              // Add commits (simplified visualization)
              const displayCommits = commits.slice(0, 6);

              displayCommits.forEach((commit, idx) => {
                const branchName = commit.branches?.[0]?.replace('origin/', '').replace('HEAD -> ', '') || 'main';

                if (!branchMap[branchName] && branchName !== 'main') {
                  branchMap[branchName] = branchMap['main'].branch(branchName);
                }

                const targetBranch = branchMap[branchName] || branchMap['main'];
                targetBranch.commit({
                  subject: commit.message.slice(0, 20),
                  hash: commit.hash,
                });
              });
            }}
          </Gitgraph>
        </div>
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="flex items-center gap-2 text-white/50">
          {status.ahead > 0 && (
            <span className="text-green-400">↑{status.ahead}</span>
          )}
          {status.behind > 0 && (
            <span className="text-yellow-400">↓{status.behind}</span>
          )}
          {status.ahead === 0 && status.behind === 0 && (
            <span className="text-white/30">synced</span>
          )}
        </div>
        {status.uncommitted > 0 && (
          <span className="text-orange-400">●{status.uncommitted}</span>
        )}
      </div>
    </motion.div>
  );
}

export default GitCard;

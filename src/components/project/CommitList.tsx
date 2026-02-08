import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { cn, formatTimeAgo, formatDateGroup, getTextDir, truncate, stringToColor } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import type { GitCommit } from '@/types';

interface CommitListProps {
  commits: GitCommit[];
  limit?: number;
  className?: string;
}

interface GroupedCommits {
  label: string;
  commits: GitCommit[];
}

function groupCommitsByDay(commits: GitCommit[]): GroupedCommits[] {
  const groups: Map<string, GitCommit[]> = new Map();

  commits.forEach((commit) => {
    const label = formatDateGroup(commit.date);
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(commit);
  });

  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    commits: items,
  }));
}

function CommitItem({ commit, index }: { commit: GitCommit; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });
  const addToast = useAppStore((s) => s.addToast);
  const dir = getTextDir(commit.message);

  const authorInitial = commit.author ? commit.author.charAt(0).toUpperCase() : 'G';
  const authorGradient = commit.author ? stringToColor(commit.author) : 'from-gray-500 to-gray-600';

  const copyHash = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!commit.hash) return;
    navigator.clipboard.writeText(commit.hash).then(() => {
      setCopied(true);
      addToast({ type: 'success', title: 'הועתק!', duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    });
  }, [commit.hash, addToast]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: index * 0.03 }}
    >
      <div
        onClick={() => setExpanded((v) => !v)}
        className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group"
      >
        {/* Mini avatar */}
        <div className={cn(
          'mt-0.5 shrink-0 w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center',
          authorGradient,
        )}>
          <span className="text-[8px] font-bold text-white">{authorInitial}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] text-white/75 leading-snug truncate"
            dir={dir}
            title={commit.message}
          >
            {truncate(commit.message, 80)}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {commit.hash && (
              <motion.button
                onClick={copyHash}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-[10px] font-mono text-white/25 hover:text-blue-400/70 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 rounded px-0.5"
                title="העתק hash"
                dir="ltr"
              >
                {copied ? 'הועתק!' : commit.hash.slice(0, 7)}
              </motion.button>
            )}
            {commit.author && (
              <span className="text-[10px] text-white/20">{commit.author}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <span className="text-[11px] text-white/25">
            {formatTimeAgo(commit.date)}
          </span>
          {/* Expand indicator */}
          <motion.svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-white/15 group-hover:text-white/30 transition-colors"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <path d="M2.5 4L5 6.5L7.5 4" />
          </motion.svg>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="ps-10 pe-3 pb-2 space-y-1.5">
              {/* Full message if truncated */}
              {commit.message.length > 80 && (
                <p className="text-[12px] text-white/50 leading-relaxed" dir={dir}>
                  {commit.message}
                </p>
              )}
              <div className="flex items-center gap-3 text-[10px] text-white/30">
                {commit.hash && (
                  <span className="font-mono" dir="ltr">{commit.hash}</span>
                )}
                {commit.author && (
                  <span>{commit.author}</span>
                )}
                <span>{new Date(commit.date).toLocaleString('he-IL', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}</span>
              </div>
              {commit.branches && commit.branches.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {commit.branches.map((branch) => (
                    <span key={branch} className="text-[9px] font-mono text-purple-400/60 bg-purple-500/10 px-1.5 py-0.5 rounded" dir="ltr">
                      {branch}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function CommitList({ commits, limit = 10, className }: CommitListProps) {
  const [showCount, setShowCount] = useState(limit);
  const visibleCommits = commits.slice(0, showCount);
  const groups = groupCommitsByDay(visibleCommits);
  const hasMore = commits.length > showCount;

  if (commits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <svg width="32" height="32" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/15 mb-2">
          <circle cx="8" cy="3" r="2" />
          <circle cx="8" cy="13" r="2" />
          <path d="M8 5v6" />
        </svg>
        <span className="text-white/30 text-sm">אין commits</span>
      </div>
    );
  }

  let globalIndex = 0;

  return (
    <div className={cn('space-y-3', className)}>
      {groups.map((group) => (
        <div key={group.label}>
          {/* Sticky day header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0f]/80 backdrop-blur-sm px-3 py-1.5 -mx-1">
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              {group.label}
            </span>
          </div>

          {/* Commits */}
          <div className="space-y-0.5">
            {group.commits.map((commit) => {
              const idx = globalIndex++;
              return (
                <CommitItem
                  key={commit.hash || `${commit.date}-${idx}`}
                  commit={commit}
                  index={idx}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasMore && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCount((c) => c + 10)}
          className="w-full py-2 text-center text-[12px] font-medium text-blue-400/60 hover:text-blue-400/90 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg border border-white/[0.04] hover:border-white/[0.08] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
        >
          הצג עוד ({commits.length - showCount} נוספים)
        </motion.button>
      )}
    </div>
  );
}

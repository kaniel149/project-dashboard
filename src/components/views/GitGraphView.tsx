import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useProjectStore } from '@/stores/projectStore';
import { cn, formatTimeAgo } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { Badge } from '@/components/ui/Badge';
import type { Project } from '@/types';

type GitStatus = 'clean' | 'dirty' | 'ahead' | 'behind';

interface GitGroup {
  status: GitStatus;
  label: string;
  color: string;
  dotColor: string;
  borderColor: string;
  projects: Project[];
}

function getGitStatus(project: Project): GitStatus {
  if (project.gitInfo?.status.behind && project.gitInfo.status.behind > 0) return 'behind';
  if (project.uncommittedChanges > 0) return 'dirty';
  if (project.gitInfo?.status.ahead && project.gitInfo.status.ahead > 0) return 'ahead';
  return 'clean';
}

const statusConfig: Record<GitStatus, { label: string; color: string; dotColor: string; borderColor: string; badgeVariant: 'green' | 'yellow' | 'red' | 'blue' }> = {
  clean: { label: 'נקי', color: 'text-green-400', dotColor: 'bg-green-400', borderColor: 'border-green-500/20', badgeVariant: 'green' },
  dirty: { label: 'שינויים', color: 'text-yellow-400', dotColor: 'bg-yellow-400', borderColor: 'border-yellow-500/20', badgeVariant: 'yellow' },
  behind: { label: 'מאחורי Remote', color: 'text-red-400', dotColor: 'bg-red-400', borderColor: 'border-red-500/20', badgeVariant: 'red' },
  ahead: { label: 'לפני Remote', color: 'text-blue-400', dotColor: 'bg-blue-400', borderColor: 'border-blue-500/20', badgeVariant: 'blue' },
};

// ===== Vertical Mini Commit Graph =====

function VerticalCommitDots({ commits, uncommitted }: { commits: number; uncommitted: number }) {
  const dotCount = Math.min(commits, 6);
  const dots = Array.from({ length: dotCount }, (_, i) => i);

  if (dotCount === 0) return null;

  return (
    <div className="flex flex-col items-center gap-0" dir="ltr">
      {dots.map((i) => {
        const isFirst = i === 0;
        const opacity = 1 - i * 0.15;
        return (
          <div key={i} className="flex flex-col items-center">
            {i > 0 && (
              <div className="w-px h-2 bg-white/[0.08]" />
            )}
            <div
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                isFirst && uncommitted > 0 ? 'bg-yellow-400' : 'bg-blue-400',
              )}
              style={{ opacity }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ===== Expandable Project Card =====

function GitProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const status = getGitStatus(project);
  const config = statusConfig[status];

  return (
    <motion.div
      variants={staggerItem}
      className="rounded-xl border bg-white/[0.02] border-white/[0.05] overflow-hidden"
    >
      {/* Main row */}
      <motion.div
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 p-3.5 cursor-pointer transition-colors"
      >
        {/* Status dot */}
        <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', config.dotColor)} />

        {/* Project name */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white/85 truncate">{project.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20 shrink-0">
              <circle cx="5" cy="4" r="2" />
              <circle cx="11" cy="12" r="2" />
              <path d="M5 6v2c0 2.2 1.8 4 4 4h2" />
            </svg>
            <span className="text-[11px] font-mono text-white/35 font-semibold" dir="ltr">{project.branch}</span>
          </div>
        </div>

        {/* Mini commit graph (vertical) */}
        <VerticalCommitDots
          commits={project.recentCommits.length}
          uncommitted={project.uncommittedChanges}
        />

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] shrink-0">
          {project.gitInfo?.status.ahead !== undefined && project.gitInfo.status.ahead > 0 && (
            <span className="text-green-400/70 font-mono">+{project.gitInfo.status.ahead}</span>
          )}
          {project.gitInfo?.status.behind !== undefined && project.gitInfo.status.behind > 0 && (
            <span className="text-red-400/70 font-mono">-{project.gitInfo.status.behind}</span>
          )}
          {project.uncommittedChanges > 0 && (
            <span className="text-yellow-400/70 font-mono">{project.uncommittedChanges}</span>
          )}
          {status === 'clean' && (
            <span className="text-green-400/50 text-[10px]">clean</span>
          )}
        </div>

        {/* Time */}
        <span className="text-[10px] text-white/20 shrink-0">{formatTimeAgo(project.lastActivity)}</span>

        {/* Expand chevron */}
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="text-white/20 shrink-0"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.div>

      {/* Expanded commit list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.04] px-4 py-3 space-y-1.5">
              {project.recentCommits.slice(0, 8).map((commit, i) => (
                <div
                  key={commit.hash || `commit-${i}`}
                  className="flex items-start gap-2.5 text-[12px] py-1"
                >
                  <div className="flex flex-col items-center mt-1 shrink-0">
                    <div className={cn('w-1.5 h-1.5 rounded-full', i === 0 ? 'bg-blue-400' : 'bg-white/[0.15]')} />
                    {i < project.recentCommits.slice(0, 8).length - 1 && (
                      <div className="w-px h-4 bg-white/[0.06]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/55 truncate" dir="ltr">{commit.message}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {commit.hash && (
                        <span className="text-[10px] font-mono text-white/20">{commit.hash.slice(0, 7)}</span>
                      )}
                      <span className="text-[10px] text-white/15">{formatTimeAgo(commit.date)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Navigate button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/projects/${encodeURIComponent(project.name)}`);
                }}
                className="text-[11px] text-blue-400/60 hover:text-blue-400 transition-colors mt-2 cursor-pointer"
              >
                צפה בפרויקט &larr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ===== Main =====

export function GitGraphView() {
  const projects = useProjectStore((s) => s.getFilteredProjects());

  const groups = useMemo<GitGroup[]>(() => {
    const grouped: Record<GitStatus, Project[]> = {
      behind: [],
      dirty: [],
      ahead: [],
      clean: [],
    };

    for (const project of projects) {
      const status = getGitStatus(project);
      grouped[status].push(project);
    }

    // Sort each group by name
    for (const key of Object.keys(grouped) as GitStatus[]) {
      grouped[key].sort((a, b) => a.name.localeCompare(b.name));
    }

    // Build groups in priority order: behind > dirty > ahead > clean
    return (['behind', 'dirty', 'ahead', 'clean'] as GitStatus[])
      .filter((status) => grouped[status].length > 0)
      .map((status) => ({
        status,
        ...statusConfig[status],
        projects: grouped[status],
      }));
  }, [projects]);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-white/10 mb-4">
          <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="34" cy="34" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M14 18v4c0 4.4 3.6 8 8 8h4" stroke="currentColor" strokeWidth="2" />
        </svg>
        <p className="text-white/35 text-sm">לא נמצאו פרויקטים</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {groups.map((group) => (
          <div key={group.status} className="flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', group.dotColor)} />
            <span className="text-xs text-white/50">{group.label}</span>
            <Badge variant={statusConfig[group.status].badgeVariant} size="sm">
              {group.projects.length}
            </Badge>
          </div>
        ))}
      </div>

      {/* Grouped project lists */}
      {groups.map((group) => (
        <div key={group.status}>
          {/* Group header */}
          <div className="flex items-center gap-2 mb-3">
            <span className={cn('w-2.5 h-2.5 rounded-full', group.dotColor)} />
            <h3 className={cn('text-sm font-semibold', group.color)}>{group.label}</h3>
            <div className="flex-1 h-px bg-white/[0.04]" />
            <span className="text-[11px] text-white/25 font-mono">{group.projects.length}</span>
          </div>

          {/* Projects */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-2"
          >
            {group.projects.map((project) => (
              <GitProjectCard key={project.path} project={project} />
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

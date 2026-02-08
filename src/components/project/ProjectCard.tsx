import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatTimeAgo, truncate, getTextDir, isElectron } from '@/lib/utils';
import { STATUS_COLORS, CATEGORY_LABELS } from '@/lib/constants';
import { HealthRing } from './HealthRing';
import { TechStackChips } from './TechStackChips';
import { Badge } from '@/components/ui/Badge';
import { StatusDot } from '@/components/ui/StatusDot';
import { useAppStore } from '@/stores/appStore';
import type { Project } from '@/types';

type CardVariant = 'list' | 'grid' | 'compact';

interface ProjectCardProps {
  project: Project;
  variant?: CardVariant;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

function getStatusColor(project: Project): 'success' | 'warning' | 'error' | 'info' {
  const score = project.healthScore ?? 100;
  if (score >= 70) return 'success';
  if (score >= 50) return 'warning';
  if (score >= 30) return 'error';
  return 'error';
}

function getHealthBreakdown(project: Project) {
  const daysSince = project.lastActivity
    ? Math.floor((Date.now() - new Date(project.lastActivity).getTime()) / 86400000)
    : undefined;
  return {
    daysSinceActivity: daysSince,
    uncommittedChanges: project.uncommittedChanges,
    remainingTasks: project.remainingTasks.length,
    completedTasks: project.completedTasks.length,
  };
}

// Shared quick action buttons for hover reveal
function QuickActions({ project, className }: { project: Project; className?: string }) {
  const addToast = useAppStore((s) => s.addToast);

  const copyPath = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(project.path).then(() => {
      addToast({ type: 'success', title: 'הנתיב הועתק', duration: 2000 });
    });
  }, [project.path, addToast]);

  const openGithub = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const repoName = project.name.toLowerCase().replace(/\s+/g, '-');
    window.open(`https://github.com/${repoName}`, '_blank');
  }, [project.name]);

  const openTerminal = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isElectron && window.electronAPI?.openTerminal) {
      try {
        await window.electronAPI.openTerminal(project.path);
      } catch {
        addToast({ type: 'error', title: 'Failed to open terminal' });
      }
    }
  }, [project.path, addToast]);

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {/* Copy path */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={copyPath}
        className="flex items-center justify-center h-6 w-6 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
        title="העתק נתיב"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="5" width="9" height="9" rx="2" />
          <path d="M5 11H3.5A1.5 1.5 0 012 9.5v-7A1.5 1.5 0 013.5 1h7A1.5 1.5 0 0112 2.5V5" />
        </svg>
      </motion.button>

      {/* GitHub */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={openGithub}
        className="flex items-center justify-center h-6 w-6 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
        title="GitHub"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
      </motion.button>

      {/* Terminal (Electron only) */}
      {isElectron && (
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={openTerminal}
          className="flex items-center justify-center h-6 w-6 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
          title="Terminal"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h12M4 4l4 4-4 4" />
          </svg>
        </motion.button>
      )}
    </div>
  );
}

// ==================== LIST VARIANT ====================
function ListCard({ project, selected, onClick, onDoubleClick }: Omit<ProjectCardProps, 'variant'>) {
  const [hovered, setHovered] = useState(false);
  const statusColor = getStatusColor(project);
  const borderColor = {
    success: 'border-s-green-500/60',
    warning: 'border-s-yellow-500/60',
    error: 'border-s-orange-500/60',
    info: 'border-s-blue-500/60',
  }[statusColor];

  const isClaudeActive = project.claudeLive && (project.claudeLive.status === 'working' || project.claudeLive.status === 'waiting');

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative flex items-center gap-4 px-4 py-3 rounded-xl border-s-[3px] bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm cursor-pointer transition-all duration-200',
        borderColor,
        'hover:bg-white/[0.04] hover:border-white/[0.08] hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)]',
        selected && 'ring-1 ring-blue-500/40 bg-blue-500/[0.04] border-white/[0.10] shadow-[0_0_20px_-6px_rgba(59,130,246,0.2)]',
      )}
    >
      {/* Health Ring */}
      <HealthRing
        score={project.healthScore ?? 100}
        size="sm"
        breakdown={getHealthBreakdown(project)}
      />

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white/90 truncate">{project.name}</h3>
          {isClaudeActive && (
            <StatusDot status={project.claudeLive!.status} size="sm" pulse />
          )}
        </div>
        {project.summary && (
          <p
            className="text-[12px] text-white/40 truncate mt-0.5"
            dir={getTextDir(project.summary)}
          >
            {truncate(project.summary, 80)}
          </p>
        )}
      </div>

      {/* Branch */}
      <div className="hidden sm:flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
          <circle cx="5" cy="4" r="2" />
          <circle cx="11" cy="12" r="2" />
          <path d="M5 6v2c0 2.2 1.8 4 4 4h2" />
        </svg>
        <span className="text-[11px] font-mono text-white/30" dir="ltr">{project.branch}</span>
      </div>

      {/* Badges */}
      <div className="hidden md:flex items-center gap-1.5">
        {project.uncommittedChanges > 0 && (
          <Badge variant="yellow" size="sm">{project.uncommittedChanges} changes</Badge>
        )}
        {project.remainingTasks.length > 0 && (
          <Badge variant="blue" size="sm">{project.remainingTasks.length} tasks</Badge>
        )}
        {isClaudeActive && (
          <Badge
            variant={project.claudeLive!.status === 'working' ? 'blue' : 'yellow'}
            dot
            pulse
            size="sm"
          >
            {STATUS_COLORS[project.claudeLive!.status]?.label}
          </Badge>
        )}
      </div>

      {/* Time + Quick Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <QuickActions project={project} />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="text-[11px] text-white/25">
          {formatTimeAgo(project.lastActivity)}
        </span>
      </div>
    </motion.div>
  );
}

// ==================== GRID VARIANT ====================
function GridCard({ project, selected, onClick, onDoubleClick }: Omit<ProjectCardProps, 'variant'>) {
  const [hovered, setHovered] = useState(false);
  const category = project.category ? CATEGORY_LABELS[project.category] : null;
  const isClaudeActive = project.claudeLive && (project.claudeLive.status === 'working' || project.claudeLive.status === 'waiting');

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative flex flex-col p-4 rounded-2xl border bg-white/[0.03] border-white/[0.06] backdrop-blur-md cursor-pointer transition-all duration-300',
        'hover:bg-white/[0.05] hover:border-white/[0.12] hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)]',
        selected && 'ring-1 ring-blue-500/40 bg-blue-500/[0.04] shadow-[0_0_24px_-6px_rgba(59,130,246,0.25)]',
      )}
    >
      {/* Gradient border on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.05) 50%, rgba(6,182,212,0.08) 100%)',
              borderRadius: 'inherit',
            }}
          />
        )}
      </AnimatePresence>

      {/* Top: Health + Claude status */}
      <div className="relative flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {category && (
            <span className="text-[9px] font-medium text-white/25 bg-white/[0.04] px-1.5 py-0.5 rounded">
              {category}
            </span>
          )}
        </div>
        <HealthRing
          score={project.healthScore ?? 100}
          size="md"
          breakdown={getHealthBreakdown(project)}
        />
      </div>

      {/* Name + Claude indicator */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-semibold text-white/90 truncate">{project.name}</h3>
        {isClaudeActive && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <StatusDot status={project.claudeLive!.status} size="sm" pulse />
          </motion.div>
        )}
      </div>

      {/* Branch */}
      <div className="flex items-center gap-1.5 mb-3">
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
          <circle cx="5" cy="4" r="2" />
          <circle cx="11" cy="12" r="2" />
          <path d="M5 6v2c0 2.2 1.8 4 4 4h2" />
        </svg>
        <span className="text-[10px] font-mono text-white/25" dir="ltr">{project.branch}</span>
      </div>

      {/* Tech Stack */}
      {project.techStack.length > 0 && (
        <div className="mb-3">
          <TechStackChips techs={project.techStack} limit={3} />
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/[0.04]">
        {project.uncommittedChanges > 0 && (
          <span className="text-[11px] text-yellow-400/70">
            {project.uncommittedChanges} changes
          </span>
        )}
        {project.remainingTasks.length > 0 && (
          <span className="text-[11px] text-blue-400/70">
            {project.remainingTasks.length} tasks
          </span>
        )}
        <span className="text-[10px] text-white/20 ms-auto">
          {formatTimeAgo(project.lastActivity)}
        </span>
      </div>

      {/* Quick actions on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-2 end-2"
          >
            <QuickActions project={project} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ==================== COMPACT VARIANT ====================
function CompactCard({ project, selected, onClick }: Omit<ProjectCardProps, 'variant'>) {
  const isClaudeActive = project.claudeLive && (project.claudeLive.status === 'working' || project.claudeLive.status === 'waiting');

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] cursor-pointer transition-colors',
        selected && 'ring-1 ring-blue-500/40 bg-blue-500/[0.04]',
      )}
    >
      <HealthRing score={project.healthScore ?? 100} size="sm" showLabel={false} />
      <span className="text-[13px] font-medium text-white/80 truncate flex-1">{project.name}</span>
      {isClaudeActive && (
        <StatusDot status={project.claudeLive!.status} size="sm" pulse />
      )}
      {project.uncommittedChanges > 0 && (
        <span className="text-[10px] text-yellow-400/60 font-mono tabular-nums">{project.uncommittedChanges}</span>
      )}
      <span className="text-[10px] text-white/20">{formatTimeAgo(project.lastActivity)}</span>
    </motion.div>
  );
}

export function ProjectCard({ project, variant = 'list', selected = false, onClick, onDoubleClick }: ProjectCardProps) {
  switch (variant) {
    case 'grid':
      return <GridCard project={project} selected={selected} onClick={onClick} onDoubleClick={onDoubleClick} />;
    case 'compact':
      return <CompactCard project={project} selected={selected} onClick={onClick} />;
    default:
      return <ListCard project={project} selected={selected} onClick={onClick} />;
  }
}

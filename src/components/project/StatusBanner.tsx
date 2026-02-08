import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { Project, ClaudeLiveStatus } from '@/types';

interface StatusBannerProps {
  project: Project;
  className?: string;
}

type OverallStatus = 'healthy' | 'attention' | 'warning';

function getOverallStatus(project: Project): OverallStatus {
  const score = project.healthScore ?? 100;
  if (score >= 70 && project.uncommittedChanges <= 5) return 'healthy';
  if (score >= 40) return 'attention';
  return 'warning';
}

const statusGradients: Record<OverallStatus, string> = {
  healthy: 'from-green-500/[0.06] via-emerald-500/[0.03] to-transparent',
  attention: 'from-yellow-500/[0.06] via-amber-500/[0.03] to-transparent',
  warning: 'from-red-500/[0.06] via-orange-500/[0.03] to-transparent',
};

const statusBorders: Record<OverallStatus, string> = {
  healthy: 'border-green-500/10',
  attention: 'border-yellow-500/10',
  warning: 'border-red-500/10',
};

function ClaudeStatusIndicator({ claudeLive }: { claudeLive: ClaudeLiveStatus }) {
  const isActive = claudeLive.status === 'working' || claudeLive.status === 'waiting';

  if (!isActive) return null;

  const isWorking = claudeLive.status === 'working';
  const color = isWorking ? 'cyan' : 'yellow';

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <motion.span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-60',
            isWorking ? 'bg-cyan-400' : 'bg-yellow-400',
          )}
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className={cn(
          'relative inline-flex h-2 w-2 rounded-full',
          isWorking ? 'bg-cyan-400' : 'bg-yellow-400',
        )} />
      </span>
      <span className={cn(
        'text-[11px] font-medium',
        isWorking ? 'text-cyan-400/80' : 'text-yellow-400/80',
      )}>
        {isWorking ? 'Claude עובד' : 'מחכה לקלט'}
      </span>
      {claudeLive.message && (
        <span className="text-[10px] text-white/30 truncate max-w-[200px]">
          {claudeLive.message}
        </span>
      )}
    </div>
  );
}

function StatusChip({ icon, label, variant }: {
  icon: React.ReactNode;
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}) {
  const variantClasses = {
    success: 'text-green-400/70 bg-green-500/8',
    warning: 'text-yellow-400/70 bg-yellow-500/8',
    error: 'text-red-400/70 bg-red-500/8',
    info: 'text-blue-400/70 bg-blue-500/8',
    neutral: 'text-white/40 bg-white/[0.04]',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium',
      variantClasses[variant],
    )}>
      {icon}
      {label}
    </span>
  );
}

export function StatusBanner({ project, className }: StatusBannerProps) {
  const overall = getOverallStatus(project);
  const isClaudeActive = project.claudeLive && (project.claudeLive.status === 'working' || project.claudeLive.status === 'waiting');

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-gradient-to-l backdrop-blur-sm overflow-x-auto',
        statusGradients[overall],
        statusBorders[overall],
        className,
      )}
    >
      {/* Claude Status */}
      {isClaudeActive && project.claudeLive && (
        <>
          <ClaudeStatusIndicator claudeLive={project.claudeLive} />
          <div className="w-px h-4 bg-white/[0.06] shrink-0" />
        </>
      )}

      {/* Uncommitted changes */}
      {project.uncommittedChanges > 0 && (
        <StatusChip
          variant={project.uncommittedChanges > 10 ? 'warning' : 'info'}
          icon={
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
          }
          label={`${project.uncommittedChanges} שינויים לא שמורים`}
        />
      )}

      {/* Remaining tasks */}
      {project.remainingTasks.length > 0 && (
        <StatusChip
          variant="neutral"
          icon={
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="12" height="12" rx="3" />
              <path d="M5 8h6" />
            </svg>
          }
          label={`${project.remainingTasks.length} משימות`}
        />
      )}

      {/* Branch */}
      <StatusChip
        variant="neutral"
        icon={
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="5" cy="4" r="2" />
            <circle cx="11" cy="12" r="2" />
            <path d="M5 6v2c0 2.2 1.8 4 4 4h2" />
          </svg>
        }
        label={project.branch}
      />

      {/* Git ahead/behind */}
      {project.gitInfo?.status && (project.gitInfo.status.ahead > 0 || project.gitInfo.status.behind > 0) && (
        <StatusChip
          variant={project.gitInfo.status.behind > 0 ? 'warning' : 'info'}
          icon={
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 2v12M4 6l4-4 4 4" />
            </svg>
          }
          label={[
            project.gitInfo.status.ahead > 0 && `${project.gitInfo.status.ahead}\u2191`,
            project.gitInfo.status.behind > 0 && `${project.gitInfo.status.behind}\u2193`,
          ].filter(Boolean).join(' ')}
        />
      )}

      {/* Health score on the far end */}
      <div className="ms-auto flex items-center gap-1.5 shrink-0">
        <span className={cn(
          'text-[11px] font-medium',
          overall === 'healthy' ? 'text-green-400/60' : overall === 'attention' ? 'text-yellow-400/60' : 'text-red-400/60',
        )}>
          {overall === 'healthy' ? 'תקין' : overall === 'attention' ? 'צריך תשומת לב' : 'דורש טיפול'}
        </span>
        <div className={cn(
          'w-2 h-2 rounded-full',
          overall === 'healthy' ? 'bg-green-400' : overall === 'attention' ? 'bg-yellow-400' : 'bg-red-400',
        )} />
      </div>
    </motion.div>
  );
}

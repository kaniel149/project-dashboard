import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useProjectStore } from '@/stores/projectStore';
import { useAppStore } from '@/stores/appStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { HealthRing } from '@/components/project/HealthRing';
import { TechStackChips } from '@/components/project/TechStackChips';
import { CommitList } from '@/components/project/CommitList';
import { ChangedFilesList } from '@/components/project/ChangedFilesList';
import { TaskChecklist } from '@/components/project/TaskChecklist';
import { cn, formatTimeAgo, getTextDir, getHealthStatus, isElectron } from '@/lib/utils';
import { pageTransition, pageSpring } from '@/lib/motion';
import { CATEGORY_LABELS, STATUS_COLORS } from '@/lib/constants';

type TabId = 'overview' | 'git' | 'tasks' | 'files';

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'סקירה' },
  { id: 'git', label: 'Git' },
  { id: 'tasks', label: 'משימות' },
  { id: 'files', label: 'קבצים' },
];

const tabIndexMap: Record<TabId, number> = { overview: 0, git: 1, tasks: 2, files: 3 };

export default function ProjectDetailPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const addToast = useAppStore((s) => s.addToast);
  const getProjectByName = useProjectStore((s) => s.getProjectByName);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [prevTabIndex, setPrevTabIndex] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const project = useMemo(
    () => (name ? getProjectByName(decodeURIComponent(name)) : undefined),
    [name, getProjectByName],
  );

  const handleTabChange = useCallback((tabId: TabId) => {
    setPrevTabIndex(tabIndexMap[activeTab]);
    setActiveTab(tabId);
  }, [activeTab]);

  // Direction of tab slide: positive = going right, negative = going left
  const slideDirection = tabIndexMap[activeTab] > prevTabIndex ? 1 : -1;

  if (!project) {
    return (
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        transition={pageSpring}
        className="p-6"
      >
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20">
              <circle cx="24" cy="24" r="18" />
              <path d="M18 18l12 12M30 18l-12 12" strokeLinecap="round" />
            </svg>
          }
          title="פרויקט לא נמצא"
          description={`"${name}" לא קיים במערכת`}
          action={{ label: 'חזרה לפרויקטים', onClick: () => navigate('/projects') }}
        />
      </motion.div>
    );
  }

  const score = project.healthScore ?? 100;
  const healthStatus = getHealthStatus(score);
  const category = project.category ? CATEGORY_LABELS[project.category] : null;

  // Calculate project age
  const projectAge = useMemo(() => {
    if (!project.recentCommits.length) return null;
    const oldest = project.recentCommits[project.recentCommits.length - 1];
    if (!oldest?.date) return null;
    const days = Math.floor((Date.now() - new Date(oldest.date).getTime()) / 86400000);
    if (days < 7) return `${days} ימים`;
    if (days < 30) return `${Math.floor(days / 7)} שבועות`;
    return `${Math.floor(days / 30)} חודשים`;
  }, [project.recentCommits]);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageSpring}
      className="space-y-5 p-6"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          to="/projects"
          className="text-white/40 hover:text-white/60 transition-colors"
        >
          פרויקטים
        </Link>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/20 rotate-180">
          <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-white/80 font-medium truncate">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 10.5L5 7l3.5-3.5" />
              </svg>
            }
          />
          <div>
            <h1 className="text-xl font-bold text-white/90">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                <circle cx="5" cy="4" r="2" />
                <circle cx="11" cy="12" r="2" />
                <path d="M5 6v2c0 2.2 1.8 4 4 4h2" />
              </svg>
              <span className="text-xs font-mono text-white/30">{project.branch}</span>
              {category && (
                <Badge variant="gray" size="sm">{category}</Badge>
              )}
              {project.claudeLive && project.claudeLive.status !== 'idle' && (
                <Badge
                  variant={project.claudeLive.status === 'working' ? 'blue' : project.claudeLive.status === 'waiting' ? 'yellow' : 'gray'}
                  dot
                  pulse={project.claudeLive.status === 'working' || project.claudeLive.status === 'waiting'}
                  size="sm"
                >
                  {STATUS_COLORS[project.claudeLive.status]?.label}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons - work in both web & electron */}
        <div className="flex items-center gap-1.5">
          {isElectron ? (
            <>
              <ActionButton
                label="Terminal"
                onClick={() => window.electronAPI?.openTerminal(project.path)}
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12h12M4 4l4 4-4 4" />
                  </svg>
                }
              />
              <ActionButton
                label="VSCode"
                onClick={() => window.electronAPI?.openVSCode(project.path)}
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 4L1 8l4 4M11 4l4 4-4 4" />
                  </svg>
                }
              />
              <ActionButton
                label="Claude"
                onClick={() => window.electronAPI?.openClaude(project.path)}
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="6" r="4" />
                    <path d="M4 14c0-2.2 1.8-4 4-4s4 1.8 4 4" />
                  </svg>
                }
              />
            </>
          ) : (
            <>
              <ActionButton
                label="GitHub"
                onClick={() => window.open('https://github.com', '_blank')}
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                }
              />
              <ActionButton
                label="העתק נתיב"
                onClick={() => {
                  navigator.clipboard.writeText(project.path);
                  addToast({ type: 'success', title: 'הנתיב הועתק' });
                }}
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="5" width="9" height="9" rx="1.5" />
                    <path d="M3.5 11H3a1.5 1.5 0 01-1.5-1.5v-7A1.5 1.5 0 013 1h7a1.5 1.5 0 011.5 1.5V3" />
                  </svg>
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Main layout: Sidebar + Content */}
      <div className={cn(
        'grid gap-5',
        sidebarCollapsed
          ? 'grid-cols-1'
          : 'grid-cols-1 lg:grid-cols-[280px_1fr]',
      )}>
        {/* Left sidebar card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={cn(sidebarCollapsed && 'hidden lg:hidden')}
        >
          <GlassCard depth={1} className="p-5 space-y-5">
            {/* Collapse button (tablet) */}
            <div className="hidden md:flex lg:hidden justify-end">
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="text-white/30 hover:text-white/60 p-1 rounded transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9 3L5 7l4 4" />
                </svg>
              </button>
            </div>

            {/* Health ring with tooltip */}
            <div className="flex flex-col items-center gap-2">
              <HealthRing score={score} size="lg" />
              <span className={cn('text-xs font-medium', healthStatus.color)}>
                {healthStatus.label}
              </span>
            </div>

            {/* Info list */}
            <div className="space-y-3 text-sm">
              <InfoRow label="Branch" value={<span className="font-mono text-xs">{project.branch}</span>} />
              <InfoRow
                label="שינויים"
                value={
                  <span className={cn('font-mono text-xs', project.uncommittedChanges > 0 ? 'text-yellow-400' : 'text-white/40')}>
                    {project.uncommittedChanges}
                  </span>
                }
              />
              <InfoRow
                label="משימות"
                value={
                  <span className="font-mono text-xs text-white/60">
                    {project.completedTasks.length}/{project.completedTasks.length + project.remainingTasks.length}
                  </span>
                }
              />
              <InfoRow
                label="פעילות אחרונה"
                value={<span className="text-xs text-white/50">{formatTimeAgo(project.lastActivity)}</span>}
              />
              {projectAge && (
                <InfoRow
                  label="גיל פרויקט"
                  value={<span className="text-xs text-white/50">{projectAge}</span>}
                />
              )}
              {project.gitInfo && (
                <>
                  {project.gitInfo.status.ahead > 0 && (
                    <InfoRow
                      label="Ahead"
                      value={<span className="text-green-400 font-mono text-xs">+{project.gitInfo.status.ahead}</span>}
                    />
                  )}
                  {project.gitInfo.status.behind > 0 && (
                    <InfoRow
                      label="Behind"
                      value={<span className="text-red-400 font-mono text-xs">-{project.gitInfo.status.behind}</span>}
                    />
                  )}
                </>
              )}
            </div>

            {/* Tech stack */}
            {project.techStack.length > 0 && (
              <div>
                <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2">Tech Stack</p>
                <TechStackChips techs={project.techStack} limit={8} />
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Collapsed sidebar expand button */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="hidden lg:flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors mb-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 3l4 4-4 4" />
            </svg>
            הצג פרטים
          </button>
        )}

        {/* Right content */}
        <div className="space-y-4">
          {/* Tabs with ARIA attributes */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-xl bg-white/[0.03] border border-white/[0.05] w-fit"
            role="tablist"
            aria-label="Project tabs"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer relative',
                  activeTab === tab.id
                    ? 'text-white/90'
                    : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]',
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-active-pill"
                    className="absolute inset-0 rounded-lg bg-white/[0.10] shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content - direction-aware slide */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: slideDirection * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection * -24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
              {activeTab === 'overview' && (
                <GlassCard depth={1} className="p-5 space-y-5">
                  {/* Summary */}
                  {project.summary && (
                    <div>
                      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">סיכום</h3>
                      <p className="text-sm text-white/70 leading-relaxed" dir={getTextDir(project.summary)}>
                        {project.summary}
                      </p>
                    </div>
                  )}

                  {/* Known Issues */}
                  {project.knownIssues.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">בעיות ידועות</h3>
                      <ul className="space-y-1">
                        {project.knownIssues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/55" dir={getTextDir(issue)}>
                            <span className="text-orange-400/60 mt-0.5 shrink-0">&#x2022;</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Steps */}
                  {project.nextSteps && (
                    <div>
                      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">צעדים הבאים</h3>
                      <p className="text-sm text-white/60 leading-relaxed" dir={getTextDir(project.nextSteps)}>
                        {project.nextSteps}
                      </p>
                    </div>
                  )}

                  {/* Current Status */}
                  {Object.keys(project.currentStatus).length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">סטטוס</h3>
                      <div className="space-y-2">
                        {Object.entries(project.currentStatus).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2 text-sm">
                            <span className="text-white/40 shrink-0 font-medium">{key}:</span>
                            <span className="text-white/60" dir={getTextDir(value)}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!project.summary && project.knownIssues.length === 0 && !project.nextSteps && Object.keys(project.currentStatus).length === 0 && (
                    <div className="text-center py-8 text-white/20 text-sm">
                      אין מידע נוסף על פרויקט זה
                    </div>
                  )}
                </GlassCard>
              )}

              {activeTab === 'git' && (
                <GlassCard depth={1} className="p-5 space-y-5">
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Commits אחרונים</h3>
                  <CommitList commits={project.recentCommits} limit={20} />
                </GlassCard>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  {project.remainingTasks.length > 0 && (
                    <GlassCard depth={1} className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">משימות פתוחות</h3>
                        <Badge variant="blue" size="sm">{project.remainingTasks.length}</Badge>
                      </div>
                      <TaskChecklist tasks={project.remainingTasks} />
                    </GlassCard>
                  )}

                  {project.completedTasks.length > 0 && (
                    <GlassCard depth={1} className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">הושלמו</h3>
                        <Badge variant="green" size="sm">{project.completedTasks.length}</Badge>
                      </div>
                      <TaskChecklist tasks={project.completedTasks} completed />
                    </GlassCard>
                  )}

                  {project.remainingTasks.length === 0 && project.completedTasks.length === 0 && (
                    <GlassCard depth={1} className="p-5">
                      <div className="text-center py-8 text-white/20 text-sm">
                        אין משימות
                      </div>
                    </GlassCard>
                  )}
                </div>
              )}

              {activeTab === 'files' && (
                <GlassCard depth={1} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">קבצים ששונו</h3>
                    {project.changedFiles.length > 0 && (
                      <Badge variant="yellow" size="sm">{project.changedFiles.length}</Badge>
                    )}
                  </div>
                  <ChangedFilesList files={project.changedFiles} />
                </GlassCard>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ===== Helper components =====

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40">{label}</span>
      {value}
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/80 hover:bg-white/[0.08] hover:border-white/[0.10] transition-colors cursor-pointer"
      title={label}
    >
      {icon}
    </motion.button>
  );
}

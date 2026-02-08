import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import { useProjectStore } from '@/stores/projectStore';
import { useAppStore } from '@/stores/appStore';
import { StatsCard } from '@/components/ui/StatsCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { StatusDot } from '@/components/ui/StatusDot';
import { Button } from '@/components/ui/Button';
import { HealthRing } from '@/components/project/HealthRing';
import { cn, formatTimeAgo, getTextDir, truncate, isElectron } from '@/lib/utils';
import { pageTransition, pageSpring } from '@/lib/motion';
import type { Project, TimelineEntry } from '@/types';

// ===== Time-of-day helpers =====

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'לילה טוב';
  if (hour < 12) return 'בוקר טוב';
  if (hour < 17) return 'צהריים טובים';
  if (hour < 21) return 'ערב טוב';
  return 'לילה טוב';
}

// ===== Stagger variants with variable delays =====

const statsStagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.03 } },
};

const cardsStagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
};

const listStagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

// ===== Icons =====

const projectsIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 14.25a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5V3.75A1.5 1.5 0 013 2.25h4.5l1.5 2.25H15a1.5 1.5 0 011.5 1.5v8.25z" />
  </svg>
);

const claudeIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="4.5" />
    <path d="M4.5 16.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
  </svg>
);

const changesIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.25l3.75 3.75L12 9.75" />
    <path d="M2.25 9v-.75A3.75 3.75 0 016 4.5h9.75" />
    <path d="M6 15.75L2.25 12 6 8.25" />
    <path d="M15.75 9v.75a3.75 3.75 0 01-3.75 3.75H2.25" />
  </svg>
);

const tasksIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h9.75M6 9h9.75M6 15h9.75" />
    <path d="M2.25 3h.008M2.25 9h.008M2.25 15h.008" />
  </svg>
);

const refreshIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 8a7 7 0 0113.16-3.36M15 8A7 7 0 011.84 11.36" />
    <path d="M14 1v4h-4M2 15v-4h4" />
  </svg>
);

const githubIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const copyIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="5" width="9" height="9" rx="1.5" />
    <path d="M3.5 11H3a1.5 1.5 0 01-1.5-1.5v-7A1.5 1.5 0 013 1h7a1.5 1.5 0 011.5 1.5V3" />
  </svg>
);

const syncIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 8a7 7 0 0113.16-3.36M15 8A7 7 0 011.84 11.36" />
    <path d="M14 1v4h-4M2 15v-4h4" />
  </svg>
);

const searchIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="7" cy="7" r="5" />
    <path d="M14 14l-3.5-3.5" />
  </svg>
);

// ===== Sub-components =====

function ActiveSessionCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/projects/${encodeURIComponent(project.name)}`)}
      className={cn(
        'relative flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.10] cursor-pointer transition-all overflow-hidden',
        (project.claudeLive?.status === 'working' || project.claudeLive?.status === 'waiting') &&
          'shadow-[0_0_20px_-8px_rgba(59,130,246,0.25)] border-blue-500/15',
      )}
    >
      {/* Subtle pulsing glow border */}
      {project.claudeLive?.status === 'working' && (
        <motion.div
          className="absolute inset-0 rounded-xl border border-blue-500/20 pointer-events-none"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <StatusDot
        status={project.claudeLive?.status || 'idle'}
        size="md"
        pulse
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/85 truncate">{project.name}</p>
        {project.claudeLive?.message && (
          <p className="text-[11px] text-white/35 truncate mt-0.5"
             dir={getTextDir(project.claudeLive.message)}>
            {truncate(project.claudeLive.message, 60)}
          </p>
        )}
      </div>
      <Badge
        variant={project.claudeLive?.status === 'working' ? 'blue' : 'yellow'}
        dot
        pulse
        size="sm"
      >
        {project.claudeLive?.status === 'working' ? 'עובד' : 'מחכה'}
      </Badge>
    </motion.div>
  );
}

function ScrollRevealEntry({ entry }: { entry: TimelineEntry }) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const isCommit = entry.type === 'commit';
  const dir = getTextDir(entry.message);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group"
      onClick={() => navigate(`/projects/${encodeURIComponent(entry.project)}`)}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0">
        {isCommit ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20 group-hover:text-white/40">
            <circle cx="8" cy="4" r="2" />
            <circle cx="8" cy="12" r="2" />
            <path d="M8 6v4" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400/50 group-hover:text-purple-400/70">
            <circle cx="8" cy="6" r="3.5" />
            <path d="M4.5 14c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Project badge */}
        <span className="inline-block text-[10px] font-medium text-white/40 bg-white/[0.04] px-1.5 py-0.5 rounded mb-0.5">
          {entry.project}
        </span>
        <p className="text-[12px] text-white/60 truncate" dir={dir}>
          {truncate(entry.message, 70)}
        </p>
      </div>

      <span className="text-[10px] text-white/20 shrink-0 mt-1">
        {formatTimeAgo(entry.date)}
      </span>
    </motion.div>
  );
}

function NeedsAttentionCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  const score = project.healthScore ?? 0;
  const prevScore = score; // In real app would track changes
  const trend = prevScore === score ? '' : prevScore < score ? '\u2191' : '\u2193';

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.01, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/projects/${encodeURIComponent(project.name)}`)}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] cursor-pointer transition-all"
    >
      <HealthRing score={score} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-white/80 truncate">{project.name}</p>
          {trend && (
            <span className={cn('text-[10px]', trend === '\u2191' ? 'text-green-400' : 'text-red-400')}>
              {trend}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {project.uncommittedChanges > 10 && (
            <span className="text-[10px] text-yellow-400/70">{project.uncommittedChanges} changes</span>
          )}
          {project.remainingTasks.length > 0 && (
            <span className="text-[10px] text-blue-400/70">{project.remainingTasks.length} tasks</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ===== Main Dashboard =====

export default function DashboardPage() {
  const projects = useProjectStore((s) => s.projects);
  const getActiveClaudeSessions = useProjectStore((s) => s.getActiveClaudeSessions);
  const getProjectsNeedingAttention = useProjectStore((s) => s.getProjectsNeedingAttention);
  const getTimelineEntries = useProjectStore((s) => s.getTimelineEntries);
  const refresh = useProjectStore((s) => s.refresh);
  const loading = useProjectStore((s) => s.loading);
  const addToast = useAppStore((s) => s.addToast);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const navigate = useNavigate();

  const activeSessions = getActiveClaudeSessions();
  const needsAttention = getProjectsNeedingAttention();
  const recentActivity = getTimelineEntries().slice(0, 15);

  const totalUncommitted = useMemo(
    () => projects.reduce((sum, p) => sum + p.uncommittedChanges, 0),
    [projects],
  );
  const totalTasks = useMemo(
    () => projects.reduce((sum, p) => sum + p.remainingTasks.length, 0),
    [projects],
  );

  const handleRefresh = async () => {
    await refresh();
    addToast({ type: 'success', title: 'רוענן בהצלחה' });
  };

  // Build smart summary sentence
  const summaryParts: string[] = [];
  if (projects.length > 0) summaryParts.push(`${projects.length} פרויקטים פעילים`);
  if (activeSessions.length > 0) summaryParts.push(`${activeSessions.length} Claude sessions`);
  if (totalUncommitted > 0) summaryParts.push(`${totalUncommitted} שינויים לא committed`);
  if (totalTasks > 0) summaryParts.push(`${totalTasks} משימות פתוחות`);
  const smartSummary = summaryParts.join(', ');

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageSpring}
      className="space-y-6 p-6"
    >
      {/* Hero Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <h1 className="text-2xl font-bold text-white/95 tracking-tight">
          {getGreeting()}, Kaniel
        </h1>
        {smartSummary && (
          <p className="text-sm text-white/40 mt-1">{smartSummary}</p>
        )}
      </motion.div>

      {/* Hero Stats */}
      <motion.div
        variants={statsStagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          label="פרויקטים"
          value={projects.length}
          icon={projectsIcon}
          color="blue"
          glow
          onClick={() => navigate('/projects')}
        />
        <StatsCard
          label="Claude פעיל"
          value={activeSessions.length}
          icon={claudeIcon}
          color="purple"
          glow={activeSessions.length > 0}
          onClick={() => {
            if (activeSessions.length > 0) {
              navigate(`/projects/${encodeURIComponent(activeSessions[0].name)}`);
            }
          }}
        />
        <StatsCard
          label="שינויים"
          value={totalUncommitted}
          icon={changesIcon}
          color="orange"
          onClick={() => navigate('/projects?filter=hasChanges')}
        />
        <StatsCard
          label="משימות"
          value={totalTasks}
          icon={tasksIcon}
          color="cyan"
          onClick={() => navigate('/projects?filter=hasTasks')}
        />
      </motion.div>

      {/* Mobile: Needs Attention on top */}
      <div className="block lg:hidden">
        {needsAttention.length > 0 && (
          <GlassCard depth={1} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white/80">צריכים טיפול</h2>
              <Badge variant="orange" size="sm">{needsAttention.length}</Badge>
            </div>
            <motion.div
              variants={listStagger}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              {needsAttention.map((project) => (
                <NeedsAttentionCard key={project.path} project={project} />
              ))}
            </motion.div>
          </GlassCard>
        )}
      </div>

      {/* Main 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Claude Sessions */}
        <GlassCard depth={1} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/80">Claude Sessions פעילים</h2>
            {activeSessions.length > 0 && (
              <Badge variant="blue" dot pulse size="sm">{activeSessions.length}</Badge>
            )}
          </div>
          {activeSessions.length > 0 ? (
            <motion.div
              variants={cardsStagger}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              {activeSessions.map((project) => (
                <ActiveSessionCard key={project.path} project={project} />
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15">
                  <circle cx="10" cy="8" r="5" />
                  <path d="M5 18c0-2.76 2.24-5 5-5s5 2.24 5 5" />
                </svg>
              </div>
              <p className="text-white/25 text-sm">אין sessions פעילים</p>
            </div>
          )}
        </GlassCard>

        {/* Recent Activity (scroll-linked reveal) */}
        <GlassCard depth={1} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/80">פעילות אחרונה</h2>
            <span className="text-[11px] text-white/25">{recentActivity.length} פריטים</span>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-0.5 max-h-80 overflow-y-auto scrollbar-thin">
              {recentActivity.map((entry) => (
                <ScrollRevealEntry key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 text-white/20 text-sm">
              אין פעילות אחרונה
            </div>
          )}
        </GlassCard>

        {/* Needs Attention (desktop) */}
        <div className="hidden lg:block">
          <GlassCard depth={1} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white/80">צריכים טיפול</h2>
              {needsAttention.length > 0 && (
                <Badge variant="orange" size="sm">{needsAttention.length}</Badge>
              )}
            </div>
            {needsAttention.length > 0 ? (
              <motion.div
                variants={listStagger}
                initial="initial"
                animate="animate"
                className="space-y-2"
              >
                {needsAttention.map((project) => (
                  <NeedsAttentionCard key={project.path} project={project} />
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="text-2xl mb-2 opacity-30">&#10003;</div>
                <p className="text-white/30 text-sm">הכל בסדר</p>
                <p className="text-white/15 text-xs mt-0.5">כל הפרויקטים תקינים</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Quick Actions - Works in both web & electron modes */}
        <GlassCard depth={1} className="p-5">
          <h2 className="text-sm font-semibold text-white/80 mb-4">פעולות מהירות</h2>
          <div className="space-y-2">
            <Button
              variant="secondary"
              size="md"
              icon={refreshIcon}
              onClick={handleRefresh}
              loading={loading}
              className="w-full justify-start"
            >
              רענן פרויקטים
            </Button>

            {isElectron ? (
              <>
                <Button
                  variant="ghost"
                  size="md"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 4L1 8l4 4M11 4l4 4-4 4" />
                    </svg>
                  }
                  onClick={() => {
                    const first = projects[0];
                    if (first) window.electronAPI?.openVSCode(first.path);
                  }}
                  className="w-full justify-start"
                >
                  פתח VSCode
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12h12M4 4l4 4-4 4" />
                    </svg>
                  }
                  onClick={() => {
                    const first = projects[0];
                    if (first) window.electronAPI?.openTerminal(first.path);
                  }}
                  className="w-full justify-start"
                >
                  פתח Terminal
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  icon={claudeIcon}
                  onClick={() => {
                    const first = projects[0];
                    if (first) window.electronAPI?.openClaude(first.path);
                  }}
                  className="w-full justify-start"
                >
                  פתח Claude
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="md"
                  icon={githubIcon}
                  onClick={() => {
                    window.open('https://github.com', '_blank');
                  }}
                  className="w-full justify-start"
                >
                  פתח GitHub
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  icon={copyIcon}
                  onClick={() => {
                    const first = projects[0];
                    if (first) {
                      navigator.clipboard.writeText(first.path);
                      addToast({ type: 'success', title: 'הנתיב הועתק' });
                    }
                  }}
                  className="w-full justify-start"
                >
                  העתק נתיב
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  icon={syncIcon}
                  onClick={handleRefresh}
                  loading={loading}
                  className="w-full justify-start"
                >
                  סנכרן עכשיו
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  icon={searchIcon}
                  onClick={() => setCommandPaletteOpen(true)}
                  className="w-full justify-start"
                >
                  <span className="flex items-center gap-2">
                    חיפוש
                    <kbd className="text-[10px] text-white/20 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">
                      &#8984;K
                    </kbd>
                  </span>
                </Button>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}

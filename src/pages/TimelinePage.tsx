import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { useProjectStore } from '@/stores/projectStore';
import { cn, formatTimeAgo, formatDateGroup, getTextDir, truncate } from '@/lib/utils';
import { pageTransition, pageSpring } from '@/lib/motion';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { EmptyState } from '@/components/ui/EmptyState';
import type { TimelineEntry, TimelineDay } from '@/types';

type EntryTypeFilter = 'all' | 'commit' | 'claude_session';

// ===== Heatmap =====

function ActivityHeatmap({ entries }: { entries: TimelineEntry[] }) {
  // Generate 13 weeks (91 days) of data
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 90);

  // Count commits per day
  const dayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      if (entry.type !== 'commit') continue;
      const d = new Date(entry.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [entries]);

  // Build grid of days
  const weeks = useMemo(() => {
    const result: { date: Date; count: number; key: string }[][] = [];
    let currentWeek: { date: Date; count: number; key: string }[] = [];
    const d = new Date(startDate);

    // Align to start of week (Sunday)
    d.setDate(d.getDate() - d.getDay());

    while (d <= today) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      currentWeek.push({ date: new Date(d), count: dayCounts[key] || 0, key });

      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
      d.setDate(d.getDate() + 1);
    }
    if (currentWeek.length > 0) result.push(currentWeek);
    return result;
  }, [dayCounts, startDate, today]);

  const maxCount = useMemo(() => Math.max(1, ...Object.values(dayCounts)), [dayCounts]);

  function getColor(count: number): string {
    if (count === 0) return 'bg-white/[0.04]';
    const intensity = count / maxCount;
    if (intensity > 0.75) return 'bg-green-400';
    if (intensity > 0.5) return 'bg-green-500/80';
    if (intensity > 0.25) return 'bg-green-600/60';
    return 'bg-green-700/40';
  }

  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 overflow-x-auto scrollbar-thin">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">פעילות - 3 חודשים אחרונים</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-white/30">
          <span>פחות</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-white/[0.04]" />
          <span className="w-2.5 h-2.5 rounded-sm bg-green-700/40" />
          <span className="w-2.5 h-2.5 rounded-sm bg-green-600/60" />
          <span className="w-2.5 h-2.5 rounded-sm bg-green-500/80" />
          <span className="w-2.5 h-2.5 rounded-sm bg-green-400" />
          <span>יותר</span>
        </div>
      </div>
      <div className="flex gap-[3px]" dir="ltr">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.key}
                className={cn(
                  'w-[11px] h-[11px] rounded-[2px] transition-colors',
                  getColor(day.count),
                  day.count > 0 && 'hover:ring-1 hover:ring-white/20',
                )}
                title={`${day.key}: ${day.count} commits`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Timeline Entry with useInView =====

function TimelineEntryRow({ entry, expanded, onToggle }: { entry: TimelineEntry; expanded: boolean; onToggle: () => void }) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const isCommit = entry.type === 'commit';
  const dir = getTextDir(entry.message);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative"
    >
      {/* Timeline line (RTL-safe: border-s) */}
      <div className="absolute top-0 bottom-0 border-s-2 border-white/[0.06]" style={{ insetInlineStart: '11px' }} />

      {/* Dot */}
      <div
        className={cn(
          'absolute w-3 h-3 rounded-full border-2 border-[#0e0e14]',
          isCommit ? 'bg-blue-400' : 'bg-purple-400',
        )}
        style={{ insetInlineStart: '6px', top: '14px' }}
      />

      <div
        className="ps-10 py-2 group cursor-pointer"
        onClick={(e) => {
          if (isCommit && entry.metadata?.hash) {
            onToggle();
          } else {
            navigate(`/projects/${encodeURIComponent(entry.project)}`);
          }
        }}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <span className="inline-block text-[10px] font-medium text-white/40 bg-white/[0.04] px-1.5 py-0.5 rounded">
            {entry.project}
          </span>
          <span className="text-[10px] text-white/15">{formatTimeAgo(entry.date)}</span>
          {isCommit && (
            <span className="text-[10px] text-white/15 font-mono">
              {/* Commit icon */}
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline -mt-px">
                <circle cx="8" cy="4" r="2" />
                <circle cx="8" cy="12" r="2" />
                <path d="M8 6v4" />
              </svg>
            </span>
          )}
          {!isCommit && (
            <span className="text-[10px] text-purple-400/40 font-mono">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline -mt-px text-purple-400/40">
                <circle cx="8" cy="6" r="3.5" />
                <path d="M4.5 14c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5" />
              </svg>
            </span>
          )}
        </div>
        <p className="text-[13px] text-white/60 group-hover:text-white/80 transition-colors" dir={dir}>
          {truncate(entry.message, 120)}
        </p>
        {entry.type === 'commit' && typeof entry.metadata?.hash === 'string' && (
          <span className="text-[10px] font-mono text-white/15 mt-0.5 inline-block">
            {(entry.metadata.hash as string).slice(0, 7)}
          </span>
        )}

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && isCommit && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] space-y-1.5">
                {typeof entry.metadata?.hash === 'string' && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-white/30">Hash:</span>
                    <span className="font-mono text-white/50" dir="ltr">{entry.metadata.hash}</span>
                  </div>
                )}
                {typeof entry.metadata?.author === 'string' && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-white/30">Author:</span>
                    <span className="text-white/50" dir="ltr">{entry.metadata.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-white/30">Date:</span>
                  <span className="text-white/50">{new Date(entry.date).toLocaleString('he-IL')}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/projects/${encodeURIComponent(entry.project)}`);
                  }}
                  className="text-[11px] text-blue-400/70 hover:text-blue-400 transition-colors mt-1"
                >
                  צפה בפרויקט &larr;
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ===== Grouping =====

function groupEntriesByDay(entries: TimelineEntry[]): TimelineDay[] {
  const groups: Map<string, TimelineEntry[]> = new Map();

  for (const entry of entries) {
    const d = new Date(entry.date);
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const existing = groups.get(dayKey);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(dayKey, [entry]);
    }
  }

  return Array.from(groups.entries()).map(([, entries]) => ({
    date: entries[0].date,
    label: formatDateGroup(entries[0].date),
    entries,
  }));
}

// ===== Main Page =====

export default function TimelinePage() {
  const projects = useProjectStore((s) => s.projects);
  const getTimelineEntries = useProjectStore((s) => s.getTimelineEntries);

  const [typeFilter, setTypeFilter] = useState<EntryTypeFilter>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allEntries = getTimelineEntries();

  const projectOptions = useMemo(() => {
    const names = [...new Set(projects.map((p) => p.name))].sort();
    return [
      { value: 'all', label: 'כל הפרויקטים' },
      ...names.map((name) => ({ value: name, label: name })),
    ];
  }, [projects]);

  const filteredEntries = useMemo(() => {
    let entries = allEntries;
    if (typeFilter !== 'all') {
      entries = entries.filter((e) => e.type === typeFilter);
    }
    if (projectFilter !== 'all') {
      entries = entries.filter((e) => e.project === projectFilter);
    }
    return entries;
  }, [allEntries, typeFilter, projectFilter]);

  const days = useMemo(() => groupEntriesByDay(filteredEntries), [filteredEntries]);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageSpring}
      className="space-y-5 p-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white/90">ציר זמן</h1>
        <p className="text-sm text-white/35 mt-0.5">{filteredEntries.length} אירועים</p>
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap entries={allEntries} />

      {/* Smart Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Project filter (custom dropdown) */}
        <Dropdown
          value={projectFilter}
          onChange={setProjectFilter}
          options={projectOptions}
          placeholder="כל הפרויקטים"
          className="w-48"
        />

        {/* Type filter chips */}
        <div className="flex items-center gap-1">
          {([
            { id: 'all' as const, label: 'הכל' },
            { id: 'commit' as const, label: 'Commits' },
            { id: 'claude_session' as const, label: 'Claude' },
          ]).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setTypeFilter(filter.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border cursor-pointer',
                typeFilter === filter.id
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                  : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {days.length > 0 ? (
        <div className="space-y-6">
          {days.map((day) => (
            <div key={day.date}>
              {/* Sticky day header */}
              <div className="sticky top-0 z-10 flex items-center gap-3 mb-2 py-1 bg-[#0a0a0f]/80 backdrop-blur-md">
                <span className="text-sm font-semibold text-white/60">{day.label}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <Badge variant="gray" size="sm">{day.entries.length}</Badge>
              </div>

              {/* Entries with stagger-on-scroll */}
              <div className="space-y-0">
                {day.entries.map((entry) => (
                  <TimelineEntryRow
                    key={entry.id}
                    entry={entry}
                    expanded={expandedId === entry.id}
                    onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-white/15">
              <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
              <path d="M24 14v10l6 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
          title="אין אירועים"
          description="נסה לשנות את הפילטרים או לבחור פרויקט אחר"
        />
      )}
    </motion.div>
  );
}

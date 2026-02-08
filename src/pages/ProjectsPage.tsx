import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProjectStore } from '@/stores/projectStore';
import { cn } from '@/lib/utils';
import { pageTransition, pageSpring } from '@/lib/motion';
import { FILTER_OPTIONS, SORT_OPTIONS } from '@/lib/constants';
import { SearchInput } from '@/components/ui/SearchInput';
import { Dropdown } from '@/components/ui/Dropdown';
import { ListView } from '@/components/views/ListView';
import { GridView } from '@/components/views/GridView';
import { KanbanView } from '@/components/views/KanbanView';
import { GitGraphView } from '@/components/views/GitGraphView';
import type { ViewMode } from '@/types';

const viewComponents: Record<ViewMode, React.FC> = {
  list: ListView,
  grid: GridView,
  kanban: KanbanView,
  git: GitGraphView,
};

// Sort dropdown options with icons
const sortDropdownOptions = SORT_OPTIONS.map((opt) => ({
  value: opt.id,
  label: opt.label,
}));

export default function ProjectsPage() {
  const activeFilter = useProjectStore((s) => s.activeFilter);
  const setFilter = useProjectStore((s) => s.setFilter);
  const sortKey = useProjectStore((s) => s.sortKey);
  const setSortKey = useProjectStore((s) => s.setSortKey);
  const searchQuery = useProjectStore((s) => s.searchQuery);
  const setSearchQuery = useProjectStore((s) => s.setSearchQuery);
  const viewMode = useProjectStore((s) => s.viewMode);
  const allProjects = useProjectStore((s) => s.projects);
  const projects = useProjectStore((s) => s.getFilteredProjects());

  // Compute filter counts
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allProjects.length,
      hasChanges: allProjects.filter((p) => p.uncommittedChanges > 0).length,
      hasTasks: allProjects.filter((p) => p.remainingTasks.length > 0).length,
      claudeActive: allProjects.filter(
        (p) => p.claudeLive?.status === 'working' || p.claudeLive?.status === 'waiting',
      ).length,
    };
    return counts;
  }, [allProjects]);

  const ViewComponent = viewComponents[viewMode];

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
        <h1 className="text-xl font-bold text-white/90">פרויקטים</h1>
        <p className="text-sm text-white/35 mt-0.5">{projects.length} פרויקטים</p>
      </div>

      {/* Toolbar: Search + Filters + Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="חיפוש פרויקטים..."
          shortcutHint="/"
          className="w-full sm:w-64"
        />

        {/* Filter chips - horizontal scrollable on mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 -mb-1 max-w-full relative">
          {/* Fade edges on mobile */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-l from-transparent to-[#0a0a0f] pointer-events-none sm:hidden z-10" />
          {FILTER_OPTIONS.map((filter) => {
            const count = filterCounts[filter.id] ?? 0;
            return (
              <button
                key={filter.id}
                onClick={() => setFilter(filter.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border cursor-pointer whitespace-nowrap shrink-0',
                  activeFilter === filter.id
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                    : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60',
                )}
              >
                {filter.label}
                {filter.id !== 'all' && count > 0 && (
                  <span className={cn(
                    'ms-1.5 text-[10px] font-mono',
                    activeFilter === filter.id ? 'text-blue-400/70' : 'text-white/25',
                  )}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort dropdown (custom, not native select) */}
        <div className="sm:mr-auto w-36 shrink-0">
          <Dropdown
            value={sortKey}
            onChange={(val) => setSortKey(val as typeof sortKey)}
            options={sortDropdownOptions}
            placeholder="מיון..."
          />
        </div>
      </div>

      {/* View Content with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.2 }}
        >
          <ViewComponent />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

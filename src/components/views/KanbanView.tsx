import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProjectStore } from '@/stores/projectStore';
import { ProjectCard } from '@/components/project/ProjectCard';
import { KANBAN_COLUMNS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Project, KanbanColumn } from '@/types';

const columnHeaderColors: Record<string, string> = {
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
  gray: 'text-white/40',
};

const columnDotColors: Record<string, string> = {
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
  orange: 'bg-orange-400',
  gray: 'bg-white/30',
};

const columnBorderColors: Record<string, string> = {
  blue: 'border-blue-500/20',
  purple: 'border-purple-500/20',
  orange: 'border-orange-500/20',
  gray: 'border-white/[0.06]',
};

function categorizeProject(project: Project): KanbanColumn {
  if (project.claudeLive?.status === 'working' || project.claudeLive?.status === 'waiting') {
    return 'inProgress';
  }
  if (project.uncommittedChanges > 5 || project.remainingTasks.length > 5 || (project.healthScore ?? 100) < 40) {
    return 'needsAttention';
  }
  const threeDaysAgo = Date.now() - 3 * 86400000;
  if (project.lastActivity && new Date(project.lastActivity).getTime() > threeDaysAgo) {
    return 'active';
  }
  return 'idle';
}

// ===== Sortable Card =====

function SortableKanbanCard({ project, onNavigate }: { project: Project; onNavigate: (name: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.path });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    scale: isDragging ? 0.95 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'touch-manipulation',
          isDragging && 'shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] z-50',
        )}
      >
        <ProjectCard
          project={project}
          variant="compact"
          onClick={() => onNavigate(project.name)}
        />
      </motion.div>
    </div>
  );
}

// ===== Drag Overlay Card =====

function DragOverlayCard({ project }: { project: Project }) {
  return (
    <div className="opacity-90 scale-105 shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)] rounded-xl">
      <ProjectCard project={project} variant="compact" />
    </div>
  );
}

// ===== Main =====

export function KanbanView() {
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.getFilteredProjects());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, KanbanColumn>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const columns = useMemo(() => {
    const grouped: Record<KanbanColumn, Project[]> = {
      active: [],
      inProgress: [],
      needsAttention: [],
      idle: [],
    };

    for (const project of projects) {
      const col = overrides[project.path] ?? categorizeProject(project);
      grouped[col].push(project);
    }

    return grouped;
  }, [projects, overrides]);

  const activeProject = useMemo(
    () => projects.find((p) => p.path === activeId),
    [projects, activeId],
  );

  const handleOpen = useCallback((name: string) => {
    navigate(`/projects/${encodeURIComponent(name)}`);
  }, [navigate]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const projectPath = String(active.id);
    const overId = String(over.id);

    // Check if dropped over a column
    const column = KANBAN_COLUMNS.find((c) => c.id === overId);
    if (column) {
      setOverrides((prev) => ({ ...prev, [projectPath]: column.id }));
      return;
    }

    // Check if dropped over another card - find which column it belongs to
    for (const col of KANBAN_COLUMNS) {
      const projectsInCol = columns[col.id];
      if (projectsInCol.some((p) => p.path === overId)) {
        setOverrides((prev) => ({ ...prev, [projectPath]: col.id }));
        return;
      }
    }
  }, [columns]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Visual feedback during drag
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[400px]">
        {KANBAN_COLUMNS.map((col) => {
          const projectsInCol = columns[col.id];
          const ids = projectsInCol.map((p) => p.path);

          return (
            <div
              key={col.id}
              id={col.id}
              className={cn(
                'flex flex-col rounded-2xl bg-white/[0.02] border p-3 min-h-[200px]',
                columnBorderColors[col.color],
                activeId && 'border-dashed',
              )}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={cn('w-2 h-2 rounded-full', columnDotColors[col.color])} />
                <span className={cn('text-sm font-semibold', columnHeaderColors[col.color])}>
                  {col.label}
                </span>
                <span className="text-[11px] font-mono text-white/25 ms-auto tabular-nums">
                  {projectsInCol.length}
                </span>
              </div>

              {/* Sortable cards */}
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 flex-1">
                  <AnimatePresence>
                    {projectsInCol.map((project) => (
                      <motion.div
                        key={project.path}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      >
                        <SortableKanbanCard
                          project={project}
                          onNavigate={handleOpen}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {projectsInCol.length === 0 && (
                    <div className={cn(
                      'flex items-center justify-center py-8 text-white/15 text-xs rounded-xl border border-dashed min-h-[80px]',
                      activeId ? 'border-white/[0.12] bg-white/[0.02]' : 'border-white/[0.04]',
                    )}>
                      {activeId ? 'שחרר כאן' : 'ריק'}
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeProject && <DragOverlayCard project={activeProject} />}
      </DragOverlay>
    </DndContext>
  );
}

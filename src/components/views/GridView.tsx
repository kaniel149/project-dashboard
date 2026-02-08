import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useProjectStore } from '@/stores/projectStore';
import { ProjectCard } from '@/components/project/ProjectCard';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';

type CardSize = 'compact' | 'normal' | 'large';

const gridClasses: Record<CardSize, string> = {
  compact: 'grid-cols-[repeat(auto-fill,minmax(220px,1fr))]',
  normal: 'grid-cols-[repeat(auto-fill,minmax(280px,1fr))]',
  large: 'grid-cols-[repeat(auto-fill,minmax(360px,1fr))]',
};

export function GridView() {
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.getFilteredProjects());
  const selectedIndex = useProjectStore((s) => s.selectedIndex);
  const setSelectedIndex = useProjectStore((s) => s.setSelectedIndex);
  const [cardSize, setCardSize] = useState<CardSize>('normal');
  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setInitialRender(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = useCallback((name: string) => {
    navigate(`/projects/${encodeURIComponent(name)}`);
  }, [navigate]);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-white/10 mb-4">
          <rect x="6" y="6" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
          <rect x="28" y="6" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
          <rect x="6" y="28" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
          <rect x="28" y="28" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
        </svg>
        <p className="text-white/35 text-sm">לא נמצאו פרויקטים</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Size toggle */}
      <div className="flex items-center gap-1 justify-end">
        {(['compact', 'normal', 'large'] as const).map((size) => (
          <button
            key={size}
            onClick={() => setCardSize(size)}
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              cardSize === size
                ? 'bg-white/[0.08] text-white/70'
                : 'text-white/25 hover:text-white/50 hover:bg-white/[0.04]',
            )}
            title={size === 'compact' ? 'קומפקטי' : size === 'normal' ? 'רגיל' : 'גדול'}
          >
            {size === 'compact' && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="1" y="1" width="3.5" height="3.5" rx="0.5" />
                <rect x="5.5" y="1" width="3.5" height="3.5" rx="0.5" />
                <rect x="10" y="1" width="3" height="3.5" rx="0.5" />
                <rect x="1" y="5.5" width="3.5" height="3.5" rx="0.5" />
                <rect x="5.5" y="5.5" width="3.5" height="3.5" rx="0.5" />
                <rect x="10" y="5.5" width="3" height="3.5" rx="0.5" />
              </svg>
            )}
            {size === 'normal' && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="1" y="1" width="5.5" height="5.5" rx="1" />
                <rect x="7.5" y="1" width="5.5" height="5.5" rx="1" />
                <rect x="1" y="7.5" width="5.5" height="5.5" rx="1" />
                <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" />
              </svg>
            )}
            {size === 'large' && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="1" y="1" width="12" height="5.5" rx="1" />
                <rect x="1" y="7.5" width="12" height="5.5" rx="1" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        variants={initialRender ? staggerContainer : undefined}
        initial={initialRender ? 'initial' : false}
        animate="animate"
        className={cn('grid gap-4', gridClasses[cardSize])}
      >
        {projects.map((project, i) => (
          <motion.div key={project.path} variants={initialRender ? staggerItem : undefined}>
            <ProjectCard
              project={project}
              variant="grid"
              selected={i === selectedIndex}
              onClick={() => setSelectedIndex(i)}
              onDoubleClick={() => handleOpen(project.name)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

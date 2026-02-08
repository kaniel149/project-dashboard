import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useProjectStore } from '@/stores/projectStore';
import { ProjectCard } from '@/components/project/ProjectCard';
import { staggerContainer, staggerItem } from '@/lib/motion';

export function ListView() {
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.getFilteredProjects());
  const selectedIndex = useProjectStore((s) => s.selectedIndex);
  const moveSelection = useProjectStore((s) => s.moveSelection);
  const setSelectedIndex = useProjectStore((s) => s.setSelectedIndex);
  const [initialRender, setInitialRender] = useState(true);

  // After first render, disable stagger for subsequent filter changes
  useEffect(() => {
    const timer = setTimeout(() => setInitialRender(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = useCallback(
    (name: string) => {
      navigate(`/projects/${encodeURIComponent(name)}`);
    },
    [navigate],
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'j':
          e.preventDefault();
          moveSelection('down');
          break;
        case 'k':
          e.preventDefault();
          moveSelection('up');
          break;
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < projects.length) {
            e.preventDefault();
            handleOpen(projects[selectedIndex].name);
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIndex, projects, moveSelection, handleOpen]);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-white/10 mb-4">
          <path d="M42 38H6V14l10.5-8h15L42 14v24z" stroke="currentColor" strokeWidth="2" />
          <path d="M18 24h12M18 30h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-white/35 text-sm">לא נמצאו פרויקטים</p>
        <p className="text-white/20 text-xs mt-1">נסה לשנות את הפילטר או החיפוש</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={initialRender ? staggerContainer : undefined}
      initial={initialRender ? 'initial' : false}
      animate="animate"
      className="space-y-1.5"
    >
      {projects.map((project, i) => (
        <motion.div
          key={project.path}
          variants={initialRender ? staggerItem : undefined}
        >
          <ProjectCard
            project={project}
            variant="list"
            selected={i === selectedIndex}
            onClick={() => {
              // Single click: select only (no navigate)
              setSelectedIndex(i);
            }}
            onDoubleClick={() => {
              // Double-click: navigate
              handleOpen(project.name);
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

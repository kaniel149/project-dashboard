import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Fuse from 'fuse.js';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/tokens';
import { mainNavItems } from '@/config/navigation';
import { Kbd } from './Kbd';

interface CommandItem {
  id: string;
  label: string;
  section: 'Projects' | 'Pages' | 'Actions';
  icon: string;
  action: () => void;
  keywords?: string;
}

export default function CommandPalette() {
  const navigate = useNavigate();
  const open = useAppStore((s) => s.commandPaletteOpen);
  const setOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const projects = useProjectStore((s) => s.projects);
  const refresh = useProjectStore((s) => s.refresh);
  const setViewMode = useProjectStore((s) => s.setViewMode);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build items
  const items = useMemo<CommandItem[]>(() => {
    const result: CommandItem[] = [];

    // Projects
    for (const project of projects) {
      result.push({
        id: `project-${project.path}`,
        label: project.name,
        section: 'Projects',
        icon: '\uD83D\uDCC1',
        action: () => {
          navigate(`/projects/${encodeURIComponent(project.name)}`);
          setOpen(false);
        },
        keywords: `${project.category || ''} ${project.branch} ${project.summary || ''}`,
      });
    }

    // Pages
    for (const nav of mainNavItems) {
      result.push({
        id: `page-${nav.id}`,
        label: nav.label,
        section: 'Pages',
        icon: nav.icon === 'home' ? '\uD83C\uDFE0' : nav.icon === 'folder' ? '\uD83D\uDCC2' : nav.icon === 'clock' ? '\u23F0' : '\u2699\uFE0F',
        action: () => {
          navigate(nav.path);
          setOpen(false);
        },
      });
    }

    // Actions
    result.push({
      id: 'action-refresh',
      label: 'Refresh Projects',
      section: 'Actions',
      icon: '\uD83D\uDD04',
      action: () => {
        refresh();
        setOpen(false);
      },
      keywords: 'reload sync update',
    });
    result.push({
      id: 'action-grid-view',
      label: 'Switch to Grid View',
      section: 'Actions',
      icon: '\uD83D\uDD32',
      action: () => {
        setViewMode('grid');
        navigate('/projects');
        setOpen(false);
      },
      keywords: 'cards tiles',
    });
    result.push({
      id: 'action-list-view',
      label: 'Switch to List View',
      section: 'Actions',
      icon: '\u2630',
      action: () => {
        setViewMode('list');
        navigate('/projects');
        setOpen(false);
      },
      keywords: 'rows table',
    });
    result.push({
      id: 'action-kanban-view',
      label: 'Switch to Kanban View',
      section: 'Actions',
      icon: '\uD83D\uDCCB',
      action: () => {
        setViewMode('kanban');
        navigate('/projects');
        setOpen(false);
      },
      keywords: 'board columns',
    });

    return result;
  }, [projects, navigate, setOpen, refresh, setViewMode]);

  // Fuse search
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ['label', 'keywords'],
        threshold: 0.4,
        includeScore: true,
      }),
    [items],
  );

  const results = query.trim()
    ? fuse.search(query).map((r) => r.item)
    : items;

  // Group by section
  const grouped = useMemo(() => {
    const sections = new Map<string, CommandItem[]>();
    for (const item of results) {
      const group = sections.get(item.section) || [];
      group.push(item);
      sections.set(item.section, group);
    }
    return sections;
  }, [results]);

  const flatResults = useMemo(() => results, [results]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Clamp selection
  useEffect(() => {
    if (selectedIndex >= flatResults.length) {
      setSelectedIndex(Math.max(0, flatResults.length - 1));
    }
  }, [flatResults.length, selectedIndex]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % flatResults.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
          break;
        case 'Enter':
          e.preventDefault();
          flatResults[selectedIndex]?.action();
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [flatResults, selectedIndex, setOpen],
  );

  // Global Cmd+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 flex items-start justify-center pt-[15vh]"
          style={{ zIndex: zIndex.commandPalette }}
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0e0e16]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 border-b border-white/[0.06]">
              <svg
                className="h-5 w-5 text-white/30 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search projects, pages, actions..."
                className="flex-1 bg-transparent py-4 text-sm text-white/90 placeholder:text-white/30 outline-none"
              />
              <Kbd>ESC</Kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="max-h-80 overflow-y-auto py-2 scrollbar-thin"
            >
              {flatResults.length === 0 ? (
                <div className="py-8 text-center text-sm text-white/30">
                  No results found
                </div>
              ) : (
                Array.from(grouped.entries()).map(([section, sectionItems]) => (
                  <div key={section}>
                    <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/25">
                      {section}
                    </div>
                    {sectionItems.map((item) => {
                      const globalIndex = flatResults.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          data-index={globalIndex}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={cn(
                            'flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-white/[0.06] text-white/95'
                              : 'text-white/60 hover:text-white/80',
                          )}
                        >
                          <span className="text-base flex-shrink-0">{item.icon}</span>
                          <span className="flex-1 truncate">{item.label}</span>
                          {isSelected && (
                            <Kbd>Enter</Kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.06] text-[11px] text-white/25">
              <span className="inline-flex items-center gap-1">
                <Kbd>{'\u2191'}</Kbd>
                <Kbd>{'\u2193'}</Kbd>
                navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <Kbd>{'\u21B5'}</Kbd>
                select
              </span>
              <span className="inline-flex items-center gap-1">
                <Kbd>esc</Kbd>
                close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

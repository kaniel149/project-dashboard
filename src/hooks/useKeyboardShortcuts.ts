import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { useProjectStore } from '@/stores/projectStore';

/**
 * Global keyboard shortcuts handler
 * Supports vim-style g-then-X sequences
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { toggleCommandPalette, toggleShortcutOverlay, setSidebarCollapsed } = useAppStore();
  const { refresh } = useProjectStore();
  const pendingGoRef = useRef(false);
  const goTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      // Check if user is typing in an input
      const target = e.target as HTMLElement;
      const tag = target?.tagName;
      const isInput =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable;

      // Cmd+K - Command Palette (always works)
      if (meta && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Cmd+R - Refresh
      if (meta && e.key === 'r') {
        e.preventDefault();
        refresh();
        return;
      }

      // Cmd+1-4 - Navigate pages
      if (meta && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const routes = ['/', '/projects', '/timeline', '/settings'];
        const index = parseInt(e.key) - 1;
        if (routes[index]) navigate(routes[index]);
        return;
      }

      // Skip the rest if in input
      if (isInput) return;

      // ? - Toggle keyboard shortcut overlay
      if (e.key === '?' && !meta) {
        e.preventDefault();
        toggleShortcutOverlay();
        return;
      }

      // [ - Collapse sidebar
      if (e.key === '[' && !meta) {
        e.preventDefault();
        setSidebarCollapsed(true);
        return;
      }

      // ] - Expand sidebar
      if (e.key === ']' && !meta) {
        e.preventDefault();
        setSidebarCollapsed(false);
        return;
      }

      // Vim-style g-then-X navigation
      if (pendingGoRef.current) {
        pendingGoRef.current = false;
        clearTimeout(goTimerRef.current);

        switch (e.key) {
          case 'd':
            e.preventDefault();
            navigate('/');
            return;
          case 'p':
            e.preventDefault();
            navigate('/projects');
            return;
          case 't':
            e.preventDefault();
            navigate('/timeline');
            return;
          case 's':
            e.preventDefault();
            navigate('/settings');
            return;
        }
      }

      if (e.key === 'g' && !meta) {
        pendingGoRef.current = true;
        // Clear after 800ms if no second key pressed
        clearTimeout(goTimerRef.current);
        goTimerRef.current = setTimeout(() => {
          pendingGoRef.current = false;
        }, 800);
        return;
      }

      // / - Focus search
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
        return;
      }

      // Escape - Close/deselect
      if (e.key === 'Escape') {
        const { shortcutOverlayOpen, setShortcutOverlayOpen, commandPaletteOpen, setCommandPaletteOpen } = useAppStore.getState();
        if (shortcutOverlayOpen) {
          setShortcutOverlayOpen(false);
          return;
        }
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
          return;
        }
        const { selectedProjectPath, selectProject } = useProjectStore.getState();
        if (selectedProjectPath) {
          selectProject(null);
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimeout(goTimerRef.current);
    };
  }, [navigate, toggleCommandPalette, toggleShortcutOverlay, setSidebarCollapsed, refresh]);
}

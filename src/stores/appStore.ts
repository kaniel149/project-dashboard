import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, Toast } from '@/types';
import { uid } from '@/lib/utils';

interface AppState {
  // UI
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  isElectronCollapsed: boolean;
  shortcutOverlayOpen: boolean;
  scrolledDown: boolean;

  // Settings
  settings: AppSettings;

  // Toast (not persisted)
  toasts: Toast[];

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setElectronCollapsed: (collapsed: boolean) => void;
  setShortcutOverlayOpen: (open: boolean) => void;
  toggleShortcutOverlay: () => void;
  setScrolledDown: (scrolled: boolean) => void;

  // Settings
  updateSettings: (partial: Partial<AppSettings>) => void;

  // Toast
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  sidebarCollapsed: false,
  defaultView: 'list',
  defaultSort: 'activity',
  refreshInterval: 60,
  showNotifications: true,
  keyboardNavEnabled: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      isElectronCollapsed: false,
      shortcutOverlayOpen: false,
      scrolledDown: false,

      // Settings
      settings: DEFAULT_SETTINGS,

      // Toast
      toasts: [],

      // Actions
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      setCommandPaletteOpen: (open) =>
        set({ commandPaletteOpen: open }),

      toggleCommandPalette: () =>
        set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

      setElectronCollapsed: (collapsed) =>
        set({ isElectronCollapsed: collapsed }),

      setShortcutOverlayOpen: (open) =>
        set({ shortcutOverlayOpen: open }),

      toggleShortcutOverlay: () =>
        set((s) => ({ shortcutOverlayOpen: !s.shortcutOverlayOpen })),

      setScrolledDown: (scrolled) =>
        set({ scrolledDown: scrolled }),

      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),

      addToast: (toast) => {
        const id = uid();
        const newToast = { ...toast, id };
        set((s) => ({ toasts: [...s.toasts, newToast] }));

        // Auto-remove after duration
        const duration = toast.duration || 4000;
        setTimeout(() => {
          get().removeToast(id);
        }, duration);
      },

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'project-dashboard-settings',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        settings: state.settings,
      }),
    }
  )
);

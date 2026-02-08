import { create } from 'zustand';
import type { Project, ViewMode, ProjectSortKey, ProjectFilter, TimelineEntry } from '@/types';
import { calculateHealthScore } from '@/lib/utils';

interface ProjectState {
  // Data
  projects: Project[];
  loading: boolean;
  error: string | null;
  lastRefresh: number;

  // View
  viewMode: ViewMode;
  sortKey: ProjectSortKey;
  activeFilter: ProjectFilter;
  searchQuery: string;
  selectedIndex: number;
  selectedProjectPath: string | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortKey: (key: ProjectSortKey) => void;
  setFilter: (filter: ProjectFilter) => void;
  setSearchQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
  selectProject: (path: string | null) => void;
  moveSelection: (direction: 'up' | 'down') => void;
  refresh: () => Promise<void>;

  // Computed
  getFilteredProjects: () => Project[];
  getSortedProjects: (projects: Project[]) => Project[];
  getTimelineEntries: () => TimelineEntry[];
  getActiveClaudeSessions: () => Project[];
  getProjectsNeedingAttention: () => Project[];
  getProjectByPath: (path: string) => Project | undefined;
  getProjectByName: (name: string) => Project | undefined;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Data
  projects: [],
  loading: true,
  error: null,
  lastRefresh: 0,

  // View
  viewMode: 'list',
  sortKey: 'activity',
  activeFilter: 'all',
  searchQuery: '',
  selectedIndex: -1,
  selectedProjectPath: null,

  // Actions
  setProjects: (projects) => {
    const enriched = projects.map((p) => ({
      ...p,
      healthScore: calculateHealthScore(p),
    }));
    set({ projects: enriched, loading: false, lastRefresh: Date.now() });
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setViewMode: (mode) => set({ viewMode: mode, selectedIndex: -1 }),
  setSortKey: (key) => set({ sortKey: key }),
  setFilter: (filter) => set({ activeFilter: filter, selectedIndex: -1 }),
  setSearchQuery: (query) => set({ searchQuery: query, selectedIndex: -1 }),
  setSelectedIndex: (index) => set({ selectedIndex: index }),
  selectProject: (path) => set({ selectedProjectPath: path }),

  moveSelection: (direction) => {
    const state = get();
    const filtered = state.getFilteredProjects();
    const maxIndex = filtered.length - 1;

    if (maxIndex < 0) return;

    let newIndex: number;
    if (direction === 'down') {
      newIndex = state.selectedIndex >= maxIndex ? 0 : state.selectedIndex + 1;
    } else {
      newIndex = state.selectedIndex <= 0 ? maxIndex : state.selectedIndex - 1;
    }

    set({ selectedIndex: newIndex });
  },

  refresh: async () => {
    set({ loading: true });
    try {
      const isElectron = !!window.electronAPI;
      if (isElectron) {
        await window.electronAPI?.refreshProjects();
      } else {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        get().setProjects(data.projects || []);
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  // Computed
  getFilteredProjects: () => {
    const { projects, searchQuery, activeFilter } = get();
    let filtered = [...projects];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.summary?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.branch.toLowerCase().includes(q)
      );
    }

    // Filter
    switch (activeFilter) {
      case 'hasChanges':
        filtered = filtered.filter((p) => p.uncommittedChanges > 0);
        break;
      case 'hasTasks':
        filtered = filtered.filter((p) => p.remainingTasks.length > 0);
        break;
      case 'claudeActive':
        filtered = filtered.filter(
          (p) => p.claudeLive?.status === 'working' || p.claudeLive?.status === 'waiting'
        );
        break;
    }

    return get().getSortedProjects(filtered);
  },

  getSortedProjects: (projects) => {
    const { sortKey } = get();
    const sorted = [...projects];

    switch (sortKey) {
      case 'activity':
        sorted.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'health':
        sorted.sort((a, b) => (a.healthScore ?? 100) - (b.healthScore ?? 100));
        break;
      case 'changes':
        sorted.sort((a, b) => b.uncommittedChanges - a.uncommittedChanges);
        break;
    }

    return sorted;
  },

  getTimelineEntries: () => {
    const { projects } = get();
    const entries: TimelineEntry[] = [];

    for (const project of projects) {
      // Add commits
      for (const commit of project.recentCommits) {
        entries.push({
          id: `${project.path}-${commit.hash || commit.date}`,
          type: 'commit',
          project: project.name,
          projectPath: project.path,
          message: commit.message,
          date: commit.date,
          metadata: { hash: commit.hash, author: commit.author },
        });
      }

      // Add Claude sessions
      if (project.claudeLive) {
        entries.push({
          id: `${project.path}-claude-${project.claudeLive.detectedAt || 'now'}`,
          type: 'claude_session',
          project: project.name,
          projectPath: project.path,
          message: project.claudeLive.message || `Claude ${project.claudeLive.status}`,
          date: project.claudeLive.detectedAt || new Date().toISOString(),
          metadata: { status: project.claudeLive.status },
        });
      }
    }

    // Sort by date descending
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return entries;
  },

  getActiveClaudeSessions: () => {
    return get().projects.filter(
      (p) => p.claudeLive?.status === 'working' || p.claudeLive?.status === 'waiting'
    );
  },

  getProjectsNeedingAttention: () => {
    return get().projects.filter(
      (p) => p.uncommittedChanges > 5 || p.remainingTasks.length > 5 || (p.healthScore ?? 100) < 40
    );
  },

  getProjectByPath: (path) => {
    return get().projects.find((p) => p.path === path);
  },

  getProjectByName: (name) => {
    return get().projects.find((p) => p.name === name);
  },
}));

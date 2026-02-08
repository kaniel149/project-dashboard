import { useEffect, useCallback } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { isElectron } from '@/lib/utils';
import type { Project } from '@/types';

// Demo data for web mode when API is unavailable
const DEMO_PROJECTS: Project[] = [
  {
    name: 'navitas-crm',
    path: '/Users/demo/projects/navitas-crm',
    branch: 'main',
    uncommittedChanges: 3,
    changedFiles: [
      { status: 'M', path: 'src/pages/DashboardPage.tsx' },
      { status: 'M', path: 'src/services/monitoringService.ts' },
      { status: 'A', path: 'src/components/AlertBanner.tsx' },
    ],
    lastCommit: { message: 'Add monitoring alerts + Nipendo integration', date: new Date(Date.now() - 3600000).toISOString() },
    recentCommits: [
      { message: 'Add monitoring alerts + Nipendo integration', date: new Date(Date.now() - 3600000).toISOString(), hash: 'a1b2c3d' },
      { message: 'Fix Huawei active_power reading', date: new Date(Date.now() - 7200000).toISOString(), hash: 'e4f5g6h' },
      { message: 'Security audit - move API keys to server', date: new Date(Date.now() - 86400000).toISOString(), hash: 'i7j8k9l' },
      { message: 'UI/UX overhaul - dark mode + glass components', date: new Date(Date.now() - 172800000).toISOString(), hash: 'm0n1o2p' },
    ],
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
    summary: 'מערכת CRM לניהול פרויקטים סולאריים עבור חברת נביטאס',
    completedTasks: ['Security audit', 'Dark mode', 'Nipendo integration'],
    remainingTasks: ['Deploy to production', 'Run SQL migrations', 'External cron setup'],
    nextSteps: 'דיפלוי לפרודקשן + הרצת מיגרציות',
    techStack: ['React', 'TypeScript', 'Tailwind', 'Supabase', 'Vercel'],
    currentStatus: { 'Build': '✅ Passing', 'Deploy': '🟡 Pending' },
    knownIssues: ['RLS policy too open on projects table'],
    claudeLive: { status: 'working', message: 'Implementing alert system', detectedAt: new Date().toISOString() },
    gitInfo: { currentBranch: 'main', commits: [], branches: ['main', 'dev'], status: { ahead: 0, behind: 0, uncommitted: 3 } },
    category: 'business-projects',
  },
  {
    name: 'project-dashboard',
    path: '/Users/demo/projects/project-dashboard',
    branch: 'main',
    uncommittedChanges: 12,
    changedFiles: [
      { status: 'M', path: 'src/App.tsx' },
      { status: 'A', path: 'src/pages/DashboardPage.tsx' },
      { status: 'A', path: 'src/components/ui/Button.tsx' },
    ],
    lastCommit: { message: 'v2.0 Premium rebuild - TypeScript + Zustand + Router', date: new Date(Date.now() - 600000).toISOString() },
    recentCommits: [
      { message: 'v2.0 Premium rebuild - TypeScript + Zustand + Router', date: new Date(Date.now() - 600000).toISOString(), hash: 'q3r4s5t' },
      { message: 'Add Electron mini icon mode', date: new Date(Date.now() - 86400000 * 2).toISOString(), hash: 'u6v7w8x' },
    ],
    lastActivity: new Date(Date.now() - 600000).toISOString(),
    summary: 'Desktop dashboard for tracking project status, Git activity, and tasks',
    completedTasks: ['TypeScript migration', '18 UI components', 'Sidebar + routing', 'Command palette'],
    remainingTasks: ['Visual testing', 'Electron test'],
    nextSteps: 'בדיקה ויזואלית של כל 5 הנתיבים',
    techStack: ['React', 'TypeScript', 'Tailwind', 'Electron', 'Zustand', 'Vite'],
    currentStatus: { 'Build': '✅ 0 errors', 'Bundle': '436 kB' },
    knownIssues: [],
    claudeLive: null,
    gitInfo: { currentBranch: 'main', commits: [], branches: ['main'], status: { ahead: 0, behind: 0, uncommitted: 12 } },
    category: 'dev-tools',
  },
  {
    name: 'solaris-panama',
    path: '/Users/demo/projects/solar-ventures/solaris-panama/platform',
    branch: 'main',
    uncommittedChanges: 0,
    changedFiles: [],
    lastCommit: { message: 'Add AI roof scanner + solar calculator', date: new Date(Date.now() - 86400000).toISOString() },
    recentCommits: [
      { message: 'Add AI roof scanner + solar calculator', date: new Date(Date.now() - 86400000).toISOString(), hash: 'y9z0a1b' },
      { message: 'CRM pages - Dashboard, Projects, Clients', date: new Date(Date.now() - 86400000 * 2).toISOString(), hash: 'c2d3e4f' },
    ],
    lastActivity: new Date(Date.now() - 86400000).toISOString(),
    summary: 'CRM + AI Pipeline Platform for commercial rooftop solar in Panama',
    completedTasks: ['Core infrastructure', 'CRM pages', 'Solar calculator', 'Roof scanner'],
    remainingTasks: ['API keys setup', 'Supabase setup', 'Landing page', 'WhatsApp integration'],
    nextSteps: 'Get Google Solar API key + NREL key',
    techStack: ['React', 'TypeScript', 'Tailwind', 'Vite', 'i18n'],
    currentStatus: { 'Build': '✅ 0 errors', 'Pages': '13' },
    knownIssues: [],
    claudeLive: null,
    gitInfo: { currentBranch: 'main', commits: [], branches: ['main'], status: { ahead: 0, behind: 0, uncommitted: 0 } },
    category: 'business-projects',
  },
  {
    name: 'HealthOS',
    path: '/Users/demo/projects/personal-projects/kaniel_os/HealthOS',
    branch: 'main',
    uncommittedChanges: 5,
    changedFiles: [
      { status: 'M', path: 'apps/mobile/src/screens/DashboardScreen.tsx' },
      { status: 'M', path: 'packages/backend/src/routes/health.ts' },
    ],
    lastCommit: { message: 'Wire all screens to real backend API', date: new Date(Date.now() - 43200000).toISOString() },
    recentCommits: [
      { message: 'Wire all screens to real backend API', date: new Date(Date.now() - 43200000).toISOString(), hash: 'g5h6i7j' },
      { message: 'Full UI/UX overhaul + 15 components', date: new Date(Date.now() - 86400000).toISOString(), hash: 'k8l9m0n' },
      { message: 'Whoop integration + workout tracking', date: new Date(Date.now() - 86400000 * 2).toISOString(), hash: 'o1p2q3r' },
    ],
    lastActivity: new Date(Date.now() - 43200000).toISOString(),
    summary: 'Personal health & fitness app with Whoop integration and AI coaching',
    completedTasks: ['UI overhaul', 'Backend wiring', 'Whoop dashboard', 'Nutrition tracking'],
    remainingTasks: ['Google/Apple Auth', 'Expo EAS Build', 'Push notifications'],
    nextSteps: 'בדיקה ויזואלית במובייל + ווב',
    techStack: ['React Native', 'Expo', 'TypeScript', 'Node.js', 'Supabase'],
    currentStatus: { 'Build': '✅ 0 errors' },
    knownIssues: [],
    claudeLive: null,
    gitInfo: { currentBranch: 'main', commits: [], branches: ['main', 'dev'], status: { ahead: 0, behind: 0, uncommitted: 5 } },
    category: 'personal-projects',
  },
  {
    name: 'lavi-distribution',
    path: '/Users/demo/projects/business-projects/lavi',
    branch: 'main',
    uncommittedChanges: 0,
    changedFiles: [],
    lastCommit: { message: 'Full Stack PWA - driver + manager flows', date: new Date(Date.now() - 86400000 * 3).toISOString() },
    recentCommits: [
      { message: 'Full Stack PWA - driver + manager flows', date: new Date(Date.now() - 86400000 * 3).toISOString(), hash: 's4t5u6v' },
    ],
    lastActivity: new Date(Date.now() - 86400000 * 3).toISOString(),
    summary: 'מערכת ניהול הפצה - נהגים, מסלולים, מסירות',
    completedTasks: ['Database schema', 'Backend API', 'Driver PWA', 'Manager dashboard'],
    remainingTasks: ['Docker test', 'Google Maps', 'Offline sync'],
    nextSteps: 'Docker compose up + test both flows',
    techStack: ['React', 'TypeScript', 'Express', 'PostgreSQL', 'Docker'],
    currentStatus: { 'Build': '✅ Passing' },
    knownIssues: [],
    claudeLive: null,
    gitInfo: { currentBranch: 'main', commits: [], branches: ['main'], status: { ahead: 0, behind: 0, uncommitted: 0 } },
    category: 'business-projects',
  },
  {
    name: 'morning-briefing',
    path: '/Users/demo/projects/integrations/morning-briefing',
    branch: 'main',
    uncommittedChanges: 1,
    changedFiles: [{ status: 'M', path: 'run_briefing.py' }],
    lastCommit: { message: 'Fix NotebookLM client + WhatsApp OGG audio', date: new Date(Date.now() - 86400000 * 2).toISOString() },
    recentCommits: [
      { message: 'Fix NotebookLM client + WhatsApp OGG audio', date: new Date(Date.now() - 86400000 * 2).toISOString(), hash: 'w7x8y9z' },
    ],
    lastActivity: new Date(Date.now() - 86400000 * 2).toISOString(),
    summary: 'Daily morning briefing podcast via NotebookLM + WhatsApp',
    completedTasks: ['NotebookLM client fix', 'WhatsApp audio conversion', 'launchd setup'],
    remainingTasks: ['Test full pipeline', 'Verify launchd'],
    nextSteps: 'הרצת run_briefing.py ידנית לבדיקה',
    techStack: ['Python', 'NotebookLM', 'WhatsApp API', 'launchd'],
    currentStatus: {},
    knownIssues: ['DeepFilterNet CLI not recognized'],
    claudeLive: null,
    gitInfo: { currentBranch: 'main', commits: [], branches: ['main'], status: { ahead: 0, behind: 0, uncommitted: 1 } },
    category: 'integrations',
  },
];

/**
 * Hook that manages project data fetching for both Electron and Web modes.
 * Connects to the Zustand store.
 */
export function useProjects() {
  const store = useProjectStore();

  const fetchWebProjects = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      store.setProjects(data.projects || []);
    } catch {
      // API unavailable - use demo data so the UI is still usable
      console.warn('API unavailable, loading demo data');
      store.setProjects(DEMO_PROJECTS);
      store.setError(null);
    }
  }, []);

  useEffect(() => {
    if (isElectron) {
      // Electron: set up listener for projects
      store.setLoading(false);
      const cleanup = window.electronAPI?.onProjectsUpdate((data: Project[]) => {
        store.setProjects(data);
      });
      return cleanup;
    } else {
      // Web: fetch on mount and set up polling
      fetchWebProjects();
      const interval = setInterval(fetchWebProjects, 60000);
      return () => clearInterval(interval);
    }
  }, [fetchWebProjects]);

  return {
    projects: store.projects,
    loading: store.loading,
    error: store.error,
    refresh: store.refresh,
  };
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNav() {
  const store = useProjectStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't handle if typing in input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'j':
          e.preventDefault();
          store.moveSelection('down');
          break;
        case 'k':
          e.preventDefault();
          store.moveSelection('up');
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}

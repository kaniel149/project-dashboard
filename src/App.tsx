import { HashRouter, Routes, Route } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useProjectStore } from '@/stores/projectStore';
import { useAppStore } from '@/stores/appStore';
import { isElectron } from '@/lib/utils';
import { useEffect } from 'react';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Pages
import DashboardPage from '@/pages/DashboardPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import TimelinePage from '@/pages/TimelinePage';
import SettingsPage from '@/pages/SettingsPage';

// Legacy Electron mini icon
import MiniIcon from '@/components/MiniIcon';

function AppContent() {
  const { loading, error, refresh } = useProjects();
  const projects = useProjectStore((s) => s.projects);
  const isElectronCollapsed = useAppStore((s) => s.isElectronCollapsed);
  const setElectronCollapsed = useAppStore((s) => s.setElectronCollapsed);

  // Handle Electron collapse state
  useEffect(() => {
    if (isElectron) {
      window.electronAPI?.getCollapsedState().then(setElectronCollapsed).catch(console.error);
    }
  }, []);

  const handleElectronToggle = async () => {
    if (!isElectron) return;
    const newState = await window.electronAPI?.toggleCollapse();
    setElectronCollapsed(newState ?? false);
  };

  // Error state
  if (error && projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="glass-container rounded-3xl p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-red-400 text-xl mb-2 font-semibold">שגיאה</div>
          <div className="text-white/50 text-sm mb-6">{error}</div>
          <button
            onClick={refresh}
            className="px-6 py-2.5 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors font-medium"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white/40 text-center">
          <div className="w-14 h-14 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white/50 font-medium">טוען פרויקטים...</div>
          <div className="text-white/25 text-sm mt-1">סורק תיקיות Git</div>
        </div>
      </div>
    );
  }

  // Electron mini icon mode
  if (isElectron && isElectronCollapsed) {
    return <MiniIcon projects={projects} onExpand={handleElectronToggle} />;
  }

  return (
    <AppLayout onElectronCollapse={handleElectronToggle}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:name" element={<ProjectDetailPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

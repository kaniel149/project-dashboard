import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import MiniIcon from './components/MiniIcon';
import { useProjects, isWebMode } from './hooks/useProjects';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { projects, loading, error, refresh } = useProjects();

  useEffect(() => {
    // Only handle collapse state in Electron mode
    if (!isWebMode) {
      window.electronAPI?.getCollapsedState().then(setIsCollapsed).catch(console.error);
    }
  }, []);

  const handleToggle = async () => {
    if (isWebMode) {
      // In web mode, we don't have collapse functionality
      return;
    }
    const newState = await window.electronAPI?.toggleCollapse();
    setIsCollapsed(newState);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center p-4">
        <div className="glass-container rounded-3xl p-8 text-center max-w-md">
          <div className="text-red-400 text-xl mb-4">שגיאה</div>
          <div className="text-white/60 text-sm mb-6">{error}</div>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center">
        <div className="text-white/40 text-center">
          <div className="w-12 h-12 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
          <div>טוען פרויקטים...</div>
        </div>
      </div>
    );
  }

  // In web mode, always show dashboard (no collapse)
  if (isWebMode) {
    return (
      <div className="min-h-screen bg-[#0c0c0e] p-4 flex items-center justify-center">
        <Dashboard projects={projects} onCollapse={handleToggle} isWebMode={true} />
      </div>
    );
  }

  // Electron mode with collapse support
  if (isCollapsed) {
    return <MiniIcon projects={projects} onExpand={handleToggle} />;
  }

  return <Dashboard projects={projects} onCollapse={handleToggle} isWebMode={false} />;
}

export default App;

import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import MiniIcon from './components/MiniIcon';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cleanup = null;

    try {
      window.electronAPI?.getCollapsedState().then(setIsCollapsed).catch(console.error);

      // Set up listener and get cleanup function
      cleanup = window.electronAPI?.onProjectsUpdate((data) => {
        setProjects(data);
      });
    } catch (e) {
      setError(e.message);
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  const handleToggle = async () => {
    const newState = await window.electronAPI?.toggleCollapse();
    setIsCollapsed(newState);
  };

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (isCollapsed) {
    return <MiniIcon projects={projects} onExpand={handleToggle} />;
  }

  return <Dashboard projects={projects} onCollapse={handleToggle} />;
}

export default App;

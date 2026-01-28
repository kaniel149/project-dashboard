import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import MiniIcon from './components/MiniIcon';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      window.electronAPI?.getCollapsedState().then(setIsCollapsed).catch(console.error);

      window.electronAPI?.onProjectsUpdate((data) => {
        console.log('Projects received:', data);
        setProjects(data);
      });
    } catch (e) {
      setError(e.message);
    }
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

import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import MiniIcon from './components/MiniIcon';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    window.electronAPI?.getCollapsedState().then(setIsCollapsed);

    window.electronAPI?.onProjectsUpdate((data) => {
      setProjects(data);
    });
  }, []);

  const handleToggle = async () => {
    const newState = await window.electronAPI?.toggleCollapse();
    setIsCollapsed(newState);
  };

  if (isCollapsed) {
    return <MiniIcon projects={projects} onExpand={handleToggle} />;
  }

  return <Dashboard projects={projects} onCollapse={handleToggle} />;
}

export default App;

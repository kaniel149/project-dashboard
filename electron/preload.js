const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleCollapse: () => ipcRenderer.invoke('toggle-collapse'),
  getCollapsedState: () => ipcRenderer.invoke('get-collapsed-state'),
  onProjectsUpdate: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('projects-update', handler);
    // Return cleanup function
    return () => ipcRenderer.removeListener('projects-update', handler);
  },
  refreshProjects: () => ipcRenderer.invoke('refresh-projects'),
  openTerminal: (projectPath) => ipcRenderer.invoke('open-terminal', projectPath),
  openVSCode: (projectPath) => ipcRenderer.invoke('open-vscode', projectPath),
  openClaude: (projectPath) => ipcRenderer.invoke('open-claude', projectPath),
  generateProjectMap: () => ipcRenderer.invoke('generate-project-map'),
  openProjectMap: (projectPath, projectData) => ipcRenderer.invoke('open-project-map', projectPath, projectData),
  saveProjectMap: (projectPath, mapData) => ipcRenderer.invoke('save-project-map', projectPath, mapData),
});

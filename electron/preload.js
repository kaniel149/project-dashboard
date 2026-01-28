const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleCollapse: () => ipcRenderer.invoke('toggle-collapse'),
  getCollapsedState: () => ipcRenderer.invoke('get-collapsed-state'),
  onProjectsUpdate: (callback) => ipcRenderer.on('projects-update', (_, data) => callback(data)),
  openTerminal: (projectPath) => ipcRenderer.invoke('open-terminal', projectPath),
});

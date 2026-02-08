export interface ElectronAPI {
  toggleCollapse: () => Promise<boolean>;
  getCollapsedState: () => Promise<boolean>;
  setWindowSize: (width: number, height: number) => Promise<{ success: boolean }>;
  onProjectsUpdate: (callback: (data: import('./index').Project[]) => void) => (() => void) | undefined;
  refreshProjects: () => Promise<{ success: boolean; error?: string }>;
  openTerminal: (projectPath: string) => Promise<{ success: boolean }>;
  openVSCode: (projectPath: string) => Promise<{ success: boolean }>;
  openClaude: (projectPath: string) => Promise<{ success: boolean }>;
  generateProjectMap: () => Promise<{ success: boolean; path?: string }>;
  openProjectMap: (projectPath: string, projectData?: unknown) => Promise<{ success: boolean; path?: string; stats?: unknown }>;
  saveProjectMap: (projectPath: string, mapData: unknown) => Promise<{ success: boolean }>;
  updateProjectState: (projectPath: string, changes: unknown) => Promise<{ success: boolean }>;
  getCodeStats?: (projectPath: string) => Promise<import('./index').CodeStats | null>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};

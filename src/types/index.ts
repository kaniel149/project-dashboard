// ===== Project Types =====

export interface GitCommit {
  message: string;
  date: string;
  hash?: string;
  author?: string;
  branches?: string[];
  graphChars?: string;
}

export interface ChangedFile {
  status: string;
  path: string;
}

export interface ClaudeLiveStatus {
  status: 'working' | 'waiting' | 'done' | 'error' | 'idle';
  message?: string;
  detectedAt?: string;
}

export interface GitInfo {
  currentBranch: string;
  commits: GitCommit[];
  branches: string[];
  status: {
    ahead: number;
    behind: number;
    uncommitted: number;
  };
}

export interface Project {
  name: string;
  path: string;
  branch: string;
  uncommittedChanges: number;
  changedFiles: ChangedFile[];
  lastCommit: GitCommit | null;
  recentCommits: GitCommit[];
  lastActivity: string;
  summary: string | null;
  completedTasks: string[];
  remainingTasks: string[];
  nextSteps: string | null;
  techStack: string[];
  currentStatus: Record<string, string>;
  knownIssues: string[];
  claudeLive: ClaudeLiveStatus | null;
  gitInfo: GitInfo | null;
  category?: string;
  // Computed fields
  healthScore?: number;
  codeStats?: CodeStats;
}

export interface CodeStats {
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>;
  lastScanned: string;
}

// ===== View Types =====

export type ViewMode = 'list' | 'grid' | 'kanban' | 'git';

export type ProjectSortKey = 'activity' | 'name' | 'health' | 'changes';

export type ProjectFilter = 'all' | 'hasChanges' | 'hasTasks' | 'claudeActive';

export type KanbanColumn = 'active' | 'inProgress' | 'needsAttention' | 'idle';

// ===== App Types =====

export interface AppSettings {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  defaultView: ViewMode;
  defaultSort: ProjectSortKey;
  refreshInterval: number; // seconds
  showNotifications: boolean;
  keyboardNavEnabled: boolean;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// ===== Navigation Types =====

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  shortcut?: string;
  badge?: number | string;
}

// ===== Group Types =====

export interface ProjectGroup {
  id: string;
  name: string;
  emoji: string;
  prefix: string;
  projects: Project[];
  count: number;
  stats: GroupStats;
}

export interface GroupStats {
  totalUncommitted: number;
  totalTasks: number;
  hasClaudeActive: boolean;
  lastActivity: Date;
}

// ===== Timeline Types =====

export interface TimelineEntry {
  id: string;
  type: 'commit' | 'claude_session' | 'session_save' | 'deploy';
  project: string;
  projectPath: string;
  message: string;
  date: string;
  metadata?: Record<string, unknown>;
}

export interface TimelineDay {
  date: string;
  label: string;
  entries: TimelineEntry[];
}

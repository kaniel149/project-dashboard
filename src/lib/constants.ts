import type { ViewMode, ProjectSortKey, ProjectFilter, KanbanColumn } from '@/types';

// ===== Category Config =====

export const CATEGORY_LABELS: Record<string, string> = {
  'business-projects': 'עסקי',
  'personal-projects': 'אישי',
  integrations: 'אינטגרציות',
  'dev-tools': 'כלי פיתוח',
  'content-systems': 'תוכן',
  frameworks: 'Frameworks',
  'media-projects': 'מדיה',
  archive: 'ארכיון',
};

export const CATEGORY_EMOJI: Record<string, string> = {
  'business-projects': '💼',
  'personal-projects': '🏠',
  integrations: '🔌',
  'dev-tools': '🛠️',
  'content-systems': '📝',
  frameworks: '🏗️',
  'media-projects': '🎬',
  archive: '📦',
};

// ===== Status Config =====

export const STATUS_COLORS = {
  working: { dot: 'bg-blue-400', badge: 'badge-blue', label: 'Claude עובד' },
  waiting: { dot: 'bg-yellow-400', badge: 'badge-yellow', label: 'מחכה לקלט' },
  done: { dot: 'bg-green-400', badge: 'badge-green', label: 'סיים' },
  error: { dot: 'bg-red-400', badge: 'badge-red', label: 'שגיאה' },
  idle: { dot: 'bg-gray-400', badge: 'badge-gray', label: 'לא פעיל' },
} as const;

export const FILE_STATUS_COLORS: Record<string, string> = {
  M: 'text-yellow-400',
  A: 'text-green-400',
  D: 'text-red-400',
  '?': 'text-blue-400',
  U: 'text-purple-400',
};

// ===== View Config =====

export const VIEW_MODES: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'list', label: 'רשימה', icon: 'list' },
  { id: 'grid', label: 'Grid', icon: 'grid' },
  { id: 'kanban', label: 'Kanban', icon: 'columns' },
  { id: 'git', label: 'Git', icon: 'git-branch' },
];

export const SORT_OPTIONS: { id: ProjectSortKey; label: string }[] = [
  { id: 'activity', label: 'לפי פעילות' },
  { id: 'name', label: 'לפי שם' },
  { id: 'health', label: 'לפי בריאות' },
  { id: 'changes', label: 'לפי שינויים' },
];

export const FILTER_OPTIONS: { id: ProjectFilter; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'hasChanges', label: 'יש שינויים' },
  { id: 'hasTasks', label: 'יש משימות' },
  { id: 'claudeActive', label: 'Claude פעיל' },
];

export const KANBAN_COLUMNS: { id: KanbanColumn; label: string; color: string }[] = [
  { id: 'active', label: 'פעיל', color: 'blue' },
  { id: 'inProgress', label: 'בעבודה', color: 'purple' },
  { id: 'needsAttention', label: 'צריך טיפול', color: 'orange' },
  { id: 'idle', label: 'לא פעיל', color: 'gray' },
];

// ===== Group Emoji Map =====

export const GROUP_EMOJI: Record<string, string> = {
  navitas: '🔆',
  solaris: '☀️',
  health: '🏥',
  morning: '🌅',
  content: '📝',
  video: '🎬',
  api: '🔌',
  mcp: '🔧',
  test: '🧪',
  lavi: '🦁',
  project: '📊',
};

// ===== Keyboard Shortcuts =====

export const KEYBOARD_SHORTCUTS = {
  commandPalette: { key: 'k', meta: true, label: `⌘K` },
  search: { key: '/', label: '/' },
  refresh: { key: 'r', meta: true, label: '⌘R' },
  navDashboard: { key: '1', meta: true, label: '⌘1' },
  navProjects: { key: '2', meta: true, label: '⌘2' },
  navTimeline: { key: '3', meta: true, label: '⌘3' },
  navSettings: { key: '4', meta: true, label: '⌘4' },
  listUp: { key: 'k', label: 'k' },
  listDown: { key: 'j', label: 'j' },
  open: { key: 'Enter', label: 'Enter' },
  back: { key: 'Escape', label: 'Esc' },
} as const;

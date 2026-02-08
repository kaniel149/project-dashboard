import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge classNames with clsx + tailwind-merge (resolves conflicts)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format relative time in Hebrew
 */
export function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `${diffMins} דק'`;
  if (diffHours < 24) return `${diffHours} שעות`;
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return `${diffDays} ימים`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} שבועות`;
  return `${Math.floor(diffDays / 30)} חודשים`;
}

/**
 * Format date as readable string
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date for grouping (Today, Yesterday, This Week, etc.)
 */
export function formatDateGroup(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);

  if (diffDays === 0) return 'היום';
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return 'השבוע';
  if (diffDays < 30) return 'החודש';
  return formatDate(date);
}

/**
 * Check if text contains Hebrew characters
 */
export function isHebrew(text: string): boolean {
  return /[\u0590-\u05FF]/.test(text);
}

/**
 * Get text direction based on content
 */
export function getTextDir(text: string): 'rtl' | 'ltr' {
  return isHebrew(text) ? 'rtl' : 'ltr';
}

/**
 * Generate a consistent color from a string (for avatars)
 */
export function stringToColor(str: string): string {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-cyan-500 to-blue-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-purple-500',
    'from-amber-500 to-orange-500',
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

/**
 * Calculate health score for a project (0-100)
 */
export function calculateHealthScore(project: {
  lastActivity?: string;
  uncommittedChanges?: number;
  remainingTasks?: string[];
  claudeLive?: { status: string } | null;
}): number {
  let score = 100;

  // Days since last activity (max -40)
  if (project.lastActivity) {
    const daysSince = Math.floor(
      (Date.now() - new Date(project.lastActivity).getTime()) / 86400000
    );
    if (daysSince > 30) score -= 40;
    else if (daysSince > 14) score -= 25;
    else if (daysSince > 7) score -= 15;
    else if (daysSince > 3) score -= 5;
  }

  // Uncommitted changes (max -30)
  const changes = project.uncommittedChanges || 0;
  if (changes > 20) score -= 30;
  else if (changes > 10) score -= 20;
  else if (changes > 5) score -= 10;
  else if (changes > 0) score -= 5;

  // Open tasks (max -20)
  const tasks = project.remainingTasks?.length || 0;
  if (tasks > 10) score -= 20;
  else if (tasks > 5) score -= 10;
  else if (tasks > 0) score -= 5;

  // Bonus for Claude active
  if (project.claudeLive?.status === 'working') score += 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Get health status label and color
 */
export function getHealthStatus(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 80) return { label: 'מצוין', color: 'text-green-400', bgColor: 'bg-green-500' };
  if (score >= 60) return { label: 'טוב', color: 'text-blue-400', bgColor: 'bg-blue-500' };
  if (score >= 40) return { label: 'בינוני', color: 'text-yellow-400', bgColor: 'bg-yellow-500' };
  if (score >= 20) return { label: 'זקוק לטיפול', color: 'text-orange-400', bgColor: 'bg-orange-500' };
  return { label: 'קריטי', color: 'text-red-400', bgColor: 'bg-red-500' };
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/**
 * Generate a unique ID
 */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Platform detection
 */
export const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
export const modKey = isMac ? '⌘' : 'Ctrl';

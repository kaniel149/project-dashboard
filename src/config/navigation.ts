import type { NavItem } from '@/types';

export interface NavItemExtended extends NavItem {
  description: string;
  badgeKey?: 'projects' | 'attention' | 'claude';
  goKey?: string; // vim-style go-to key (g then X)
}

export const mainNavItems: NavItemExtended[] = [
  {
    id: 'dashboard',
    label: 'סקירה',
    icon: 'home',
    path: '/',
    shortcut: '⌘1',
    description: 'סקירה כללית של כל הפרויקטים',
    goKey: 'd',
  },
  {
    id: 'projects',
    label: 'פרויקטים',
    icon: 'folder',
    path: '/projects',
    shortcut: '⌘2',
    description: 'ניהול וצפייה בפרויקטים',
    badgeKey: 'projects',
    goKey: 'p',
  },
  {
    id: 'timeline',
    label: 'ציר זמן',
    icon: 'clock',
    path: '/timeline',
    shortcut: '⌘3',
    description: 'היסטוריית פעילות ושינויים',
    goKey: 't',
  },
  {
    id: 'settings',
    label: 'הגדרות',
    icon: 'settings',
    path: '/settings',
    shortcut: '⌘4',
    description: 'הגדרות המערכת והתצוגה',
    goKey: 's',
  },
];

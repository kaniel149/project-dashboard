import { Suspense, lazy, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAppStore } from '@/stores/appStore';
import { KeyboardShortcutOverlay } from '@/components/ui/KeyboardShortcutOverlay';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import PageTransition from '@/components/layout/PageTransition';
import { cn, modKey } from '@/lib/utils';

const CommandPalette = lazy(() => import('@/components/ui/CommandPalette'));
const ToastProvider = lazy(() => import('@/components/ui/ToastProvider'));

const SHORTCUT_GROUPS = [
  {
    title: 'ניווט',
    shortcuts: [
      { keys: [`${modKey}1`], label: 'סקירה' },
      { keys: [`${modKey}2`], label: 'פרויקטים' },
      { keys: [`${modKey}3`], label: 'ציר זמן' },
      { keys: [`${modKey}4`], label: 'הגדרות' },
      { keys: ['g', 'd'], label: 'Go to Dashboard' },
      { keys: ['g', 'p'], label: 'Go to Projects' },
      { keys: ['g', 't'], label: 'Go to Timeline' },
      { keys: ['g', 's'], label: 'Go to Settings' },
    ],
  },
  {
    title: 'פעולות',
    shortcuts: [
      { keys: [`${modKey}K`], label: 'חיפוש / פקודות' },
      { keys: [`${modKey}R`], label: 'רענון' },
      { keys: ['/'], label: 'מיקוד חיפוש' },
      { keys: ['['], label: 'כווץ סרגל צד' },
      { keys: [']'], label: 'הרחב סרגל צד' },
      { keys: ['Esc'], label: 'סגור / ביטול' },
      { keys: ['?'], label: 'קיצורי מקלדת' },
    ],
  },
];

interface AppLayoutProps {
  children: ReactNode;
  onElectronCollapse?: () => void;
}

// Mobile bottom nav icons
const bottomNavItems = [
  {
    id: 'dashboard',
    path: '/',
    label: 'סקירה',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 7.5L10 1.67l7.5 5.83V16.67a1.67 1.67 0 01-1.67 1.67H4.17a1.67 1.67 0 01-1.67-1.67V7.5z" />
        <path d="M7.5 18.33V10h5v8.33" />
      </svg>
    ),
  },
  {
    id: 'projects',
    path: '/projects',
    label: 'פרויקטים',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.33 15.83a1.67 1.67 0 01-1.67 1.67H3.33a1.67 1.67 0 01-1.67-1.67V4.17A1.67 1.67 0 013.33 2.5h5l1.67 2.5h6.67a1.67 1.67 0 011.67 1.67v9.17z" />
      </svg>
    ),
  },
  {
    id: 'timeline',
    path: '/timeline',
    label: 'ציר זמן',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8.33" />
        <path d="M10 5V10l3.33 1.67" />
      </svg>
    ),
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'הגדרות',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="2.5" />
        <path d="M16.33 12.33a1.33 1.33 0 00.27 1.47l.05.05a1.62 1.62 0 11-2.3 2.3l-.04-.05a1.33 1.33 0 00-1.47-.27 1.33 1.33 0 00-.81 1.22v.12a1.62 1.62 0 01-3.24 0v-.06a1.33 1.33 0 00-.87-1.22 1.33 1.33 0 00-1.47.27l-.05.05a1.62 1.62 0 11-2.3-2.3l.05-.04a1.33 1.33 0 00.27-1.47 1.33 1.33 0 00-1.22-.81h-.12a1.62 1.62 0 010-3.24h.06a1.33 1.33 0 001.22-.87 1.33 1.33 0 00-.27-1.47l-.05-.05a1.62 1.62 0 112.3-2.3l.04.05a1.33 1.33 0 001.47.27h.07a1.33 1.33 0 00.81-1.22v-.12a1.62 1.62 0 013.24 0v.06a1.33 1.33 0 00.81 1.22 1.33 1.33 0 001.47-.27l.05-.05a1.62 1.62 0 112.3 2.3l-.05.04a1.33 1.33 0 00-.27 1.47v.07a1.33 1.33 0 001.22.81h.12a1.62 1.62 0 010 3.24h-.06a1.33 1.33 0 00-1.22.81z" />
      </svg>
    ),
  },
];

export default function AppLayout({ children }: AppLayoutProps) {
  useKeyboardShortcuts();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  const setScrolledDown = useAppStore((s) => s.setScrolledDown);
  const shortcutOverlayOpen = useAppStore((s) => s.shortcutOverlayOpen);
  const setShortcutOverlayOpen = useAppStore((s) => s.setShortcutOverlayOpen);

  // Track scroll position for TopBar shadow
  const handleScroll = useCallback(() => {
    if (mainRef.current) {
      setScrolledDown(mainRef.current.scrollTop > 8);
    }
  }, [setScrolledDown]);

  useEffect(() => {
    const el = mainRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0f] text-white overflow-hidden" dir="rtl">
      {/* Sidebar (hidden on mobile, visible md+) */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />

        {/* Page Content with AnimatePresence */}
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden pb-16 md:pb-0">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              {children}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Nav (md: hidden) */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden z-[48] bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.06] safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {bottomNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors',
                  active ? 'text-blue-400' : 'text-white/40'
                )}
              >
                {item.icon}
                <span className="text-[9px] font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute top-0 w-8 h-0.5 rounded-full bg-blue-400"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Keyboard Shortcut Overlay */}
      <KeyboardShortcutOverlay
        open={shortcutOverlayOpen}
        onClose={() => setShortcutOverlayOpen(false)}
        groups={SHORTCUT_GROUPS}
      />

      {/* Overlays */}
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
      <Suspense fallback={null}>
        <ToastProvider />
      </Suspense>
    </div>
  );
}

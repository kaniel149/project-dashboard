import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAppStore } from '@/stores/appStore';
import { useProjectStore } from '@/stores/projectStore';
import { mainNavItems } from '@/config/navigation';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { isElectron, modKey, cn } from '@/lib/utils';
import { VIEW_MODES } from '@/lib/constants';
import { useState } from 'react';

const viewIcons: Record<string, React.ReactNode> = {
  list: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="3" y1="3.5" x2="12" y2="3.5" />
      <line x1="3" y1="7.5" x2="12" y2="7.5" />
      <line x1="3" y1="11.5" x2="12" y2="11.5" />
    </svg>
  ),
  grid: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="4.5" height="4.5" rx="1" />
      <rect x="8.5" y="2" width="4.5" height="4.5" rx="1" />
      <rect x="2" y="8.5" width="4.5" height="4.5" rx="1" />
      <rect x="8.5" y="8.5" width="4.5" height="4.5" rx="1" />
    </svg>
  ),
  columns: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="3" height="11" rx="1" />
      <rect x="6" y="2" width="3" height="8" rx="1" />
      <rect x="10" y="2" width="3" height="6" rx="1" />
    </svg>
  ),
  'git-branch': (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="4.5" cy="3.5" r="1.5" />
      <circle cx="4.5" cy="11.5" r="1.5" />
      <circle cx="10.5" cy="5.5" r="1.5" />
      <path d="M4.5 5V10" />
      <path d="M4.5 5C4.5 5 4.5 5.5 6 5.5C7.5 5.5 9 5.5" />
    </svg>
  ),
};

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const scrolledDown = useAppStore((s) => s.scrolledDown);
  const viewMode = useProjectStore((s) => s.viewMode);
  const setViewMode = useProjectStore((s) => s.setViewMode);
  const refresh = useProjectStore((s) => s.refresh);
  const loading = useProjectStore((s) => s.loading);
  const getProjectsNeedingAttention = useProjectStore((s) => s.getProjectsNeedingAttention);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derive page info from current route
  const currentNav = mainNavItems.find((item) => {
    if (item.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.path);
  });

  const isProjectsPage = location.pathname === '/projects';
  const isProjectDetail = location.pathname.startsWith('/projects/') && location.pathname !== '/projects';
  const projectName = isProjectDetail ? decodeURIComponent(location.pathname.split('/projects/')[1]) : null;

  const attentionCount = getProjectsNeedingAttention().length;

  // Build breadcrumb items
  const breadcrumbItems = [];
  if (currentNav) {
    breadcrumbItems.push({ label: currentNav.label, href: currentNav.path });
  }
  if (projectName) {
    breadcrumbItems.push({ label: projectName });
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div
      className={cn(
        'flex items-center h-14 px-4 border-b border-white/[0.06] bg-[#0a0a0f]/60 backdrop-blur-xl shrink-0 gap-3 transition-shadow duration-300',
        isElectron && 'drag-region',
        scrolledDown ? 'scroll-shadow-active' : 'scroll-shadow'
      )}
    >
      {/* Left: Breadcrumb */}
      <div className="flex items-center min-w-0 shrink-0">
        <Breadcrumb
          items={breadcrumbItems}
          onNavigate={(href) => navigate(href)}
        />
      </div>

      {/* Center: Search Trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className={cn(
          'flex items-center gap-2 h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30',
          'hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white/40 transition-all duration-200',
          'mx-auto max-w-[360px] w-full no-drag'
        )}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="6" cy="6" r="4.5" />
          <path d="M12.5 12.5L9.5 9.5" />
        </svg>
        <span className="text-[12px] flex-1 text-start">{modKey}K חיפוש...</span>
        <kbd className="hidden sm:inline-flex text-[10px] text-white/15 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">
          {modKey}K
        </kbd>
      </button>

      {/* Right: View Toggle + Refresh + Notification + Avatar */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* View Mode Toggle (only on /projects) */}
        {isProjectsPage && (
          <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
            {VIEW_MODES.map((mode) => (
              <motion.button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                whileTap={{ scale: 0.92 }}
                className={cn(
                  'relative p-1.5 rounded-md transition-colors no-drag',
                  viewMode === mode.id
                    ? 'text-white/90'
                    : 'text-white/30 hover:text-white/50'
                )}
                title={mode.label}
              >
                {viewMode === mode.id && (
                  <motion.div
                    layoutId="viewmode-active"
                    className="absolute inset-0 bg-white/[0.08] rounded-md"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{viewIcons[mode.icon]}</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <motion.button
          onClick={handleRefresh}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors disabled:opacity-30 no-drag"
          title={`${modKey}R רענן`}
        >
          <motion.svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <path d="M1.5 2.5V6H5" />
            <path d="M13.5 12.5V9H10" />
            <path d="M2.67 9.5A5.5 5.5 0 0012.33 5.5" />
            <path d="M12.33 5.5A5.5 5.5 0 002.67 9.5" />
          </motion.svg>
        </motion.button>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors no-drag"
          title="התראות"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11.25 5.25a3.75 3.75 0 10-7.5 0c0 4.375-1.875 5.625-1.875 5.625h11.25S11.25 9.625 11.25 5.25z" />
            <path d="M8.59 13.125a1.25 1.25 0 01-2.18 0" />
          </svg>
          {attentionCount > 0 && (
            <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-orange-400 rounded-full status-pulse" />
          )}
        </button>

        {/* User Avatar (small) */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white no-drag cursor-default">
          KT
        </div>
      </div>
    </div>
  );
}

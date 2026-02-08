import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/stores/appStore';
import { useProjectStore } from '@/stores/projectStore';
import { mainNavItems } from '@/config/navigation';
import { cn } from '@/lib/utils';

const navIcons: Record<string, React.ReactNode> = {
  home: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.25 6.75L9 1.5l6.75 5.25V15a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6.75z" />
      <path d="M6.75 16.5V9h4.5v7.5" />
    </svg>
  ),
  folder: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 14.25a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5V3.75A1.5 1.5 0 013 2.25h4.5l1.5 2.25H15a1.5 1.5 0 011.5 1.5v8.25z" />
    </svg>
  ),
  clock: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="7.5" />
      <path d="M9 4.5V9l3 1.5" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="2.25" />
      <path d="M14.7 11.1a1.2 1.2 0 00.24 1.32l.04.04a1.46 1.46 0 01-1.03 2.49 1.46 1.46 0 01-1.03-.43l-.04-.04a1.2 1.2 0 00-1.32-.24 1.2 1.2 0 00-.73 1.1v.11a1.46 1.46 0 01-2.91 0v-.06a1.2 1.2 0 00-.78-1.1 1.2 1.2 0 00-1.32.24l-.04.04a1.46 1.46 0 01-2.06-2.06l.04-.04a1.2 1.2 0 00.24-1.32 1.2 1.2 0 00-1.1-.73h-.11a1.46 1.46 0 010-2.91h.06a1.2 1.2 0 001.1-.78 1.2 1.2 0 00-.24-1.32l-.04-.04a1.46 1.46 0 012.06-2.06l.04.04a1.2 1.2 0 001.32.24h.06a1.2 1.2 0 00.73-1.1v-.11a1.46 1.46 0 012.91 0v.06a1.2 1.2 0 00.73 1.1 1.2 1.2 0 001.32-.24l.04-.04a1.46 1.46 0 012.06 2.06l-.04.04a1.2 1.2 0 00-.24 1.32v.06a1.2 1.2 0 001.1.73h.11a1.46 1.46 0 010 2.91h-.06a1.2 1.2 0 00-1.1.73z" />
    </svg>
  ),
};

function NavTooltip({ label, visible }: { label: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="absolute start-full ms-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="px-2.5 py-1.5 rounded-lg bg-[#1a1a26]/95 border border-white/[0.08] backdrop-blur-sm text-xs text-white/80 font-medium shadow-xl whitespace-nowrap">
            {label}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const projects = useProjectStore((s) => s.projects);
  const getActiveClaudeSessions = useProjectStore((s) => s.getActiveClaudeSessions);

  const totalProjects = projects.length;
  const activeClaude = getActiveClaudeSessions().length;

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getBadgeValue = (badgeKey?: string) => {
    if (!badgeKey) return undefined;
    switch (badgeKey) {
      case 'projects': return totalProjects > 0 ? totalProjects : undefined;
      default: return undefined;
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="relative hidden md:flex flex-col h-full border-s border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-xl overflow-hidden z-40 shrink-0"
    >
      {/* Subtle shine on mount */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent"
          initial={{ y: '-100%' }}
          animate={{ y: '200%' }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
        />
      </motion.div>

      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 h-14 shrink-0',
        collapsed && 'justify-center px-0'
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 6L8 1.5L14 6V13.5C14 14.05 13.55 14.5 13 14.5H3C2.45 14.5 2 14.05 2 13.5V6Z" fill="white" fillOpacity="0.9" />
            <path d="M6 14.5V8.5H10V14.5" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
          </svg>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-semibold text-white/90 whitespace-nowrap"
            >
              Project Dashboard
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto scrollbar-none">
        {mainNavItems.map((item) => {
          const active = isActive(item.path);
          const badgeValue = getBadgeValue(item.badgeKey);
          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <motion.button
                onClick={() => navigate(item.path)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg h-9 transition-colors duration-200 relative group',
                  collapsed ? 'justify-center px-0' : 'px-3',
                  active
                    ? 'text-white bg-white/[0.08]'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                )}
              >
                {/* Active indicator (RTL-safe logical property) */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-inline-start-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-blue-400"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <motion.span
                  className={cn('shrink-0', active && 'text-blue-400')}
                  layout
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  {navIcons[item.icon]}
                </motion.span>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="text-[13px] font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Badge */}
                {!collapsed && badgeValue !== undefined && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ms-auto text-[10px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md"
                  >
                    {badgeValue}
                  </motion.span>
                )}

                {/* Shortcut hint */}
                {!collapsed && item.shortcut && (
                  <span className="ms-auto text-[10px] text-white/20 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.shortcut}
                  </span>
                )}
              </motion.button>

              {/* Collapsed tooltip */}
              {collapsed && (
                <NavTooltip
                  label={item.label}
                  visible={hoveredItem === item.id}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="shrink-0 border-t border-white/[0.06] p-2">
        {/* Quick Stats - smooth collapse with overflow hidden */}
        <motion.div
          animate={{
            height: collapsed ? 0 : 'auto',
            opacity: collapsed ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="overflow-hidden"
        >
          <div className="px-3 pb-2 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/35">פרויקטים</span>
              <span className="text-white/60 font-medium">{totalProjects}</span>
            </div>
            {activeClaude > 0 && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/35">Claude פעיל</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 status-pulse" />
                  <span className="text-blue-400 font-medium">{activeClaude}</span>
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* User Avatar + Collapse Toggle */}
        <div className={cn('flex items-center gap-2', collapsed ? 'flex-col' : 'flex-row')}>
          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 text-[11px] font-bold text-white shadow-md">
            KT
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <div className="text-xs text-white/70 font-medium truncate">Kaniel T.</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse Toggle */}
          <motion.button
            onClick={toggleSidebar}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors shrink-0"
            title={collapsed ? 'הרחב' : 'כווץ'}
          >
            <motion.svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <path d="M10 12L6 8L10 4" />
            </motion.svg>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}

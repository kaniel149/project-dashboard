import { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '@/stores/appStore';
import { useProjectStore } from '@/stores/projectStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Kbd } from '@/components/ui/Kbd';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { pageTransition, pageSpring, staggerContainer, staggerItem } from '@/lib/motion';
import { VIEW_MODES, SORT_OPTIONS, KEYBOARD_SHORTCUTS } from '@/lib/constants';
import type { ViewMode, ProjectSortKey } from '@/types';

// ===== Constants =====

const accentColors = [
  { id: 'blue', label: 'כחול', color: 'bg-blue-500', ring: 'ring-blue-500' },
  { id: 'purple', label: 'סגול', color: 'bg-purple-500', ring: 'ring-purple-500' },
  { id: 'cyan', label: 'ציאן', color: 'bg-cyan-500', ring: 'ring-cyan-500' },
  { id: 'green', label: 'ירוק', color: 'bg-green-500', ring: 'ring-green-500' },
];

const refreshIntervalOptions = [
  { value: '15', label: '15 שניות' },
  { value: '30', label: '30 שניות' },
  { value: '60', label: 'דקה' },
  { value: '300', label: '5 דקות' },
];

const startupPageOptions = [
  { value: '/', label: 'סקירה' },
  { value: '/projects', label: 'פרויקטים' },
  { value: '/timeline', label: 'ציר זמן' },
];

const viewDropdownOptions = VIEW_MODES.map((m) => ({ value: m.id, label: m.label }));
const sortDropdownOptions = SORT_OPTIONS.map((s) => ({ value: s.id, label: s.label }));

const shortcutCategories = [
  {
    title: 'ניווט',
    items: [
      { key: 'commandPalette', label: 'Command Palette' },
      { key: 'search', label: 'חיפוש' },
      { key: 'refresh', label: 'רענון' },
      { key: 'navDashboard', label: 'סקירה' },
      { key: 'navProjects', label: 'פרויקטים' },
      { key: 'navTimeline', label: 'ציר זמן' },
      { key: 'navSettings', label: 'הגדרות' },
    ],
  },
  {
    title: 'רשימה',
    items: [
      { key: 'listUp', label: 'למעלה ברשימה' },
      { key: 'listDown', label: 'למטה ברשימה' },
      { key: 'open', label: 'פתח פרויקט' },
      { key: 'back', label: 'חזרה' },
    ],
  },
];

// ===== Helper Components =====

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold text-white/80">{title}</h2>
      {description && (
        <p className="text-[11px] text-white/30 mt-0.5">{description}</p>
      )}
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <motion.div variants={staggerItem} className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm text-white/70">{label}</p>
        {description && (
          <p className="text-[11px] text-white/30 mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </motion.div>
  );
}

// ===== Main =====

export default function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const addToast = useAppStore((s) => s.addToast);
  const refresh = useProjectStore((s) => s.refresh);
  const loading = useProjectStore((s) => s.loading);

  const [accentColor, setAccentColor] = useState('blue');

  const handleClearCache = () => {
    // Clear any cached data
    localStorage.removeItem('project-dashboard-cache');
    addToast({ type: 'success', title: 'המטמון נוקה בהצלחה' });
  };

  const handleRescan = async () => {
    await refresh();
    addToast({ type: 'success', title: 'סריקה מחדש הושלמה' });
  };

  const handleExportSettings = () => {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-dashboard-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'ההגדרות יוצאו בהצלחה' });
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageSpring}
      className="space-y-6 max-w-2xl p-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white/90">הגדרות</h1>
        <p className="text-sm text-white/35 mt-0.5">ניהול העדפות ותצורת האפליקציה</p>
      </div>

      {/* Appearance */}
      <GlassCard depth={1} className="p-5">
        <SectionHeader title="מראה" description="עיצוב וצבעי הממשק" />
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-1 divide-y divide-white/[0.04]"
        >
          {/* Theme preview */}
          <SettingRow label="ערכת נושא" description="כרגע רק dark mode נתמך">
            <div className="flex items-center gap-2">
              <div className="w-16 h-10 rounded-lg bg-[#0a0a0f] border border-white/[0.08] flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-1 start-1 w-3 h-1 rounded-sm bg-white/[0.15]" />
                <div className="absolute top-1 end-1 w-1.5 h-1 rounded-sm bg-blue-500/40" />
                <div className="absolute bottom-1.5 start-1.5 w-6 h-1 rounded-sm bg-white/[0.08]" />
                <div className="absolute bottom-1.5 end-1.5 w-3 h-1 rounded-sm bg-white/[0.06]" />
              </div>
              <span className="text-xs text-white/40 font-medium">Dark</span>
            </div>
          </SettingRow>

          {/* Accent color */}
          <SettingRow label="צבע מבטא" description="צבע הדגשה ראשי">
            <div className="flex items-center gap-2">
              {accentColors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAccentColor(c.id)}
                  className={cn(
                    'w-6 h-6 rounded-full transition-all cursor-pointer',
                    c.color,
                    accentColor === c.id && `ring-2 ring-offset-2 ring-offset-[#0a0a0f] ${c.ring}`,
                  )}
                  title={c.label}
                />
              ))}
            </div>
          </SettingRow>
        </motion.div>
      </GlassCard>

      {/* Behavior */}
      <GlassCard depth={1} className="p-5">
        <SectionHeader title="התנהגות" description="תדירות רענון ואפשרויות הפעלה" />
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-1 divide-y divide-white/[0.04]"
        >
          {/* Refresh interval */}
          <SettingRow label="מרווח רענון" description="כל כמה זמן לרענן את הנתונים">
            <Dropdown
              value={String(settings.refreshInterval)}
              onChange={(val) => updateSettings({ refreshInterval: Number(val) })}
              options={refreshIntervalOptions}
              className="w-32"
            />
          </SettingRow>

          {/* Auto-collapse sidebar */}
          <SettingRow label="כיווץ אוטומטי" description="כווץ את הסרגל הצדדי באופן אוטומטי">
            <Toggle
              checked={settings.sidebarCollapsed}
              onChange={(checked) => updateSettings({ sidebarCollapsed: checked })}
            />
          </SettingRow>

          {/* Default view */}
          <SettingRow label="תצוגה ברירת מחדל" description="תצוגת רשימת פרויקטים">
            <Dropdown
              value={settings.defaultView}
              onChange={(val) => updateSettings({ defaultView: val as ViewMode })}
              options={viewDropdownOptions}
              className="w-32"
            />
          </SettingRow>

          {/* Default sort */}
          <SettingRow label="מיון ברירת מחדל" description="סדר מיון פרויקטים">
            <Dropdown
              value={settings.defaultSort}
              onChange={(val) => updateSettings({ defaultSort: val as ProjectSortKey })}
              options={sortDropdownOptions}
              className="w-32"
            />
          </SettingRow>
        </motion.div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard depth={1} className="p-5">
        <SectionHeader title="התראות" description="ניהול סוגי ההתראות" />
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-1 divide-y divide-white/[0.04]"
        >
          <SettingRow label="הצג התראות" description="התראות כלליות באפליקציה">
            <Toggle
              checked={settings.showNotifications}
              onChange={(checked) => updateSettings({ showNotifications: checked })}
            />
          </SettingRow>

          <SettingRow label="ניווט מקלדת" description="ניווט ברשימות עם J/K">
            <Toggle
              checked={settings.keyboardNavEnabled}
              onChange={(checked) => updateSettings({ keyboardNavEnabled: checked })}
            />
          </SettingRow>
        </motion.div>
      </GlassCard>

      {/* Keyboard Shortcuts */}
      <GlassCard depth={1} className="p-5">
        <SectionHeader title="קיצורי מקלדת" description="כל קיצורי המקלדת הזמינים" />
        {shortcutCategories.map((category) => (
          <div key={category.title} className="mb-4 last:mb-0">
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2 font-semibold">{category.title}</p>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-0.5"
            >
              {category.items.map((item) => {
                const shortcut = KEYBOARD_SHORTCUTS[item.key as keyof typeof KEYBOARD_SHORTCUTS];
                if (!shortcut) return null;
                return (
                  <motion.div
                    key={item.key}
                    variants={staggerItem}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="text-sm text-white/60">{item.label}</span>
                    <Kbd>{shortcut.label}</Kbd>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        ))}
      </GlassCard>

      {/* Data */}
      <GlassCard depth={1} className="p-5">
        <SectionHeader title="נתונים" description="ניהול מטמון ויצוא" />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearCache}
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M13 4v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4" />
              </svg>
            }
          >
            נקה מטמון
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRescan}
            loading={loading}
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 8a7 7 0 0113.16-3.36M15 8A7 7 0 011.84 11.36" />
                <path d="M14 1v4h-4M2 15v-4h4" />
              </svg>
            }
          >
            סרוק מחדש
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportSettings}
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 10v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3" />
                <path d="M4 6l4 4 4-4M8 2v8" />
              </svg>
            }
          >
            ייצא הגדרות
          </Button>
        </div>
      </GlassCard>

      {/* About */}
      <GlassCard depth={1} className="p-5">
        <SectionHeader title="אודות" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">גרסה</span>
            <Badge variant="gray" size="sm">2.0.0</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">טכנולוגיה</span>
            <div className="flex gap-1.5">
              <Badge variant="blue" size="sm">React 19</Badge>
              <Badge variant="gray" size="sm">TypeScript</Badge>
              <Badge variant="gray" size="sm">Tailwind v4</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">עיצוב</span>
            <span className="text-sm text-white/40">Dark Glassmorphism</span>
          </div>
          <div className="pt-3 border-t border-white/[0.04]">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/20">
                Built with React + TypeScript + Tailwind CSS
              </p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

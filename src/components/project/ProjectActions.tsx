import { useCallback } from 'react';
import { motion } from 'motion/react';
import { cn, isElectron, modKey } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { Tooltip } from '@/components/ui/Tooltip';
import type { Project } from '@/types';

interface ProjectActionsProps {
  project: Project;
  className?: string;
  compact?: boolean;
}

interface ActionButton {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: (project: Project) => void;
  available: boolean;
}

const copyIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="5" width="9" height="9" rx="2" />
    <path d="M5 11H3.5A1.5 1.5 0 012 9.5v-7A1.5 1.5 0 013.5 1h7A1.5 1.5 0 0112 2.5V5" />
  </svg>
);

const githubIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const terminalIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h12M4 4l4 4-4 4" />
  </svg>
);

const codeIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 4L1 8l4 4M11 4l4 4-4 4" />
  </svg>
);

const claudeIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="6" r="4" />
    <path d="M4 14c0-2.2 1.8-4 4-4s4 1.8 4 4" />
  </svg>
);

const folderIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v9a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1H8l-2-2H2a1 1 0 00-1 1z" />
  </svg>
);

const refreshIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 8a7 7 0 0113-3.5M15 8a7 7 0 01-13 3.5" />
    <path d="M14 1v4h-4M2 15v-4h4" />
  </svg>
);

const globeIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M2 8h12M8 2c1.5 1.5 2.5 3.5 2.5 6s-1 4.5-2.5 6c-1.5-1.5-2.5-3.5-2.5-6s1-4.5 2.5-6z" />
  </svg>
);

export function ProjectActions({ project, className, compact = false }: ProjectActionsProps) {
  const addToast = useAppStore((s) => s.addToast);

  const copyPath = useCallback(() => {
    navigator.clipboard.writeText(project.path).then(() => {
      addToast({ type: 'success', title: 'הנתיב הועתק', duration: 2000 });
    });
  }, [project.path, addToast]);

  const openGithub = useCallback(() => {
    const repoName = project.name.toLowerCase().replace(/\s+/g, '-');
    window.open(`https://github.com/${repoName}`, '_blank');
  }, [project.name]);

  const openLocalhost = useCallback(() => {
    window.open('http://localhost:3000', '_blank');
  }, []);

  const actions: ActionButton[] = [
    // Always available actions
    {
      id: 'copy',
      label: 'העתק נתיב',
      shortcut: `${modKey}C`,
      icon: copyIcon,
      action: copyPath,
      available: true,
    },
    {
      id: 'github',
      label: 'פתח GitHub',
      icon: githubIcon,
      action: openGithub,
      available: true,
    },
    {
      id: 'browser',
      label: 'פתח בדפדפן',
      icon: globeIcon,
      action: openLocalhost,
      available: true,
    },
    // Electron-only actions
    {
      id: 'vscode',
      label: 'VSCode',
      shortcut: `${modKey}O`,
      icon: codeIcon,
      action: async (p) => {
        try {
          await window.electronAPI?.openVSCode(p.path);
        } catch {
          addToast({ type: 'error', title: 'Failed to open VSCode' });
        }
      },
      available: isElectron,
    },
    {
      id: 'terminal',
      label: 'Terminal',
      shortcut: `${modKey}T`,
      icon: terminalIcon,
      action: async (p) => {
        try {
          await window.electronAPI?.openTerminal(p.path);
        } catch {
          addToast({ type: 'error', title: 'Failed to open Terminal' });
        }
      },
      available: isElectron,
    },
    {
      id: 'claude',
      label: 'Claude',
      icon: claudeIcon,
      action: async (p) => {
        try {
          await window.electronAPI?.openClaude(p.path);
        } catch {
          addToast({ type: 'error', title: 'Failed to open Claude' });
        }
      },
      available: isElectron,
    },
    {
      id: 'finder',
      label: 'Finder',
      icon: folderIcon,
      action: async (p) => {
        try {
          await window.electronAPI?.openProjectMap(p.path);
        } catch {
          addToast({ type: 'error', title: 'Failed to open Finder' });
        }
      },
      available: isElectron,
    },
    {
      id: 'refresh',
      label: 'סנכרן',
      shortcut: `${modKey}R`,
      icon: refreshIcon,
      action: () => {
        addToast({ type: 'info', title: 'מסנכרן...', duration: 2000 });
      },
      available: true,
    },
  ];

  const availableActions = actions.filter((a) => a.available);

  return (
    <div className={cn('flex items-center gap-1', compact ? 'gap-0.5' : 'gap-1', className)}>
      {availableActions.map((action) => (
        <Tooltip
          key={action.id}
          content={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
          position="bottom"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              action.action(project);
            }}
            className={cn(
              'flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/80 hover:bg-white/[0.08] hover:border-white/[0.10] transition-colors cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50',
              compact ? 'h-6 w-6' : 'h-7 w-7',
            )}
          >
            {action.icon}
          </motion.button>
        </Tooltip>
      ))}
    </div>
  );
}

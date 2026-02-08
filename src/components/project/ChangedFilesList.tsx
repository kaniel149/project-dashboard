import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useAppStore } from '@/stores/appStore';
import type { ChangedFile } from '@/types';

interface ChangedFilesListProps {
  files: ChangedFile[];
  className?: string;
}

// File extension to icon mapping
function getFileIcon(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, string> = {
    tsx: '\u269B\uFE0F',
    jsx: '\u269B\uFE0F',
    ts: '\uD83D\uDCDC',
    js: '\uD83D\uDCDC',
    css: '\uD83C\uDFA8',
    scss: '\uD83C\uDFA8',
    sass: '\uD83C\uDFA8',
    less: '\uD83C\uDFA8',
    json: '\uD83D\uDCCB',
    md: '\uD83D\uDCDD',
    mdx: '\uD83D\uDCDD',
    py: '\uD83D\uDC0D',
    sql: '\uD83D\uDDC3\uFE0F',
    html: '\uD83C\uDF10',
    svg: '\uD83D\uDDBC\uFE0F',
    png: '\uD83D\uDDBC\uFE0F',
    jpg: '\uD83D\uDDBC\uFE0F',
    jpeg: '\uD83D\uDDBC\uFE0F',
    gif: '\uD83D\uDDBC\uFE0F',
    yml: '\u2699\uFE0F',
    yaml: '\u2699\uFE0F',
    toml: '\u2699\uFE0F',
    env: '\uD83D\uDD12',
    sh: '\uD83D\uDCBB',
    bash: '\uD83D\uDCBB',
    rs: '\u2699\uFE0F',
    go: '\uD83D\uDC39',
    rb: '\uD83D\uDC8E',
    java: '\u2615',
    kt: '\uD83D\uDD36',
    swift: '\uD83D\uDD36',
    vue: '\uD83C\uDF3F',
    svelte: '\uD83D\uDD25',
    lock: '\uD83D\uDD12',
  };
  return iconMap[ext] || '\uD83D\uDCC4';
}

// Status dot colors and labels
const STATUS_CONFIG: Record<string, { color: string; dotColor: string; label: string }> = {
  M: { color: 'text-yellow-400', dotColor: 'bg-yellow-400', label: 'שונה' },
  A: { color: 'text-green-400', dotColor: 'bg-green-400', label: 'נוסף' },
  D: { color: 'text-red-400', dotColor: 'bg-red-400', label: 'נמחק' },
  R: { color: 'text-blue-400', dotColor: 'bg-blue-400', label: 'שם שונה' },
  '?': { color: 'text-purple-400', dotColor: 'bg-purple-400', label: 'לא במעקב' },
  U: { color: 'text-orange-400', dotColor: 'bg-orange-400', label: 'עודכן' },
};

const DEFAULT_STATUS = { color: 'text-white/40', dotColor: 'bg-white/40', label: '' };

interface FolderGroup {
  folder: string;
  files: ChangedFile[];
}

function groupFilesByFolder(files: ChangedFile[]): FolderGroup[] {
  const groups: Map<string, ChangedFile[]> = new Map();

  files.forEach((file) => {
    const parts = file.path.split('/');
    const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '.';
    if (!groups.has(folder)) {
      groups.set(folder, []);
    }
    groups.get(folder)!.push(file);
  });

  return Array.from(groups.entries())
    .map(([folder, files]) => ({ folder, files }))
    .sort((a, b) => a.folder.localeCompare(b.folder));
}

function FolderGroupComponent({ group, onCopyPath }: { group: FolderGroup; onCopyPath: (path: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      {/* Folder header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-2 w-full px-3 py-1 text-start hover:bg-white/[0.02] rounded-md transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
      >
        <motion.svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-white/20 shrink-0"
          animate={{ rotate: collapsed ? -90 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <path d="M2.5 4L5 6.5L7.5 4" />
        </motion.svg>
        <span className="text-[10px] text-white/25">{'\uD83D\uDCC1'}</span>
        <span className="text-[11px] font-mono text-white/35 truncate" dir="ltr">{group.folder}/</span>
        <span className="text-[9px] text-white/20 ms-auto">{group.files.length}</span>
      </button>

      {/* Files */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="ps-6">
              {group.files.map((file, i) => {
                const fileName = file.path.split('/').pop() || file.path;
                const status = STATUS_CONFIG[file.status] || DEFAULT_STATUS;
                const icon = getFileIcon(file.path);

                return (
                  <motion.button
                    key={`${file.status}-${file.path}-${i}`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyPath(file.path);
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1 rounded-md hover:bg-white/[0.03] transition-colors cursor-pointer group/file text-start focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
                    title={file.path}
                  >
                    {/* Status dot */}
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', status.dotColor)} />

                    {/* File icon */}
                    <span className="text-[11px] shrink-0">{icon}</span>

                    {/* File name */}
                    <span className="text-[12px] font-mono text-white/55 truncate group-hover/file:text-white/75 transition-colors" dir="ltr">
                      {fileName}
                    </span>

                    {/* Status letter */}
                    <span className={cn('text-[9px] font-bold font-mono shrink-0 ms-auto opacity-0 group-hover/file:opacity-100 transition-opacity', status.color)}>
                      {file.status}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ChangedFilesList({ files, className }: ChangedFilesListProps) {
  const addToast = useAppStore((s) => s.addToast);

  const copyPath = useCallback((path: string) => {
    navigator.clipboard.writeText(path).then(() => {
      addToast({ type: 'success', title: 'נתיב הועתק', duration: 1500 });
    });
  }, [addToast]);

  const groups = useMemo(() => groupFilesByFolder(files), [files]);

  // Count by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    files.forEach((f) => {
      counts[f.status] = (counts[f.status] || 0) + 1;
    });
    return counts;
  }, [files]);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/15 mb-2">
          <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
        </svg>
        <span className="text-white/30 text-sm">אין קבצים ששונו</span>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn('space-y-1', className)}
    >
      {/* Summary header */}
      <motion.div variants={staggerItem} className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.04] mb-1">
        <span className="text-[11px] font-medium text-white/50">
          {files.length} קבצים שונו
        </span>
        <div className="flex items-center gap-2 ms-auto">
          {Object.entries(statusCounts).map(([status, count]) => {
            const config = STATUS_CONFIG[status] || DEFAULT_STATUS;
            return (
              <span key={status} className="flex items-center gap-1">
                <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
                <span className={cn('text-[10px] font-mono', config.color)}>{count}</span>
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* Scrollable file list */}
      <div className="max-h-72 overflow-y-auto scrollbar-thin space-y-0.5">
        {groups.length === 1 && groups[0].folder === '.' ? (
          // No nesting for root-only files
          groups[0].files.map((file, i) => {
            const status = STATUS_CONFIG[file.status] || DEFAULT_STATUS;
            const icon = getFileIcon(file.path);

            return (
              <motion.button
                key={`${file.status}-${file.path}-${i}`}
                variants={staggerItem}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => copyPath(file.path)}
                className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer text-start group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
                title={file.path}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', status.dotColor)} />
                <span className="text-[12px] shrink-0">{icon}</span>
                <span className="text-[12px] font-mono text-white/55 truncate group-hover:text-white/75 transition-colors" dir="ltr">
                  {file.path}
                </span>
                <span className={cn('text-[9px] font-bold font-mono shrink-0 ms-auto opacity-0 group-hover:opacity-100 transition-opacity', status.color)}>
                  {file.status}
                </span>
              </motion.button>
            );
          })
        ) : (
          groups.map((group) => (
            <motion.div key={group.folder} variants={staggerItem}>
              <FolderGroupComponent group={group} onCopyPath={copyPath} />
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

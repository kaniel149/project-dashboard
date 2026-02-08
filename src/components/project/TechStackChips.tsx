import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/tokens';

interface TechStackChipsProps {
  techs: string[];
  limit?: number;
  className?: string;
  onTechClick?: (tech: string) => void;
}

// Tech-specific colors: [bg, text, border]
const TECH_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  react: { bg: 'bg-cyan-500/12', text: 'text-cyan-400', border: 'border-cyan-500/20', icon: '\u269B\uFE0F' },
  'react native': { bg: 'bg-cyan-500/12', text: 'text-cyan-400', border: 'border-cyan-500/20', icon: '\u269B\uFE0F' },
  typescript: { bg: 'bg-blue-500/12', text: 'text-blue-400', border: 'border-blue-500/20', icon: '\uD835\uDDE7\uD835\uDDE6' },
  javascript: { bg: 'bg-yellow-500/12', text: 'text-yellow-400', border: 'border-yellow-500/20', icon: '\uD835\uDDE8\uD835\uDDE6' },
  python: { bg: 'bg-yellow-500/12', text: 'text-yellow-300', border: 'border-yellow-500/20', icon: '\uD83D\uDC0D' },
  'node.js': { bg: 'bg-green-500/12', text: 'text-green-400', border: 'border-green-500/20', icon: '\u25B2' },
  node: { bg: 'bg-green-500/12', text: 'text-green-400', border: 'border-green-500/20', icon: '\u25B2' },
  docker: { bg: 'bg-blue-600/12', text: 'text-blue-300', border: 'border-blue-600/20', icon: '\uD83D\uDC33' },
  postgresql: { bg: 'bg-indigo-500/12', text: 'text-indigo-400', border: 'border-indigo-500/20', icon: '\uD83D\uDC18' },
  postgres: { bg: 'bg-indigo-500/12', text: 'text-indigo-400', border: 'border-indigo-500/20', icon: '\uD83D\uDC18' },
  tailwind: { bg: 'bg-sky-500/12', text: 'text-sky-400', border: 'border-sky-500/20', icon: '\uD83C\uDF0A' },
  tailwindcss: { bg: 'bg-sky-500/12', text: 'text-sky-400', border: 'border-sky-500/20', icon: '\uD83C\uDF0A' },
  'tailwind css': { bg: 'bg-sky-500/12', text: 'text-sky-400', border: 'border-sky-500/20', icon: '\uD83C\uDF0A' },
  nextjs: { bg: 'bg-white/[0.08]', text: 'text-white/80', border: 'border-white/[0.12]', icon: '\u25B2' },
  'next.js': { bg: 'bg-white/[0.08]', text: 'text-white/80', border: 'border-white/[0.12]', icon: '\u25B2' },
  vue: { bg: 'bg-emerald-500/12', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: '\uD83C\uDF3F' },
  angular: { bg: 'bg-red-500/12', text: 'text-red-400', border: 'border-red-500/20', icon: '\uD83C\uDD70\uFE0F' },
  rust: { bg: 'bg-orange-500/12', text: 'text-orange-400', border: 'border-orange-500/20', icon: '\u2699\uFE0F' },
  go: { bg: 'bg-cyan-600/12', text: 'text-cyan-300', border: 'border-cyan-600/20', icon: '\uD83D\uDC39' },
  golang: { bg: 'bg-cyan-600/12', text: 'text-cyan-300', border: 'border-cyan-600/20', icon: '\uD83D\uDC39' },
  swift: { bg: 'bg-orange-500/12', text: 'text-orange-400', border: 'border-orange-500/20', icon: '\uD83D\uDD36' },
  redis: { bg: 'bg-red-500/12', text: 'text-red-400', border: 'border-red-500/20', icon: '\uD83D\uDFE5' },
  mongodb: { bg: 'bg-green-600/12', text: 'text-green-400', border: 'border-green-600/20', icon: '\uD83C\uDF43' },
  graphql: { bg: 'bg-pink-500/12', text: 'text-pink-400', border: 'border-pink-500/20', icon: '\u25C6' },
  supabase: { bg: 'bg-emerald-500/12', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: '\u26A1' },
  vite: { bg: 'bg-purple-500/12', text: 'text-purple-400', border: 'border-purple-500/20', icon: '\u26A1' },
  electron: { bg: 'bg-sky-600/12', text: 'text-sky-300', border: 'border-sky-600/20', icon: '\uD83D\uDD2C' },
  express: { bg: 'bg-white/[0.06]', text: 'text-white/60', border: 'border-white/[0.08]', icon: '\uD83D\uDE82' },
  css: { bg: 'bg-blue-500/12', text: 'text-blue-400', border: 'border-blue-500/20', icon: '\uD83C\uDFA8' },
  html: { bg: 'bg-orange-500/12', text: 'text-orange-400', border: 'border-orange-500/20', icon: '\uD83C\uDF10' },
  sql: { bg: 'bg-amber-500/12', text: 'text-amber-400', border: 'border-amber-500/20', icon: '\uD83D\uDDC3\uFE0F' },
  firebase: { bg: 'bg-amber-500/12', text: 'text-amber-400', border: 'border-amber-500/20', icon: '\uD83D\uDD25' },
  aws: { bg: 'bg-orange-500/12', text: 'text-orange-400', border: 'border-orange-500/20', icon: '\u2601\uFE0F' },
  vercel: { bg: 'bg-white/[0.08]', text: 'text-white/80', border: 'border-white/[0.12]', icon: '\u25B2' },
};

const DEFAULT_COLORS = { bg: 'bg-white/[0.05]', text: 'text-white/60', border: 'border-white/[0.06]', icon: '' };

function getTechConfig(tech: string): { bg: string; text: string; border: string; icon: string } {
  const key = tech.toLowerCase().trim();
  return TECH_COLORS[key] || DEFAULT_COLORS;
}

function getInitialIcon(tech: string): string {
  const config = getTechConfig(tech);
  if (config.icon) return config.icon;
  // Fallback: first letter uppercase
  return tech.charAt(0).toUpperCase();
}

export function TechStackChips({ techs, limit = 4, className, onTechClick }: TechStackChipsProps) {
  const visible = techs.slice(0, limit);
  const remaining = techs.length - limit;
  const hiddenTechs = techs.slice(limit);
  const [showOverflow, setShowOverflow] = useState(false);
  const overflowTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleOverflowEnter = () => {
    overflowTimerRef.current = setTimeout(() => setShowOverflow(true), 200);
  };

  const handleOverflowLeave = () => {
    clearTimeout(overflowTimerRef.current);
    setShowOverflow(false);
  };

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {visible.map((tech, i) => {
        const config = getTechConfig(tech);
        const icon = getInitialIcon(tech);

        return (
          <motion.button
            key={tech}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 20 }}
            whileHover={{ scale: 1.08, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onTechClick?.(tech);
            }}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md border backdrop-blur-sm cursor-pointer transition-colors duration-150',
              config.bg,
              config.text,
              config.border,
              'hover:brightness-125 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
            )}
            title={tech}
          >
            <span className="text-[10px] leading-none">{icon}</span>
            <span>{tech}</span>
          </motion.button>
        );
      })}
      {remaining > 0 && (
        <div
          className="relative inline-flex"
          onMouseEnter={handleOverflowEnter}
          onMouseLeave={handleOverflowLeave}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: visible.length * 0.04 }}
            className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-white/35 rounded-md bg-white/[0.03] border border-white/[0.04] cursor-default"
          >
            +{remaining}
          </motion.span>

          <AnimatePresence>
            {showOverflow && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="absolute bottom-full mb-2 end-0 px-2.5 py-2 rounded-xl bg-[#1a1a26]/95 border border-white/[0.08] backdrop-blur-md shadow-xl pointer-events-none min-w-[120px]"
                style={{ zIndex: zIndex.tooltip }}
              >
                <div className="space-y-1">
                  {hiddenTechs.map((tech) => {
                    const config = getTechConfig(tech);
                    const icon = getInitialIcon(tech);
                    return (
                      <div key={tech} className="flex items-center gap-1.5 text-[10px]">
                        <span>{icon}</span>
                        <span className={config.text}>{tech}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute top-full end-3 w-2 h-2 rotate-45 bg-[#1a1a26]/95 border-b border-e border-white/[0.08]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

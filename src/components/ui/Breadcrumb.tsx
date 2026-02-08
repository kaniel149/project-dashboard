import { type ReactNode, Fragment } from 'react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
  className?: string;
}

function ChevronSeparator() {
  return (
    <svg
      className="h-3.5 w-3.5 text-white/20 rtl:rotate-180 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function Breadcrumb({ items, onNavigate, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5', className)}>
      <ol className="flex items-center gap-1.5 min-w-0">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              {i > 0 && <ChevronSeparator />}
              <li className="flex items-center gap-1 min-w-0">
                {item.icon && (
                  <span className="flex-shrink-0 text-white/35">{item.icon}</span>
                )}
                {isLast || !item.href ? (
                  <span
                    className={cn(
                      'text-sm truncate max-w-[180px]',
                      isLast ? 'text-white/90 font-medium' : 'text-white/45',
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <button
                    onClick={() => item.href && onNavigate?.(item.href)}
                    className="text-sm text-white/45 hover:text-white/75 transition-colors truncate max-w-[180px] cursor-pointer focus-visible:outline-none focus-visible:text-white/75"
                  >
                    {item.label}
                  </button>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

import { cn, stringToColor } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  src?: string;
  className?: string;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: 'h-7 w-7', text: 'text-[10px]' },
  md: { container: 'h-9 w-9', text: 'text-xs' },
  lg: { container: 'h-12 w-12', text: 'text-sm' },
};

function getInitials(name: string): string {
  return name
    .split(/[\s-_]+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function Avatar({ name, size = 'md', src, className }: AvatarProps) {
  const s = sizeClasses[size];
  const gradient = stringToColor(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-xl object-cover border border-white/[0.08]',
          s.container,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl bg-gradient-to-br font-semibold text-white/90 select-none',
        gradient,
        s.container,
        s.text,
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}

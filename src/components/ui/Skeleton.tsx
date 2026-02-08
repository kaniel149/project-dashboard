import { cn } from '@/lib/utils';

type SkeletonVariant = 'text' | 'circle' | 'card';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: SkeletonVariant;
  className?: string;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: 'rounded-md',
  circle: 'rounded-full',
  card: 'rounded-2xl',
};

const shimmerClass =
  'relative overflow-hidden bg-white/[0.04] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent';

export function Skeleton({
  width,
  height,
  variant = 'text',
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn(shimmerClass, variantClasses[variant], className)}
      style={{
        width: width ?? '100%',
        height: height ?? (variant === 'text' ? 16 : variant === 'circle' ? 40 : 120),
      }}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 space-y-4',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width={36} height={36} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={10} />
        </div>
      </div>
      <Skeleton height={10} />
      <Skeleton width="80%" height={10} />
      <div className="flex gap-2 pt-1">
        <Skeleton width={60} height={22} variant="text" className="rounded-full" />
        <Skeleton width={48} height={22} variant="text" className="rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonList({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4"
        >
          <Skeleton variant="circle" width={32} height={32} />
          <div className="flex-1 space-y-2">
            <Skeleton width={`${60 + Math.random() * 30}%`} height={13} />
            <Skeleton width={`${30 + Math.random() * 20}%`} height={10} />
          </div>
          <Skeleton width={64} height={24} className="rounded-full" />
        </div>
      ))}
    </div>
  );
}

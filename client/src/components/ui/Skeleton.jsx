// Grey shimmering placeholders shown while data loads.
import { cn } from '../../utils/cn.js';

export const Skeleton = ({ className }) => (
  <div className={cn('relative overflow-hidden rounded-lg bg-surface-subtle', className)} aria-hidden>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-surface/70 to-transparent" />
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2.5">
    {Array.from({ length: lines }, (_, i) => <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />)}
  </div>
);

export const SkeletonCard = () => (
  <div className="rounded-card border border-surface-border bg-surface p-6 shadow-card">
    <Skeleton className="mb-4 h-4 w-1/3" />
    <SkeletonText />
  </div>
);

export const SkeletonStats = ({ count = 4 }) => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="rounded-card border border-surface-border bg-surface p-5 shadow-card">
        <Skeleton className="mb-4 h-9 w-9 rounded-xl" /><Skeleton className="mb-2 h-6 w-1/2" /><Skeleton className="h-3 w-2/3" />
      </div>
    ))}
  </div>
);

export const SkeletonRows = ({ rows = 5, cols = 5 }) => (
  <div className="divide-y divide-surface-border">
    {Array.from({ length: rows }, (_, r) => (
      <div key={r} className="flex items-center gap-4 px-5 py-4">
        {Array.from({ length: cols }, (_, c) => <Skeleton key={c} className={cn('h-4', c === 0 ? 'w-1/4' : 'flex-1')} />)}
      </div>
    ))}
  </div>
);

export default Skeleton;

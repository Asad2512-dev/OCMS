// Loading indicators: a small spinner and a full-page loader.
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { STRINGS } from '../../config/strings.js';

export const Spinner = ({ className }) => <Loader2 className={cn('h-5 w-5 animate-spin text-primary', className)} aria-label={STRINGS.common.loading} />;

export const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-surface">
    <Spinner className="h-8 w-8" />
  </div>
);
export default Spinner;

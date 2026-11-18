// Button with variants (primary, secondary, outline, ghost, danger), sizes, optional icon and loading spinner.
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const VARIANTS = {
  primary: 'bg-primary text-ink-inverse shadow-soft hover:bg-primary-hover active:bg-primary-dark',
  secondary: 'bg-primary-soft text-primary hover:bg-primary-muted/60',
  outline: 'border border-surface-border bg-surface text-ink-soft shadow-soft hover:bg-surface-muted hover:text-ink',
  ghost: 'text-ink-muted hover:bg-surface-subtle hover:text-ink',
  danger: 'bg-danger text-ink-inverse shadow-soft hover:bg-danger-hover',
  'danger-ghost': 'text-danger hover:bg-danger-soft',
};
const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-9 w-9 justify-center',
};

const Button = forwardRef(({ variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, loading, disabled, className, children, type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    disabled={disabled || loading}
    className={cn(
      'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-control font-medium transition-all duration-150',
      'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
      VARIANTS[variant], SIZES[size], className
    )}
    {...props}
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : Icon && <Icon className="h-4 w-4" aria-hidden />}
    {children}
    {IconRight && !loading && <IconRight className="h-4 w-4" aria-hidden />}
  </button>
));
Button.displayName = 'Button';
export default Button;

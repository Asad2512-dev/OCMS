// On/off switch with a label and helper text (accessible as a switch).
import { useId } from 'react';
import { cn } from '../../utils/cn.js';

const Toggle = ({ checked, onChange, label, help, icon: Icon, className }) => {
  const id = useId();
  return (
    <div className={cn('flex items-start gap-4', className)}>
      <button
        id={id} type="button" role="switch" aria-checked={checked} aria-describedby={help ? `${id}-help` : undefined}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors', checked ? 'bg-primary' : 'bg-surface-strong')}
      >
        <span className={cn('inline-block h-5 w-5 transform rounded-full bg-surface shadow-soft transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
      </button>
      <div>
        <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          {Icon && <Icon className="h-4 w-4 text-primary" />}{label}
        </label>
        {help && <p id={`${id}-help`} className="mt-1 text-sm leading-relaxed text-ink-muted">{help}</p>}
      </div>
    </div>
  );
};
export default Toggle;

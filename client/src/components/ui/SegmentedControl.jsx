// Small group of toggle buttons (e.g. table view / card view).
import { cn } from '../../utils/cn.js';

const SegmentedControl = ({ options, value, onChange, className }) => (
  <div className={cn('inline-flex rounded-control border border-surface-border bg-surface-subtle p-0.5', className)} role="group">
    {options.map(({ value: v, label, icon: Icon }) => (
      <button key={v} type="button" onClick={() => onChange(v)} aria-pressed={value === v} title={label}
        className={cn('inline-flex h-8 items-center gap-1.5 rounded-[0.6rem] px-2.5 text-xs font-medium transition-all',
          value === v ? 'bg-surface text-ink shadow-soft' : 'text-ink-muted hover:text-ink')}>
        {Icon && <Icon className="h-4 w-4" />}<span className="sr-only sm:not-sr-only">{label}</span>
      </button>
    ))}
  </div>
);
export default SegmentedControl;

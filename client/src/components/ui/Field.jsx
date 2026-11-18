// Shared wrapper for form controls: label, hint and error message, linked for screen readers.
import { useId } from 'react';
import { cn } from '../../utils/cn.js';

export const controlClass = (error) => cn(
  'w-full rounded-control border bg-surface text-sm text-ink shadow-soft transition-colors placeholder:text-ink-faint',
  'focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-ink-muted',
  error ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-surface-border hover:border-surface-strong focus:border-primary focus:ring-primary/10'
);

export const useFieldIds = (id) => {
  const auto = useId();
  const base = id || auto;
  return { id: base, hintId: `${base}-hint`, errorId: `${base}-error` };
};

const Field = ({ label, hint, error, ids, required, className, children, aside }) => (
  <div className={className}>
    {(label || aside) && (
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={ids.id} className="label">
            {label}{required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
          </label>
        )}
        {aside && <span className="mb-1.5 text-xs text-ink-faint">{aside}</span>}
      </div>
    )}
    {children}
    {error ? (
      <p id={ids.errorId} role="alert" className="mt-1.5 text-xs font-medium text-danger">{error}</p>
    ) : hint ? (
      <p id={ids.hintId} className="mt-1.5 text-xs text-ink-muted">{hint}</p>
    ) : null}
  </div>
);
export default Field;

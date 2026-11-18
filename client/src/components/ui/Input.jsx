// Text input with label, hint, error, optional left icon and right-side element (e.g. show password button).
import { forwardRef } from 'react';
import Field, { controlClass, useFieldIds } from './Field.jsx';
import { cn } from '../../utils/cn.js';

const Input = forwardRef(({ label, hint, error, icon: Icon, right, required, className, inputClassName, id, ...props }, ref) => {
  const ids = useFieldIds(id);
  return (
    <Field label={label} hint={hint} error={error} ids={ids} required={required} className={className}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />}
        <input
          ref={ref}
          id={ids.id}
          aria-invalid={!!error}
          aria-describedby={error ? ids.errorId : hint ? ids.hintId : undefined}
          required={required}
          className={cn(controlClass(error), 'h-10 px-3', Icon && 'pl-9', right && 'pr-10', inputClassName)}
          {...props}
        />
        {right && <div className="absolute right-1 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </Field>
  );
});
Input.displayName = 'Input';
export default Input;

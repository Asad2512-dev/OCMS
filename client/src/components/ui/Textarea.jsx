// Multi-line text input with label, hint, error and an optional character counter.
import { forwardRef } from 'react';
import Field, { controlClass, useFieldIds } from './Field.jsx';
import { cn } from '../../utils/cn.js';
import { STRINGS } from '../../config/strings.js';

const Textarea = forwardRef(({ label, hint, error, maxLength, value = '', required, rows = 4, className, id, ...props }, ref) => {
  const ids = useFieldIds(id);
  return (
    <Field
      label={label} hint={hint} error={error} ids={ids} required={required} className={className}
      aside={maxLength ? STRINGS.common.characters(value.length, maxLength) : null}
    >
      <textarea
        ref={ref}
        id={ids.id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? ids.errorId : hint ? ids.hintId : undefined}
        className={cn(controlClass(error), 'resize-y px-3 py-2.5 leading-relaxed')}
        {...props}
      />
    </Field>
  );
});
Textarea.displayName = 'Textarea';
export default Textarea;

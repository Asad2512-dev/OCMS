// Dropdown select with label and error. options = [{ value, label }]; "placeholder" adds an empty first option.
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import Field, { controlClass, useFieldIds } from './Field.jsx';
import { cn } from '../../utils/cn.js';

const Select = forwardRef(({ label, hint, error, options = [], placeholder, required, className, selectClassName, id, ...props }, ref) => {
  const ids = useFieldIds(id);
  return (
    <Field label={label} hint={hint} error={error} ids={ids} required={required} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={ids.id}
          aria-invalid={!!error}
          required={required}
          className={cn(controlClass(error), 'h-10 cursor-pointer appearance-none pl-3 pr-9', selectClassName)}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
      </div>
    </Field>
  );
});
Select.displayName = 'Select';
export default Select;

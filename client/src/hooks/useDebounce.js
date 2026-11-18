// Returns the value only after it stops changing for "delay" ms (used for search boxes).
import { useEffect, useState } from 'react';

export const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

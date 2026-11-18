// Reads and writes list filters in the URL (?status=pending&page=2). Changing a filter resets to page 1.
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  const setParam = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === '' || value == null) next.delete(key); else next.set(key, value);
      if (key !== 'page') next.delete('page');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearAll = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);
  return { params, setParam, clearAll };
};

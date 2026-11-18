// Filter bar for complaint lists: search, status, category, priority, sort (+ department / unassigned for admin).
// Values live in the URL (?status=pending) so filters survive refresh and can be shared.
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input, Select, Button } from '../ui/index.js';
import { STATUSES, CATEGORIES, PRIORITIES, SORTS, SEARCH_DEBOUNCE_MS } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { useDebounce } from '../../hooks/useDebounce.js';

const S = STRINGS.complaint;
const opts = (values, labels) => Object.values(values).map((v) => ({ value: v, label: labels[v] }));

const ComplaintFilters = ({ params, setParam, clearAll, isAdmin, departments = [] }) => {
  const [search, setSearch] = useState(params.search || '');
  const debounced = useDebounce(search, SEARCH_DEBOUNCE_MS);
  useEffect(() => { if (debounced !== (params.search || '')) setParam('search', debounced); }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setSearch(params.search || ''); }, [params.search]);

  const hasFilters = ['search', 'status', 'category', 'priority', 'department', 'unassigned'].some((k) => params[k]);

  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-12">
      <Input icon={Search} placeholder={S.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)}
        aria-label={STRINGS.common.search} className={isAdmin ? 'sm:col-span-2 lg:col-span-4' : 'sm:col-span-2 lg:col-span-5'} />
      <Select aria-label={S.fields.status} value={params.status || ''} onChange={(e) => setParam('status', e.target.value)}
        placeholder={S.allStatuses} options={opts(STATUSES, STRINGS.statuses)} className="lg:col-span-2" />
      <Select aria-label={S.fields.category} value={params.category || ''} onChange={(e) => setParam('category', e.target.value)}
        placeholder={S.allCategories} options={opts(CATEGORIES, STRINGS.categories)} className="lg:col-span-2" />
      {isAdmin ? (
        <Select aria-label={S.fields.department} value={params.department || ''} onChange={(e) => setParam('department', e.target.value)}
          placeholder={S.allDepartments} options={departments.map((d) => ({ value: d._id, label: d.name }))} className="lg:col-span-2" />
      ) : (
        <Select aria-label={S.fields.priority} value={params.priority || ''} onChange={(e) => setParam('priority', e.target.value)}
          placeholder={S.allPriorities} options={opts(PRIORITIES, STRINGS.priorities)} className="lg:col-span-1" />
      )}
      <Select aria-label={STRINGS.common.filter} value={params.sort || 'newest'} onChange={(e) => setParam('sort', e.target.value)}
        options={SORTS.map((s) => ({ value: s, label: STRINGS.sorts[s] }))} className={isAdmin ? 'lg:col-span-2' : 'lg:col-span-2'} />
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-12">
          <Select aria-label={S.fields.priority} value={params.priority || ''} onChange={(e) => setParam('priority', e.target.value)}
            placeholder={S.allPriorities} options={opts(PRIORITIES, STRINGS.priorities)} className="w-44" />
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={params.unassigned === 'true'} onChange={(e) => setParam('unassigned', e.target.checked ? 'true' : '')}
              className="h-4 w-4 rounded border-surface-strong text-primary focus:ring-primary/30" />
            {S.onlyUnassigned}
          </label>
          {hasFilters && <Button variant="ghost" size="sm" icon={X} onClick={clearAll} className="ml-auto">{STRINGS.common.clearFilters}</Button>}
        </div>
      )}
      {!isAdmin && hasFilters && (
        <div className="sm:col-span-2 lg:col-span-12"><Button variant="ghost" size="sm" icon={X} onClick={clearAll}>{STRINGS.common.clearFilters}</Button></div>
      )}
    </div>
  );
};
export default ComplaintFilters;

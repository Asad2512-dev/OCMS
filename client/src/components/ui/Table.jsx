// Data table. columns = [{ key, header, render?(row), className? }]. Shows skeleton while loading and an empty state.
import { cn } from '../../utils/cn.js';
import { SkeletonRows } from './Skeleton.jsx';
import EmptyState from './EmptyState.jsx';
import { STRINGS } from '../../config/strings.js';

const Table = ({ columns, rows = [], loading, rowKey = '_id', onRowClick, empty, className }) => {
  if (loading) return <SkeletonRows cols={Math.min(columns.length, 5)} />;
  if (!rows.length) return empty || <EmptyState title={STRINGS.table.empty} />;

  return (
    <div className={cn('scrollbar-thin relative overflow-x-auto', className)}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-surface-border bg-surface-muted/70">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn('whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted', c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-primary-soft/40 focus-visible:bg-primary-soft/40')}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn('px-5 py-3.5 align-middle text-ink-soft', c.className)}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Table;

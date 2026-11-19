// Data table. columns = [{ key, header, render?(row), className? }]. Shows skeleton while loading and an empty state.
import { cn } from '../../utils/cn.js';
import { SkeletonRows } from './Skeleton.jsx';
import EmptyState from './EmptyState.jsx';
import { STRINGS } from '../../config/strings.js';

const Table = ({ columns, rows = [], loading, rowKey = '_id', onRowClick, empty, className }) => {
  if (loading) return <SkeletonRows cols={Math.min(columns.length, 5)} />;
  if (!rows.length) return empty || <EmptyState title={STRINGS.table.empty} />;

  const clickable = (row) => onRowClick && {
    onClick: () => onRowClick(row),
    onKeyDown: (e) => e.key === 'Enter' && onRowClick(row),
    tabIndex: 0,
  };
  const [main, ...rest] = columns;

  return (
    <>
    {/* Phones: each row becomes a small card (first column on top, the rest as label: value). */}
    <ul className={cn('divide-y divide-surface-border md:hidden', className)}>
      {rows.map((row) => (
        <li key={row[rowKey]} {...clickable(row)}
          className={cn('space-y-2 px-4 py-4', onRowClick && 'cursor-pointer active:bg-primary-soft/40')}>
          <div className="min-w-0 text-sm text-ink">{main.render ? main.render(row) : row[main.key]}</div>
          <dl className="space-y-1.5">
            {rest.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-3 text-sm">
                {typeof c.header === 'string' ? <dt className="shrink-0 text-ink-muted">{c.header}</dt> : <dt className="sr-only">{c.header}</dt>}
                <dd className={cn('min-w-0 text-right text-ink-soft', typeof c.header !== 'string' && 'ml-auto')}>{c.render ? c.render(row) : row[c.key]}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
    <div className={cn('scrollbar-thin relative hidden overflow-x-auto md:block', className)}>
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
              {...clickable(row)}
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
    </>
  );
};
export default Table;

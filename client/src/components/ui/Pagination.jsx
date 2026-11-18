// Page navigation: "Showing 1–10 of 64" plus previous / page numbers / next.
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { STRINGS } from '../../config/strings.js';

// Page numbers with "…" gaps: 1 … 4 5 6 … 12
const pageList = (page, pages) => {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i && p - sorted[i - 1] > 1 ? ['gap' + p, p] : [p]));
};

const Pagination = ({ page, pages, total, limit, onChange, className }) => {
  if (!total) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const btn = 'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none';

  return (
    <nav className={cn('flex flex-col items-center justify-between gap-3 px-5 py-3 sm:flex-row', className)} aria-label={STRINGS.common.page(page, pages)}>
      <p className="text-sm text-ink-muted">{STRINGS.common.showing(from, to, total)}</p>
      <div className="flex items-center gap-1">
        <button type="button" className={cn(btn, 'text-ink-muted hover:bg-surface-subtle')} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label={STRINGS.common.previous}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageList(page, pages).map((p) => (typeof p === 'string'
          ? <span key={p} className="px-1 text-ink-faint">…</span>
          : (
            <button key={p} type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}
              className={cn(btn, p === page ? 'bg-primary text-ink-inverse shadow-soft' : 'text-ink-soft hover:bg-surface-subtle')}>
              {p}
            </button>
          )))}
        <button type="button" className={cn(btn, 'text-ink-muted hover:bg-surface-subtle')} disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label={STRINGS.common.next}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};
export default Pagination;

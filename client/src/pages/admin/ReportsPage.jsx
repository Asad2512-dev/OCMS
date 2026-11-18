// Reports: date range filter, summary, monthly + yearly tables, department performance, officer workload,
// CSV export and a print-friendly layout.
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Printer, CalendarRange, RotateCcw } from 'lucide-react';
import { Card, CardHeader, PageHeader, Button, Input, Table, StatCard, ErrorState, SkeletonStats, StarRating } from '../../components/ui/index.js';
import ChartCard from '../../components/charts/ChartCard.jsx';
import { TrendChart, DepartmentBar } from '../../components/charts/Charts.jsx';
import { FileText, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync.js';
import { analyticsApi, reportApi } from '../../services/endpoints.js';
import { STRINGS } from '../../config/strings.js';
import { formatHours, formatMonth, formatDate, today } from '../../utils/format.js';

const R = STRINGS.reports;
const C = R.columns;

const load = async (range) => {
  const [summary, departments, officers, trend, yearly] = await Promise.all([
    analyticsApi.summary(range), analyticsApi.departments(range), analyticsApi.officers(range), analyticsApi.trend(), analyticsApi.yearly(),
  ]);
  return { summary: summary.data, departments: departments.data, officers: officers.data, trend: trend.data, yearly: yearly.data };
};

const pct = (n) => `${n}%`;
const rating = (r) => (r == null ? STRINGS.common.none : <span className="inline-flex items-center gap-1.5"><StarRating value={r} size="sm" />{r}</span>);

const ReportsPage = () => {
  const [draft, setDraft] = useState({ from: '', to: '' });
  const [range, setRange] = useState({ from: '', to: '' });
  const [exporting, setExporting] = useState(false);
  const { data, loading, error, reload } = useAsync(() => load(range), [range.from, range.to]);
  const s = data?.summary;

  const exportCsv = async () => {
    setExporting(true);
    try { await reportApi.exportCsv(range); toast.success(R.exported); } catch (e) { toast.error(e.message); } finally { setExporting(false); }
  };

  return (
    <>
      <PageHeader title={R.title} subtitle={R.subtitle} actions={(
        <div className="no-print flex gap-2">
          <Button variant="outline" icon={Printer} onClick={() => window.print()}>{R.print}</Button>
          <Button icon={Download} loading={exporting} onClick={exportCsv}>{exporting ? R.exporting : R.exportCsv}</Button>
        </div>
      )} />

      <div className="mb-6 hidden print:block">
        <h1 className="text-xl font-semibold">{R.printTitle}</h1>
        <p className="text-sm">{R.period(range.from && formatDate(range.from), range.to && formatDate(range.to))} · {R.generatedOn(formatDate(new Date()))}</p>
      </div>

      <Card className="no-print mb-6">
        <form onSubmit={(e) => { e.preventDefault(); setRange(draft); }} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input type="date" label={R.from} value={draft.from} max={draft.to || today()} onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))} />
          <Input type="date" label={R.to} value={draft.to} min={draft.from} max={today()} onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))} />
          <Button type="submit" icon={CalendarRange}>{R.apply}</Button>
          {(range.from || range.to) && <Button variant="ghost" icon={RotateCcw} onClick={() => { setDraft({ from: '', to: '' }); setRange({ from: '', to: '' }); }}>{R.reset}</Button>}
          <p className="text-sm text-ink-muted sm:ml-auto sm:pb-2.5">{R.period(range.from && formatDate(range.from), range.to && formatDate(range.to))}</p>
        </form>
      </Card>

      {error ? <Card><ErrorState error={error} onRetry={reload} /></Card> : (
        <div className="space-y-6">
          {loading && !data ? <SkeletonStats /> : (
            <div className="print-break grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard icon={FileText} label={STRINGS.dashboard.stats.total} value={s.total} />
              <StatCard icon={CheckCircle2} label={STRINGS.dashboard.stats.resolved} value={s.resolved} tone="success" note={pct(s.resolutionRate)} index={1} />
              <StatCard icon={XCircle} label={STRINGS.dashboard.stats.rejected} value={s.rejected} tone="danger" index={2} />
              <StatCard icon={Timer} label={STRINGS.dashboard.stats.avgResolution} value={formatHours(s.avgResolutionHours)} tone="neutral" index={3} />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title={R.monthly} subtitle={STRINGS.dashboard.charts.trendSubtitle} loading={loading && !data} empty={!data?.trend?.some((t) => t.total)}>
              <TrendChart data={data?.trend} />
            </ChartCard>
            <ChartCard title={R.departmentPerformance} loading={loading && !data} empty={!data?.departments?.length}>
              <DepartmentBar data={data?.departments} />
            </ChartCard>
          </div>

          <Card padded={false} className="print-break overflow-hidden">
            <div className="p-5 pb-0 sm:p-6 sm:pb-0"><CardHeader title={R.departmentPerformance} /></div>
            <Table loading={loading && !data} rowKey="departmentId" rows={data?.departments || []} columns={[
              { key: 'department', header: C.department, render: (d) => <span className="font-medium text-ink">{d.department}</span> },
              { key: 'total', header: C.total }, { key: 'pending', header: C.pending }, { key: 'inProgress', header: C.inProgress },
              { key: 'resolved', header: C.resolved }, { key: 'rejected', header: C.rejected },
              { key: 'rate', header: C.rate, render: (d) => pct(d.resolutionRate) },
              { key: 'avg', header: C.avgHours, render: (d) => formatHours(d.avgResolutionHours) },
              { key: 'rating', header: C.rating, render: (d) => rating(d.avgRating) },
            ]} />
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card padded={false} className="print-break overflow-hidden">
              <div className="p-5 pb-0 sm:p-6 sm:pb-0"><CardHeader title={R.monthly} /></div>
              <Table loading={loading && !data} rowKey="label" rows={[...(data?.trend || [])].reverse()} columns={[
                { key: 'label', header: C.month, render: (m) => formatMonth(m.label) },
                { key: 'total', header: C.total }, { key: 'resolved', header: C.resolved }, { key: 'rejected', header: C.rejected },
                { key: 'rate', header: C.rate, render: (m) => pct(m.total ? Math.round((m.resolved / m.total) * 100) : 0) },
              ]} />
            </Card>
            <Card padded={false} className="print-break overflow-hidden">
              <div className="p-5 pb-0 sm:p-6 sm:pb-0"><CardHeader title={R.yearly} /></div>
              <Table loading={loading && !data} rowKey="year" rows={data?.yearly || []} columns={[
                { key: 'year', header: C.year, render: (y) => <span className="font-medium text-ink">{y.year}</span> },
                { key: 'total', header: C.total }, { key: 'resolved', header: C.resolved }, { key: 'rejected', header: C.rejected },
                { key: 'rate', header: C.rate, render: (y) => pct(y.resolutionRate) },
                { key: 'avg', header: C.avgHours, render: (y) => formatHours(y.avgResolutionHours) },
              ]} />
            </Card>
          </div>

          <Card padded={false} className="print-break overflow-hidden">
            <div className="p-5 pb-0 sm:p-6 sm:pb-0"><CardHeader title={R.officerWorkload} /></div>
            <Table loading={loading && !data} rowKey="officerId" rows={data?.officers || []} columns={[
              { key: 'name', header: C.officer, render: (o) => <span className="font-medium text-ink">{o.name}</span> },
              { key: 'department', header: C.department, render: (o) => o.department || STRINGS.common.none },
              { key: 'total', header: C.total }, { key: 'open', header: C.open },
              { key: 'urgentOpen', header: C.urgentOpen, render: (o) => <span className={o.urgentOpen ? 'font-semibold text-danger' : ''}>{o.urgentOpen}</span> },
              { key: 'resolved', header: C.resolved },
              { key: 'avg', header: C.avgHours, render: (o) => formatHours(o.avgResolutionHours) },
            ]} />
          </Card>
        </div>
      )}
    </>
  );
};
export default ReportsPage;

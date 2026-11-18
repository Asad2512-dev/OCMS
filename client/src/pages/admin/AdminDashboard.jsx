// Admin dashboard: KPI cards, charts (category donut, monthly trend, department performance, ratings)
// and the list of unassigned complaints waiting for review.
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, Loader, CheckCircle2, Inbox, Timer, Star, TrendingUp, ArrowRight, PartyPopper } from 'lucide-react';
import { Card, CardHeader, PageHeader, StatCard, Button, EmptyState, SkeletonStats, SkeletonRows, ErrorState, StatusBadge, PriorityBadge } from '../../components/ui/index.js';
import ChartCard from '../../components/charts/ChartCard.jsx';
import { CategoryDonut, TrendChart, DepartmentBar, RatingBar } from '../../components/charts/Charts.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { analyticsApi, complaintApi } from '../../services/endpoints.js';
import { ROUTES, STATUSES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { firstName, greetingKey, formatHours, timeAgo } from '../../utils/format.js';
import { submitterName } from '../../utils/complaint.js';

const D = STRINGS.dashboard;

const load = async () => {
  const [summary, departments, trend, unassigned] = await Promise.all([
    analyticsApi.summary().then((r) => r.data),
    analyticsApi.departments().then((r) => r.data),
    analyticsApi.trend().then((r) => r.data),
    complaintApi.list({ unassigned: 'true', status: STATUSES.PENDING, sort: 'oldest', limit: 6 }),
  ]);
  return { summary, departments, trend, unassigned };
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { version } = useNotifications();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(load, [version]);
  const s = data?.summary;
  const go = (q) => navigate(`${ROUTES.COMPLAINTS}${q ? `?${q}` : ''}`);

  const kpis = s && [
    { icon: FileText, label: D.stats.total, value: s.total, tone: 'primary', onClick: () => go() },
    { icon: Clock, label: D.stats.pending, value: s.pending, tone: 'warning', onClick: () => go('status=pending') },
    { icon: Loader, label: D.stats.inProgress, value: s.inProgress, tone: 'info', onClick: () => go('status=in_progress') },
    { icon: CheckCircle2, label: D.stats.resolved, value: s.resolved, tone: 'success', note: `${s.resolutionRate}%`, onClick: () => go('status=resolved') },
    { icon: Inbox, label: D.stats.unassigned, value: s.unassigned, tone: 'danger', onClick: () => go('unassigned=true') },
    { icon: Timer, label: D.stats.avgResolution, value: formatHours(s.avgResolutionHours), tone: 'neutral' },
    { icon: Star, label: D.stats.avgRating, value: s.avgRating ?? STRINGS.common.none, tone: 'warning', note: s.feedbackCount ? `${s.feedbackCount}` : undefined },
    { icon: TrendingUp, label: D.stats.resolutionRate, value: `${s.resolutionRate}%`, tone: 'success' },
  ];

  if (error) return <Card><ErrorState error={error} onRetry={reload} /></Card>;
  const ratingData = (data?.departments || []).filter((d) => d.avgRating != null);

  return (
    <>
      <PageHeader title={D.hello(D.greeting[greetingKey()], firstName(user.name))} subtitle={D.adminSubtitle} />
      {loading && !data ? <><SkeletonStats /><div className="mt-4"><SkeletonStats /></div></> : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{kpis.map((k, i) => <StatCard key={k.label} {...k} index={i} />)}</div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <ChartCard className="lg:col-span-3" title={D.charts.trend} subtitle={D.charts.trendSubtitle} loading={loading && !data} empty={!data?.trend?.some((t) => t.total)}>
          <TrendChart data={data?.trend} />
        </ChartCard>
        <ChartCard className="lg:col-span-2" title={D.charts.byCategory} loading={loading && !data} empty={!s?.total}>
          <CategoryDonut data={s?.byCategory} />
        </ChartCard>
        <ChartCard className="lg:col-span-3" title={D.charts.departmentPerformance} subtitle={D.charts.departmentSubtitle} loading={loading && !data} empty={!data?.departments?.length}>
          <DepartmentBar data={data?.departments} />
        </ChartCard>
        <ChartCard className="lg:col-span-2" title={D.charts.ratings} loading={loading && !data} empty={!ratingData.length}>
          <RatingBar data={ratingData} />
        </ChartCard>
      </div>

      <Card padded={false} className="mt-6 overflow-hidden">
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <CardHeader title={D.unassignedTitle} subtitle={D.unassignedText} icon={Inbox}
            action={<Button variant="ghost" size="sm" iconRight={ArrowRight} onClick={() => go('unassigned=true&status=pending')}>{STRINGS.common.viewAll}</Button>} />
        </div>
        {loading && !data ? <SkeletonRows rows={3} /> : data.unassigned.complaints.length ? (
          <ul className="divide-y divide-surface-border border-t border-surface-border">
            {data.unassigned.complaints.map((c) => (
              <li key={c._id}>
                <Link to={ROUTES.COMPLAINT(c._id)} className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-surface-muted sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{c.title}</p>
                    <p className="text-xs text-ink-muted"><span className="font-mono">{c.complaintId}</span> · {STRINGS.categories[c.category]} · {submitterName(c)} · {timeAgo(c.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2"><PriorityBadge priority={c.priority} /><StatusBadge status={c.status} /></div>
                  <span className="hidden text-sm font-medium text-primary sm:block">{STRINGS.complaint.reviewAssign}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <EmptyState icon={PartyPopper} title={D.noUnassigned} text={D.noUnassignedText} />}
      </Card>
    </>
  );
};
export default AdminDashboard;

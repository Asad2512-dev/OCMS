// Officer dashboard: my workload numbers and my open complaints (urgent first).
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, Loader, CheckCircle2, AlertTriangle, Timer, ArrowRight, PartyPopper } from 'lucide-react';
import { Card, CardHeader, PageHeader, StatCard, Button, EmptyState, SkeletonStats, ErrorState, Badge } from '../../components/ui/index.js';
import ComplaintCard from '../../components/complaints/ComplaintCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { analyticsApi, complaintApi } from '../../services/endpoints.js';
import { ROUTES, STATUSES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { firstName, greetingKey, formatHours } from '../../utils/format.js';

const D = STRINGS.dashboard;

const load = async () => {
  const [me, pending, progress] = await Promise.all([
    analyticsApi.me().then((r) => r.data),
    complaintApi.list({ status: STATUSES.PENDING, sort: 'priority', limit: 6 }),
    complaintApi.list({ status: STATUSES.IN_PROGRESS, sort: 'priority', limit: 6 }),
  ]);
  const queue = [...pending.complaints, ...progress.complaints]
    .sort((a, b) => (a.priority === b.priority ? new Date(a.createdAt) - new Date(b.createdAt) : a.priority === 'urgent' ? -1 : 1))
    .slice(0, 6);
  return { me, queue };
};

const OfficerDashboard = () => {
  const { user } = useAuth();
  const { version } = useNotifications();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(load, [version]);
  const m = data?.me;

  if (error) return <Card><ErrorState error={error} onRetry={reload} /></Card>;
  const stats = m && [
    { icon: ClipboardList, label: D.stats.assignedTotal, value: m.total, tone: 'primary', onClick: () => navigate(ROUTES.COMPLAINTS) },
    { icon: Clock, label: D.stats.pending, value: m.pending, tone: 'warning', onClick: () => navigate(`${ROUTES.COMPLAINTS}?status=pending`) },
    { icon: Loader, label: D.stats.inProgress, value: m.inProgress, tone: 'info', onClick: () => navigate(`${ROUTES.COMPLAINTS}?status=in_progress`) },
    { icon: CheckCircle2, label: D.stats.resolved, value: m.resolved, tone: 'success', onClick: () => navigate(`${ROUTES.COMPLAINTS}?status=resolved`) },
    { icon: AlertTriangle, label: D.stats.urgentOpen, value: m.urgentOpen, tone: 'danger', onClick: () => navigate(`${ROUTES.COMPLAINTS}?priority=urgent`) },
    { icon: Timer, label: D.stats.avgResolution, value: formatHours(m.avgResolutionHours), tone: 'neutral' },
  ];

  return (
    <>
      <PageHeader title={D.hello(D.greeting[greetingKey()], firstName(user.name))} subtitle={D.officerSubtitle}>
        {user.department?.name && <Badge tone="primary" className="mb-3">{user.department.name}</Badge>}
      </PageHeader>
      {loading && !data ? <SkeletonStats count={6} /> : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">{stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}</div>
      )}
      <Card className="mt-6">
        <CardHeader title={D.myQueue} action={<Link to={ROUTES.COMPLAINTS}><Button variant="ghost" size="sm" iconRight={ArrowRight}>{STRINGS.common.viewAll}</Button></Link>} />
        {loading && !data ? <SkeletonStats count={3} /> : data.queue.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.queue.map((c, i) => <ComplaintCard key={c._id} c={c} index={i} showSubmitter />)}</div>
        ) : <EmptyState icon={PartyPopper} title={D.noQueue} text={D.noQueueText} />}
      </Card>
    </>
  );
};
export default OfficerDashboard;

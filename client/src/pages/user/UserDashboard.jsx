// Student / teacher dashboard: greeting, status stat cards, recent complaints and latest alerts.
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, Loader, CheckCircle2, Plus, Bell, ArrowRight, Inbox } from 'lucide-react';
import { Card, CardHeader, PageHeader, StatCard, Button, EmptyState, SkeletonStats, SkeletonRows, ErrorState } from '../../components/ui/index.js';
import ComplaintCard from '../../components/complaints/ComplaintCard.jsx';
import { NotificationItem } from '../../components/layout/NotificationBell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { complaintApi } from '../../services/endpoints.js';
import { ROUTES, STATUSES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { firstName, greetingKey } from '../../utils/format.js';

const D = STRINGS.dashboard;

// Counts per status come from the list endpoint's pagination total (1 item per request).
const loadDashboard = async () => {
  const count = (status) => complaintApi.list({ status, limit: 1 }).then((r) => r.pagination.total);
  const [total, pending, inProgress, resolved, recent] = await Promise.all([
    count(), count(STATUSES.PENDING), count(STATUSES.IN_PROGRESS), count(STATUSES.RESOLVED),
    complaintApi.list({ limit: 4, sort: 'updated' }).then((r) => r.complaints),
  ]);
  return { total, pending, inProgress, resolved, recent };
};

const UserDashboard = () => {
  const { user } = useAuth();
  const { items, version, markRead } = useNotifications();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(loadDashboard, [version]);
  const go = (status) => navigate(status ? `${ROUTES.COMPLAINTS}?status=${status}` : ROUTES.COMPLAINTS);

  const stats = data && [
    { icon: FileText, label: D.stats.total, value: data.total, tone: 'primary', onClick: () => go() },
    { icon: Clock, label: D.stats.pending, value: data.pending, tone: 'warning', onClick: () => go(STATUSES.PENDING) },
    { icon: Loader, label: D.stats.inProgress, value: data.inProgress, tone: 'info', onClick: () => go(STATUSES.IN_PROGRESS) },
    { icon: CheckCircle2, label: D.stats.resolved, value: data.resolved, tone: 'success', onClick: () => go(STATUSES.RESOLVED) },
  ];

  return (
    <>
      <PageHeader
        title={D.hello(D.greeting[greetingKey()], firstName(user.name))}
        subtitle={D.userSubtitle}
        actions={<Link to={ROUTES.NEW_COMPLAINT}><Button icon={Plus} className="shadow-glow">{D.newComplaint}</Button></Link>}
      />
      {error ? <Card><ErrorState error={error} onRetry={reload} /></Card> : (
        <>
          {loading && !data ? <SkeletonStats /> : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}</div>
          )}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title={D.recentComplaints} action={<Link to={ROUTES.COMPLAINTS}><Button variant="ghost" size="sm" iconRight={ArrowRight}>{STRINGS.common.viewAll}</Button></Link>} />
              {loading && !data ? <SkeletonRows rows={3} cols={2} /> : data.recent.length ? (
                <div className="grid gap-4 sm:grid-cols-2">{data.recent.map((c, i) => <ComplaintCard key={c._id} c={c} index={i} />)}</div>
              ) : (
                <EmptyState icon={Inbox} title={D.noComplaints} text={D.noComplaintsText} action={D.newComplaint} actionIcon={Plus} onAction={() => navigate(ROUTES.NEW_COMPLAINT)} />
              )}
            </Card>
            <Card padded={false} className="overflow-hidden">
              <div className="p-5 pb-0 sm:p-6 sm:pb-0"><CardHeader title={D.latestAlerts} icon={Bell} /></div>
              {items.length ? (
                <div className="divide-y divide-surface-border border-t border-surface-border">
                  {items.slice(0, 5).map((n) => (
                    <NotificationItem key={n._id} n={n} onClick={async () => { if (!n.isRead) await markRead(n._id); if (n.complaint?._id) navigate(ROUTES.COMPLAINT(n.complaint._id)); }} />
                  ))}
                </div>
              ) : <EmptyState icon={Bell} title={D.noAlerts} className="py-10" />}
            </Card>
          </div>
        </>
      )}
    </>
  );
};
export default UserDashboard;

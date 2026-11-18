// Full notification list with "unread only" filter, mark-as-read and pagination.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCheck, BellOff } from 'lucide-react';
import { Card, PageHeader, Button, Pagination, EmptyState, ErrorState, SkeletonRows, Toggle } from '../../components/ui/index.js';
import { NotificationItem } from '../../components/layout/NotificationBell.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { notificationApi } from '../../services/endpoints.js';
import { ROUTES, PAGE_SIZE } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const N = STRINGS.notifications;

const Notifications = () => {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { unread, version, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(
    () => notificationApi.list({ page, limit: PAGE_SIZE, unread: unreadOnly ? 'true' : '' }),
    [page, unreadOnly, version]
  );

  const open = async (n) => {
    if (!n.isRead) await markRead(n._id);
    if (n.complaint?._id) navigate(ROUTES.COMPLAINT(n.complaint._id)); else reload();
  };
  const readAll = async () => { await markAllRead(); toast.success(N.allRead); reload(); };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={N.title} subtitle={N.subtitle} actions={unread > 0 && <Button variant="outline" icon={CheckCheck} onClick={readAll}>{N.markAllRead}</Button>} />
      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-surface-border px-5 py-3">
          <Toggle checked={unreadOnly} onChange={(v) => { setUnreadOnly(v); setPage(1); }} label={N.unreadOnly} />
        </div>
        {error ? <ErrorState error={error} onRetry={reload} /> : loading && !data ? <SkeletonRows cols={2} /> : !data?.notifications.length ? (
          <EmptyState icon={BellOff} title={N.empty} text={N.emptyText} />
        ) : (
          <div className="divide-y divide-surface-border">
            {data.notifications.map((n) => <NotificationItem key={n._id} n={n} onClick={() => open(n)} />)}
          </div>
        )}
        {data?.pagination?.pages > 1 && <div className="border-t border-surface-border"><Pagination {...data.pagination} onChange={setPage} /></div>}
      </Card>
    </div>
  );
};
export default Notifications;

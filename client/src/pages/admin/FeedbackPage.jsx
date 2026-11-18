// Admin list of all feedback with a rating filter, summary numbers and pagination.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare } from 'lucide-react';
import { Card, PageHeader, Select, Table, Pagination, StarRating, Avatar, EmptyState, ErrorState, StatCard } from '../../components/ui/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { feedbackApi, analyticsApi } from '../../services/endpoints.js';
import { ROUTES, PAGE_SIZE, RATING_MAX } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { formatDate } from '../../utils/format.js';

const F = STRINGS.feedback;
const userName = (f) => f.userName || f.user?.name || STRINGS.complaint.anonymous;

const FeedbackPage = () => {
  const [rating, setRating] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAsync(() => feedbackApi.list({ rating, page, limit: PAGE_SIZE }), [rating, page]);
  const { data: summary } = useAsync(() => analyticsApi.summary().then((r) => r.data), []);

  const columns = [
    {
      key: 'complaint', header: F.columns.complaint, className: 'min-w-[14rem]',
      render: (f) => f.complaint && (
        <Link to={ROUTES.COMPLAINT(f.complaint._id)} className="block hover:text-primary">
          <span className="block truncate font-medium text-ink">{f.complaint.title}</span>
          <span className="font-mono text-xs text-ink-faint">{f.complaint.complaintId}</span>
        </Link>
      ),
    },
    { key: 'user', header: F.columns.user, render: (f) => <span className="flex items-center gap-2"><Avatar name={userName(f)} size="xs" anonymous={!f.user} />{userName(f)}</span> },
    { key: 'department', header: F.columns.department, render: (f) => f.complaint?.department?.name || STRINGS.common.none },
    { key: 'rating', header: F.columns.rating, render: (f) => <StarRating value={f.rating} size="sm" /> },
    { key: 'comment', header: F.columns.comment, className: 'max-w-xs', render: (f) => (f.comment ? <span className="line-clamp-2">{f.comment}</span> : <span className="text-ink-faint">{F.noComment}</span>) },
    { key: 'date', header: F.columns.date, className: 'whitespace-nowrap', render: (f) => formatDate(f.createdAt) },
  ];

  return (
    <>
      <PageHeader title={F.title} subtitle={F.subtitle} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Star} tone="warning" label={F.average} value={summary?.avgRating ?? STRINGS.common.none} />
        <StatCard icon={MessageSquare} label={F.total} value={summary?.feedbackCount ?? STRINGS.common.none} index={1} />
      </div>
      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-surface-border p-4">
          <Select className="sm:w-56" aria-label={F.columns.rating} value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }} placeholder={F.allRatings}
            options={Array.from({ length: RATING_MAX }, (_, i) => RATING_MAX - i).map((n) => ({ value: String(n), label: F.stars(n) }))} />
        </div>
        {error ? <ErrorState error={error} onRetry={reload} /> : (
          <Table columns={columns} rows={data?.feedback || []} loading={loading && !data} empty={<EmptyState icon={Star} title={F.empty} text={F.emptyText} />} />
        )}
        {data?.pagination?.pages > 0 && <div className="border-t border-surface-border"><Pagination {...data.pagination} onChange={setPage} /></div>}
      </Card>
    </>
  );
};
export default FeedbackPage;

// Complaint list as a table (desktop) or cards. Columns adapt to the role.
import { useNavigate } from 'react-router-dom';
import { Paperclip } from 'lucide-react';
import { Table, StatusBadge, PriorityBadge, Avatar, SkeletonRows } from '../ui/index.js';
import ComplaintCard from './ComplaintCard.jsx';
import { ROUTES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { formatDate } from '../../utils/format.js';
import { submitterName } from '../../utils/complaint.js';

const F = STRINGS.complaint.fields;

const buildColumns = (showSubmitter) => [
  {
    key: 'title', header: F.title, className: 'min-w-[16rem]',
    render: (c) => (
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 font-medium text-ink">
          <span className="truncate">{c.title}</span>
          {c.attachments?.length > 0 && <Paperclip className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-label={F.attachments} />}
        </p>
        <p className="font-mono text-xs text-ink-faint">{c.complaintId}</p>
      </div>
    ),
  },
  showSubmitter && {
    key: 'submittedBy', header: F.submittedBy,
    render: (c) => (
      <span className="flex items-center gap-2">
        <Avatar name={submitterName(c)} size="xs" anonymous={c.isAnonymous && !c.submittedBy} />
        <span className="truncate">{submitterName(c)}</span>
      </span>
    ),
  },
  { key: 'category', header: F.category, render: (c) => STRINGS.categories[c.category] },
  { key: 'department', header: F.department, render: (c) => c.department?.name || <span className="text-ink-faint">{STRINGS.common.unassigned}</span> },
  { key: 'priority', header: F.priority, render: (c) => <PriorityBadge priority={c.priority} /> },
  { key: 'status', header: F.status, render: (c) => <StatusBadge status={c.status} /> },
  { key: 'createdAt', header: F.submittedOn, className: 'whitespace-nowrap', render: (c) => formatDate(c.createdAt) },
].filter(Boolean);

const ComplaintTable = ({ complaints, loading, view = 'table', showSubmitter, empty }) => {
  const navigate = useNavigate();
  if (view === 'cards' && !loading) {
    if (!complaints.length) return empty;
    return (
      <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {complaints.map((c, i) => <ComplaintCard key={c._id} c={c} index={i} showSubmitter={showSubmitter} />)}
      </div>
    );
  }
  // On phones the table becomes cards, so nothing scrolls sideways.
  return (
    <>
      <div className="hidden md:block">
        <Table columns={buildColumns(showSubmitter)} rows={complaints} loading={loading} empty={empty}
          onRowClick={(c) => navigate(ROUTES.COMPLAINT(c._id))} />
      </div>
      <div className="md:hidden">
        {loading ? <SkeletonRows rows={4} cols={2} /> : !complaints.length ? empty : (
          <div className="grid gap-3 p-4">{complaints.map((c, i) => <ComplaintCard key={c._id} c={c} index={i} showSubmitter={showSubmitter} />)}</div>
        )}
      </div>
    </>
  );
};
export default ComplaintTable;

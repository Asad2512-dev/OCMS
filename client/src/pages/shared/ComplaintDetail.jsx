// One complaint: header, description, attachments, timeline, details sidebar and role-based actions
// (admin: assign / reject / remark · officer: status + remarks · owner: feedback after resolved).
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, UserCheck, XCircle, Info, EyeOff, Paperclip, History, FileQuestion, Lock } from 'lucide-react';
import {
  Card, CardHeader, Button, StatusBadge, PriorityBadge, AnonymousBadge, Avatar, ConfirmDialog, EmptyState, SkeletonCard, Skeleton,
} from '../../components/ui/index.js';
import Timeline from '../../components/complaints/Timeline.jsx';
import AttachmentList from '../../components/complaints/AttachmentList.jsx';
import AssignDrawer from '../../components/complaints/AssignDrawer.jsx';
import FeedbackSection from '../../components/complaints/FeedbackSection.jsx';
import OfficerActions from '../../components/complaints/OfficerActions.jsx';
import RemarkForm from '../../components/complaints/RemarkForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { complaintApi } from '../../services/endpoints.js';
import { ROLES, ROUTES, CLOSED_STATUSES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { formatDateTime } from '../../utils/format.js';
import { submitterName } from '../../utils/complaint.js';

const S = STRINGS.complaint;
const F = S.fields;

const DetailRow = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <dt className="text-sm text-ink-muted">{label}</dt>
    <dd className="text-right text-sm font-medium text-ink">{children}</dd>
  </div>
);

const Person = ({ name, sub, anonymous }) => (
  <span className="inline-flex items-center gap-2">
    <Avatar name={name} size="xs" anonymous={anonymous} />
    <span className="text-left">
      <span className="block">{name}</span>
      {sub && <span className="block text-xs font-normal text-ink-muted">{sub}</span>}
    </span>
  </span>
);

const LoadingView = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-2/3" />
    <div className="grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><SkeletonCard /><SkeletonCard /></div><SkeletonCard /></div>
  </div>
);

const AdminActions = ({ c, onAssign, onReject, onChange }) => {
  if (CLOSED_STATUSES.includes(c.status)) {
    return <Card><p className="flex items-center gap-2 text-sm text-ink-muted"><Lock className="h-4 w-4" />{S.closedNotice}</p></Card>;
  }
  return (
    <Card>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Button icon={UserCheck} onClick={onAssign}>{c.assignedTo ? S.reassign : S.reviewAssign}</Button>
        <Button variant="danger-ghost" icon={XCircle} onClick={onReject}>{S.reject}</Button>
      </div>
      <div className="my-5 h-px bg-surface-border" />
      <RemarkForm complaintId={c._id} onAdded={onChange} />
    </Card>
  );
};

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { version } = useNotifications();
  const navigate = useNavigate();
  const { data, loading, error, setData } = useAsync(() => complaintApi.get(id).then((r) => r.complaint), [id, version]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  if (loading && !data) return <LoadingView />;
  if (error) {
    return <Card><EmptyState icon={FileQuestion} title={S.notFound} text={S.notFoundText} action={STRINGS.common.back} onAction={() => navigate(ROUTES.COMPLAINTS)} /></Card>;
  }
  const c = data;
  const isAdmin = user.role === ROLES.ADMIN;
  const isOfficer = user.role === ROLES.OFFICER;
  const hidden = c.isAnonymous && !c.submittedBy;

  const reject = async (reason) => {
    setRejecting(true);
    try {
      const r = await complaintApi.reject(c._id, reason);
      setData(r.complaint); setRejectOpen(false);
      toast.success(S.rejected);
    } catch (e) { toast.error(e.message); } finally { setRejecting(false); }
  };

  return (
    <>
      <Link to={ROUTES.COMPLAINTS} className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" />{STRINGS.common.back}
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-surface px-2 py-1 font-mono text-xs font-medium text-ink-muted ring-1 ring-surface-border">{c.complaintId}</span>
          <StatusBadge status={c.status} />
          <PriorityBadge priority={c.priority} />
          {c.isAnonymous && <AnonymousBadge />}
        </div>
        <h1 className="page-title">{c.title}</h1>
        <p className="text-sm text-ink-muted">{F.submittedOn}: {formatDateTime(c.createdAt)}</p>
      </div>

      {c.isOwner && c.isAnonymous && (
        <div className="mb-6 flex items-start gap-3 rounded-card border border-primary-muted bg-primary-soft px-4 py-3 text-sm text-primary">
          <EyeOff className="mt-0.5 h-4 w-4 shrink-0" />{S.anonymousNotice}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title={F.description} icon={Info} />
            <p className="whitespace-pre-line leading-relaxed text-ink-soft">{c.description}</p>
          </Card>
          <Card>
            <CardHeader title={F.attachments} icon={Paperclip} subtitle={c.attachments?.length ? String(c.attachments.length) : undefined} />
            <AttachmentList attachments={c.attachments} />
          </Card>
          <Card>
            <CardHeader title={S.timeline} icon={History} />
            <Timeline complaint={c} />
          </Card>
          {c.isOwner && <FeedbackSection complaint={c} />}
          {!c.isOwner && (isAdmin || isOfficer) && <FeedbackSection complaint={c} />}
        </div>

        <div className="space-y-6">
          {isAdmin && <AdminActions c={c} onAssign={() => setAssignOpen(true)} onReject={() => setRejectOpen(true)} onChange={setData} />}
          {isOfficer && <OfficerActions complaint={c} onChange={setData} />}
          {c.isOwner && !c.assignedTo && c.status === 'pending' && (
            <div className="rounded-card border border-warning-border bg-warning-soft px-4 py-3 text-sm text-warning">{S.notAssignedNotice}</div>
          )}

          <Card>
            <CardHeader title={S.details} />
            <dl className="-my-3 divide-y divide-surface-border">
              {!c.isOwner && (
                <DetailRow label={F.submittedBy}>
                  <Person name={submitterName(c)} anonymous={hidden} sub={!hidden ? STRINGS.roles[c.submittedBy?.role] : undefined} />
                </DetailRow>
              )}
              <DetailRow label={F.category}>{STRINGS.categories[c.category]}</DetailRow>
              <DetailRow label={F.department}>{c.department?.name || <span className="text-ink-faint">{STRINGS.common.unassigned}</span>}</DetailRow>
              <DetailRow label={F.assignedTo}>{c.assignedTo ? <Person name={c.assignedTo.name} /> : <span className="text-ink-faint">{STRINGS.common.unassigned}</span>}</DetailRow>
              <DetailRow label={F.priority}><PriorityBadge priority={c.priority} /></DetailRow>
              <DetailRow label={F.status}><StatusBadge status={c.status} /></DetailRow>
              <DetailRow label={F.updatedOn}>{formatDateTime(c.updatedAt)}</DetailRow>
            </dl>
          </Card>
        </div>
      </div>

      {isAdmin && (
        <>
          <AssignDrawer open={assignOpen} onClose={() => setAssignOpen(false)} complaint={c} onAssigned={setData} />
          <ConfirmDialog open={rejectOpen} onClose={() => setRejectOpen(false)} onConfirm={reject} loading={rejecting}
            title={S.rejectTitle} text={S.rejectText} confirmLabel={S.reject}
            requireReason reasonLabel={S.reasonLabel} reasonPlaceholder={S.reasonPlaceholder} reasonError={S.reasonRequired} />
        </>
      )}
    </>
  );
};
export default ComplaintDetail;

// Complaint list for every role: students/teachers see their own, officers their assigned, admin all.
// Filters, search and page are kept in the URL. Admin rows open the assign drawer from the detail page.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LayoutList, LayoutGrid, FileSearch } from 'lucide-react';
import { Card, PageHeader, Button, Pagination, SegmentedControl, EmptyState, ErrorState } from '../../components/ui/index.js';
import ComplaintFilters from '../../components/complaints/ComplaintFilters.jsx';
import ComplaintTable from '../../components/complaints/ComplaintTable.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useQueryParams } from '../../hooks/useQueryParams.js';
import { complaintApi, departmentApi } from '../../services/endpoints.js';
import { ROLES, ROUTES, PAGE_SIZE, COMPLAINANT_ROLES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const S = STRINGS.complaint;
const VIEW_KEY = 'univoice.complaints.view';
const readView = () => { try { return localStorage.getItem(VIEW_KEY) || 'table'; } catch { return 'table'; } };

const HEADINGS = {
  admin: [S.allTitle, S.allSubtitle],
  officer: [S.assignedTitle, S.assignedSubtitle],
  default: [S.myTitle, S.mySubtitle],
};

const ComplaintList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { version } = useNotifications();
  const { params, setParam, clearAll } = useQueryParams();
  const [view, setView] = useState(readView);
  const [departments, setDepartments] = useState([]);
  const isAdmin = user.role === ROLES.ADMIN;
  const isComplainant = COMPLAINANT_ROLES.includes(user.role);
  const page = Number(params.page) || 1;

  useEffect(() => { if (isAdmin) departmentApi.list().then((r) => setDepartments(r.departments)).catch(() => {}); }, [isAdmin]);
  useEffect(() => { try { localStorage.setItem(VIEW_KEY, view); } catch { /* ignore */ } }, [view]);

  const { data, loading, error, reload } = useAsync(
    () => complaintApi.list({ ...params, page, limit: PAGE_SIZE }),
    [JSON.stringify(params), version]
  );

  const [title, subtitle] = HEADINGS[user.role] || HEADINGS.default;
  const hasFilters = Object.keys(params).some((k) => k !== 'page' && k !== 'sort');
  const emptyAction = hasFilters
    ? { action: STRINGS.common.clearFilters, onAction: clearAll }
    : isComplainant ? { action: S.newTitle, onAction: () => navigate(ROUTES.NEW_COMPLAINT), actionIcon: Plus } : {};
  const empty = (
    <EmptyState icon={FileSearch} title={S.emptyTitle} text={!hasFilters && isComplainant ? S.emptyMineText : S.emptyText} {...emptyAction} />
  );

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={(
        <>
          <SegmentedControl value={view} onChange={setView} options={[
            { value: 'table', label: STRINGS.common.tableView, icon: LayoutList },
            { value: 'cards', label: STRINGS.common.cardView, icon: LayoutGrid },
          ]} />
          {isComplainant && <Link to={ROUTES.NEW_COMPLAINT}><Button icon={Plus}>{S.newTitle}</Button></Link>}
        </>
      )} />
      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-surface-border">
          <ComplaintFilters params={params} setParam={setParam} clearAll={clearAll} isAdmin={isAdmin} departments={departments} />
        </div>
        {error ? <ErrorState error={error} onRetry={reload} /> : (
          <ComplaintTable complaints={data?.complaints || []} loading={loading && !data} view={view} showSubmitter={!isComplainant} empty={empty} />
        )}
        {data?.pagination?.pages > 0 && (
          <div className="border-t border-surface-border">
            <Pagination {...data.pagination} onChange={(p) => setParam('page', String(p))} />
          </div>
        )}
      </Card>
    </>
  );
};
export default ComplaintList;

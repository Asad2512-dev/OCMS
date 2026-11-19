// Admin user management: list with search/role/status filters, create & edit modal, activate/deactivate, reset password.
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, KeyRound, UserX, UserCheck, Users } from 'lucide-react';
import {
  Card, PageHeader, Button, Input, Select, Table, Pagination, Badge, Avatar, Modal, ConfirmDialog, EmptyState, ErrorState,
} from '../../components/ui/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { userApi, departmentApi } from '../../services/endpoints.js';
import { ROLES, PAGE_SIZE, LIMITS, SEARCH_DEBOUNCE_MS } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { formatDate } from '../../utils/format.js';

const U = STRINGS.users;
const roleOptions = Object.values(ROLES).map((r) => ({ value: r, label: STRINGS.roles[r] }));
const EMPTY = { name: '', email: '', password: '', role: ROLES.STUDENT, department: '', rollNo: '', employeeId: '' };

// Turns server field errors into { field: message }.
const fieldErrors = (err) => Object.fromEntries((err.errors || []).map((e) => [e.field, e.message]));

const UserForm = ({ open, onClose, user, departments, onSaved }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const editing = !!user;

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(user ? { ...EMPTY, ...user, department: user.department?._id || '', password: '' } : EMPTY);
  }, [open, user]);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { password, ...rest } = form;
    const body = { name: rest.name, email: rest.email, role: rest.role, department: rest.department || undefined, rollNo: rest.rollNo, employeeId: rest.employeeId };
    try {
      if (editing) await userApi.update(user.id, body); else await userApi.create({ ...body, password });
      toast.success(editing ? U.updated : U.created);
      onSaved(); onClose();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? U.edit : U.add} size="lg"
      footer={<><Button variant="outline" onClick={onClose}>{STRINGS.common.cancel}</Button><Button type="submit" form="user-form" loading={saving}>{STRINGS.common.save}</Button></>}>
      <form id="user-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label={U.name} required value={form.name} onChange={set('name')} error={errors.name} />
        <Input label={U.email} type="email" required value={form.email} onChange={set('email')} error={errors.email} />
        <Select label={U.role} required value={form.role} onChange={set('role')} options={roleOptions} error={errors.role} />
        {form.role === ROLES.OFFICER && (
          <Select label={U.department} required value={form.department} onChange={set('department')} placeholder={STRINGS.complaint.chooseDepartment}
            options={departments.map((d) => ({ value: d._id, label: d.name }))} error={errors.department} />
        )}
        {form.role === ROLES.STUDENT
          ? <Input label={U.rollNo} required value={form.rollNo || ''} onChange={set('rollNo')} error={errors.rollNo} />
          : <Input label={U.employeeId} required value={form.employeeId || ''} onChange={set('employeeId')} error={errors.employeeId} />}
        {!editing && (
          <Input className="sm:col-span-2" label={U.password} type="password" required minLength={LIMITS.PASSWORD_MIN} hint={U.passwordHint}
            value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" />
        )}
      </form>
    </Modal>
  );
};

const ResetPassword = ({ user, onClose }) => {
  const [pw, setPw] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => setPw(''), [user]);
  const submit = async () => {
    setSaving(true);
    try { await userApi.resetPassword(user.id, pw); toast.success(U.resetDone); onClose(); } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  return (
    <Modal open={!!user} onClose={onClose} size="sm" title={U.resetTitle} subtitle={user && U.resetText(user.name)}
      footer={<><Button variant="outline" onClick={onClose}>{STRINGS.common.cancel}</Button><Button loading={saving} disabled={pw.length < LIMITS.PASSWORD_MIN} onClick={submit}>{U.resetPassword}</Button></>}>
      <Input label={U.newPassword} type="password" value={pw} onChange={(e) => setPw(e.target.value)} hint={U.passwordHint} autoComplete="new-password" />
    </Modal>
  );
};

const UsersPage = () => {
  const { user: me } = useAuth();
  const [filters, setFilters] = useState({ search: '', role: '', isActive: '', page: 1 });
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new
  const [resetting, setResetting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [busy, setBusy] = useState(false);
  const search = useDebounce(filters.search, SEARCH_DEBOUNCE_MS);

  useEffect(() => { departmentApi.list().then((r) => setDepartments(r.departments)).catch(() => {}); }, []);
  const { data, loading, error, reload } = useAsync(
    () => userApi.list({ search, role: filters.role, isActive: filters.isActive, page: filters.page, limit: PAGE_SIZE }),
    [search, filters.role, filters.isActive, filters.page]
  );
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value, page: 1 }));

  const toggleActive = async () => {
    setBusy(true);
    try {
      await userApi.setStatus(toggling.id, !toggling.isActive);
      toast.success(toggling.isActive ? U.deactivated : U.activated);
      setToggling(null); reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const columns = [
    {
      key: 'name', header: U.columns.user, className: 'min-w-[14rem]',
      render: (u) => (
        <span className="flex items-center gap-3">
          <Avatar name={u.name} size="sm" />
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{u.name}{u.id === me.id && <Badge tone="primary" className="ml-2">{U.you}</Badge>}</span>
            <span className="block truncate text-xs text-ink-muted">{u.email}</span>
          </span>
        </span>
      ),
    },
    { key: 'role', header: U.columns.role, render: (u) => <Badge tone={u.role === ROLES.ADMIN ? 'primary' : 'neutral'}>{STRINGS.roles[u.role]}</Badge> },
    { key: 'department', header: U.columns.department, render: (u) => u.department?.name || <span className="text-ink-faint">{STRINGS.common.none}</span> },
    { key: 'idNo', header: U.columns.idNo, render: (u) => <span className="font-mono text-xs">{u.rollNo || u.employeeId || STRINGS.common.none}</span> },
    { key: 'status', header: U.columns.status, render: (u) => <Badge tone={u.isActive ? 'success' : 'neutral'} dot={u.isActive ? 'bg-success' : 'bg-ink-faint'}>{u.isActive ? STRINGS.common.active : STRINGS.common.inactive}</Badge> },
    { key: 'joined', header: U.columns.joined, className: 'hidden whitespace-nowrap 2xl:table-cell', render: (u) => formatDate(u.createdAt) },
    {
      key: 'actions', header: <span className="sr-only">{STRINGS.common.actions}</span>, className: 'text-right',
      render: (u) => (
        <span className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" aria-label={U.edit} title={U.edit} onClick={() => setEditing(u)}><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" aria-label={U.resetPassword} title={U.resetPassword} onClick={() => setResetting(u)}><KeyRound className="h-4 w-4" /></Button>
          {u.id !== me.id && (
            <Button size="icon" variant="ghost" aria-label={u.isActive ? U.deactivate : U.activate} title={u.isActive ? U.deactivate : U.activate}
              className={u.isActive ? 'hover:text-danger' : 'hover:text-success'} onClick={() => (u.isActive ? setToggling(u) : setToggling(u))}>
              {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </Button>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={U.title} subtitle={U.subtitle} actions={<Button icon={Plus} onClick={() => setEditing(null)}>{U.add}</Button>} />
      <Card padded={false} className="overflow-hidden">
        <div className="grid gap-3 border-b border-surface-border p-4 sm:grid-cols-4">
          <Input className="sm:col-span-2" icon={Search} placeholder={U.searchPlaceholder} value={filters.search} onChange={set('search')} aria-label={STRINGS.common.search} />
          <Select aria-label={U.role} value={filters.role} onChange={set('role')} placeholder={U.allRoles} options={roleOptions} />
          <Select aria-label={U.columns.status} value={filters.isActive} onChange={set('isActive')} placeholder={U.allStatus}
            options={[{ value: 'true', label: STRINGS.common.active }, { value: 'false', label: STRINGS.common.inactive }]} />
        </div>
        {error ? <ErrorState error={error} onRetry={reload} /> : (
          <Table columns={columns} rows={data?.users || []} rowKey="id" loading={loading && !data}
            empty={<EmptyState icon={Users} title={U.empty} text={U.emptyText} />} />
        )}
        {data?.pagination?.pages > 0 && <div className="border-t border-surface-border"><Pagination {...data.pagination} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} /></div>}
      </Card>

      <UserForm open={editing !== undefined} onClose={() => setEditing(undefined)} user={editing} departments={departments} onSaved={reload} />
      <ResetPassword user={resetting} onClose={() => setResetting(null)} />
      <ConfirmDialog open={!!toggling} onClose={() => setToggling(null)} onConfirm={toggleActive} loading={busy}
        tone={toggling?.isActive ? 'danger' : 'primary'}
        title={toggling?.isActive ? U.deactivateTitle : U.activate} text={toggling?.isActive ? U.deactivateText : toggling?.name}
        confirmLabel={toggling?.isActive ? U.deactivate : U.activate} />
    </>
  );
};
export default UsersPage;

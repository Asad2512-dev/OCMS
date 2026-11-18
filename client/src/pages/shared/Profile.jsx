// Profile page: account details and change password form.
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, User, Lock } from 'lucide-react';
import { Card, CardHeader, PageHeader, Avatar, Badge, Input, Button } from '../../components/ui/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { authApi } from '../../services/endpoints.js';
import { LIMITS, ROLES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { formatDate } from '../../utils/format.js';

const P = STRINGS.profile;
const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

const validate = (f) => {
  const e = {};
  if (!f.currentPassword) e.currentPassword = P.errors.current;
  if (f.newPassword.length < LIMITS.PASSWORD_MIN) e.newPassword = P.errors.short;
  if (f.confirmPassword !== f.newPassword) e.confirmPassword = P.errors.match;
  return e;
};

const Row = ({ label, value }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm text-ink-muted">{label}</dt>
    <dd className="mt-1 text-sm font-medium text-ink sm:col-span-2 sm:mt-0">{value || STRINGS.common.none}</dd>
  </div>
);

const Profile = () => {
  const { user } = useAuth();
  const { hash } = useLocation();
  const passwordRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (hash === '#password') passwordRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [hash]);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };
  const submit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      await authApi.changePassword(form);
      toast.success(P.updated);
      setForm(EMPTY);
    } catch (err) {
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={P.title} subtitle={P.subtitle} />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user.name} size="xl" />
            <h2 className="mt-4 text-lg font-semibold text-ink">{user.name}</h2>
            <p className="text-sm text-ink-muted">{user.email}</p>
            <Badge tone="primary" className="mt-3">{STRINGS.roles[user.role]}</Badge>
          </div>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader icon={User} title={P.details} subtitle={P.contactAdmin} />
          <dl className="-my-3 divide-y divide-surface-border">
            <Row label={P.name} value={user.name} />
            <Row label={P.email} value={user.email} />
            <Row label={P.role} value={STRINGS.roles[user.role]} />
            {user.role === ROLES.OFFICER && <Row label={P.department} value={user.department?.name} />}
            {user.role === ROLES.STUDENT ? <Row label={P.rollNo} value={user.rollNo} /> : <Row label={P.employeeId} value={user.employeeId} />}
            <Row label={P.memberSince} value={formatDate(user.createdAt)} />
          </dl>
        </Card>
        <Card className="lg:col-span-5" id="password">
          <div ref={passwordRef} className="scroll-mt-24" />
          <CardHeader icon={KeyRound} title={P.changePassword} subtitle={P.changePasswordText} />
          <form onSubmit={submit} noValidate className="grid gap-4 md:grid-cols-3">
            <Input type="password" icon={Lock} label={P.currentPassword} autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} error={errors.currentPassword} />
            <Input type="password" icon={Lock} label={P.newPassword} autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} error={errors.newPassword} />
            <Input type="password" icon={Lock} label={P.confirmPassword} autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
            <div className="md:col-span-3"><Button type="submit" loading={saving}>{P.update}</Button></div>
          </form>
        </Card>
      </div>
    </div>
  );
};
export default Profile;

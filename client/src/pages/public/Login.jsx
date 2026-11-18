// Login page: brand panel on the left, form on the right, show/hide password, demo quick-login buttons.
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, Wrench, GraduationCap, BookOpen, Megaphone } from 'lucide-react';
import Logo from '../../components/layout/Logo.jsx';
import { Button, Input } from '../../components/ui/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES, SHOW_DEMO, DEMO_ACCOUNTS, DEMO_PASSWORD } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { firstName } from '../../utils/format.js';

const A = STRINGS.auth;
const DEMO_ICONS = { admin: ShieldCheck, officer: Wrench, student: GraduationCap, teacher: BookOpen };

const validate = ({ email, password }) => {
  const e = {};
  if (!email.trim()) e.email = A.errors.emailRequired;
  else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = A.errors.emailInvalid;
  if (!password) e.password = A.errors.passwordRequired;
  return e;
};

const BrandPanel = () => (
  <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-accent p-12 text-ink-inverse lg:flex lg:flex-col">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,theme(colors.surface.DEFAULT/15%),transparent_40%),radial-gradient(circle_at_80%_80%,theme(colors.surface.DEFAULT/10%),transparent_40%)]" />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,theme(colors.surface.DEFAULT/6%)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.surface.DEFAULT/6%)_1px,transparent_1px)] bg-[size:40px_40px]" />
    <Link to={ROUTES.HOME} className="relative"><Logo light /></Link>
    <div className="relative my-auto">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}
        className="mb-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface/15 ring-1 ring-surface/25 backdrop-blur">
        <Megaphone className="h-10 w-10" />
      </motion.div>
      <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">{A.brandTitle}</h2>
      <p className="mt-4 max-w-md text-lg text-ink-inverse/75">{A.brandText}</p>
      <ul className="mt-10 space-y-4">
        {A.brandPoints.map((p, i) => (
          <motion.li key={p} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12 }} className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface/15"><CheckCircle2 className="h-4 w-4" /></span>
            <span className="text-ink-inverse/90">{p}</span>
          </motion.li>
        ))}
      </ul>
    </div>
    <p className="relative text-sm text-ink-inverse/60">{STRINGS.app.tagline} · {STRINGS.app.university}</p>
  </div>
);

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={ROUTES.DASHBOARD} replace />;

  const signIn = async (email, password) => {
    setLoading(true); setServerError('');
    try {
      const me = await login(email, password);
      toast.success(A.welcome(firstName(me.name)));
      navigate(location.state?.from?.pathname || ROUTES.DASHBOARD, { replace: true });
    } catch (e) {
      setServerError(e.message);
    } finally { setLoading(false); }
  };

  const submit = (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (!Object.keys(v).length) signIn(form.email.trim(), form.password);
  };

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); setServerError(''); };

  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-2">
      <BrandPanel />
      <div className="flex flex-col px-4 py-8 sm:px-8">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-1.5 self-start text-sm text-ink-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" />{A.backHome}
        </Link>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto my-auto w-full max-w-sm py-10">
          <div className="lg:hidden"><Logo /></div>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink lg:mt-0">{A.title}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{A.subtitle}</p>

          {serverError && (
            <motion.div role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-start gap-2.5 rounded-xl border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{serverError}
            </motion.div>
          )}

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <Input label={A.email} type="email" autoComplete="email" icon={Mail} placeholder={A.emailPlaceholder}
              value={form.email} onChange={set('email')} error={errors.email} />
            <Input label={A.password} type={show ? 'text' : 'password'} autoComplete="current-password" icon={Lock} placeholder={A.passwordPlaceholder}
              value={form.password} onChange={set('password')} error={errors.password}
              right={(
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? STRINGS.common.hidePassword : STRINGS.common.showPassword}
                  className="rounded-lg p-2 text-ink-faint hover:text-ink">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )} />
            <Button type="submit" size="lg" className="w-full" loading={loading}>{loading ? A.signingIn : A.submit}</Button>
          </form>
          <p className="mt-5 text-center text-xs leading-relaxed text-ink-muted">{A.noAccount}</p>

          {SHOW_DEMO && (
            <div className="mt-8 rounded-card border border-dashed border-surface-strong bg-surface-muted p-4">
              <p className="text-sm font-semibold text-ink">{A.demoTitle}</p>
              <p className="mb-3 text-xs text-ink-muted">{A.demoHint}</p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((d) => {
                  const Icon = DEMO_ICONS[d.role];
                  return (
                    <button key={d.role} type="button" disabled={loading} onClick={() => signIn(d.email, DEMO_PASSWORD)}
                      className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2.5 text-left text-sm font-medium text-ink-soft shadow-soft transition hover:border-primary hover:text-primary disabled:opacity-50">
                      <Icon className="h-4 w-4 text-primary" />{STRINGS.roles[d.role]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
export default Login;

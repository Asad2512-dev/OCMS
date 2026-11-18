// Multi-step complaint form: Details → Category → Attachments → Review.
// Teachers see an "anonymous" toggle; the text is checked live for offensive words.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ArrowRight, Send, Check, AlertTriangle, EyeOff, Home, BookOpen, Wallet, Wifi, GraduationCap, HelpCircle, FileText,
} from 'lucide-react';
import { Card, PageHeader, Button, Input, Textarea, FileUpload, Toggle, AnonymousBadge } from '../../components/ui/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { complaintApi } from '../../services/endpoints.js';
import { ROUTES, ROLES, CATEGORIES, LIMITS, TEXT_CHECK_DELAY_MS } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { formatBytes } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const S = STRINGS.complaint;
const CATEGORY_ICONS = { hostel: Home, library: BookOpen, accounts: Wallet, it: Wifi, academics: GraduationCap, other: HelpCircle };

const Stepper = ({ step }) => (
  <ol className="mb-8 flex items-center">
    {S.steps.map((label, i) => {
      const done = i < step; const current = i === step;
      return (
        <li key={label} className={cn('flex items-center', i < S.steps.length - 1 && 'flex-1')}>
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all',
              done ? 'bg-primary text-ink-inverse' : current ? 'bg-primary-soft text-primary ring-4 ring-primary/15' : 'bg-surface-subtle text-ink-faint')}>
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn('text-xs font-medium sm:text-sm', current ? 'text-ink' : 'text-ink-muted')}>{label}</span>
          </div>
          {i < S.steps.length - 1 && <span className={cn('mx-2 mb-6 h-0.5 flex-1 rounded-full transition-colors sm:mb-0 sm:mx-4', done ? 'bg-primary' : 'bg-surface-border')} />}
        </li>
      );
    })}
  </ol>
);

// Asks the server whether the text contains offensive words (debounced).
const useProfanityCheck = (text) => {
  const debounced = useDebounce(text, TEXT_CHECK_DELAY_MS);
  const [abusive, setAbusive] = useState(false);
  useEffect(() => {
    if (!debounced.trim()) { setAbusive(false); return; }
    let alive = true;
    complaintApi.checkText(debounced).then((r) => alive && setAbusive(r.abusive)).catch(() => {});
    return () => { alive = false; };
  }, [debounced]);
  return abusive;
};

const DetailsStep = ({ form, set, errors, abusive, isTeacher }) => (
  <div className="space-y-5">
    <Input label={S.fields.title} required placeholder={S.titlePlaceholder} value={form.title} maxLength={LIMITS.TITLE_MAX}
      onChange={(e) => set('title', e.target.value)} error={errors.title} />
    <Textarea label={S.fields.description} required placeholder={S.descriptionPlaceholder} value={form.description} rows={6}
      maxLength={LIMITS.DESCRIPTION_MAX} onChange={(e) => set('description', e.target.value)} error={errors.description} />
    <AnimatePresence>
      {abusive && (
        <motion.div role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className="flex items-start gap-3 overflow-hidden rounded-xl border border-warning-border bg-warning-soft px-4 py-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{S.profanityWarning}
        </motion.div>
      )}
    </AnimatePresence>
    {isTeacher && (
      <div className={cn('rounded-card border p-4 transition-colors', form.isAnonymous ? 'border-primary-muted bg-primary-soft/60' : 'border-surface-border bg-surface-muted')}>
        <Toggle checked={form.isAnonymous} onChange={(v) => set('isAnonymous', v)} label={S.anonymousLabel} help={S.anonymousHelp} icon={EyeOff} />
      </div>
    )}
  </div>
);

const CategoryStep = ({ form, set, error }) => (
  <div>
    <h2 className="mb-4 text-base font-semibold text-ink">{S.categoryTitle}</h2>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label={S.fields.category}>
      {Object.values(CATEGORIES).map((c) => {
        const Icon = CATEGORY_ICONS[c]; const active = form.category === c;
        return (
          <button key={c} type="button" role="radio" aria-checked={active} onClick={() => set('category', c)}
            className={cn('flex items-start gap-3 rounded-card border p-4 text-left transition-all',
              active ? 'border-primary bg-primary-soft ring-4 ring-primary/10' : 'border-surface-border bg-surface hover:border-surface-strong hover:shadow-soft')}>
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', active ? 'bg-primary text-ink-inverse' : 'bg-surface-subtle text-ink-muted')}>
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-medium text-ink">{STRINGS.categories[c]}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{STRINGS.categoryHints[c]}</span>
            </span>
          </button>
        );
      })}
    </div>
    {error && <p role="alert" className="mt-3 text-xs font-medium text-danger">{error}</p>}
  </div>
);

const ReviewRow = ({ label, children }) => (
  <div className="py-4 sm:grid sm:grid-cols-4 sm:gap-4">
    <dt className="text-sm text-ink-muted">{label}</dt>
    <dd className="mt-1 text-sm text-ink sm:col-span-3 sm:mt-0">{children}</dd>
  </div>
);

const ReviewStep = ({ form }) => (
  <div>
    <h2 className="text-base font-semibold text-ink">{S.reviewTitle}</h2>
    <p className="mt-1 text-sm text-ink-muted">{S.reviewText}</p>
    <dl className="mt-4 divide-y divide-surface-border">
      <ReviewRow label={S.fields.title}><span className="font-medium">{form.title}</span></ReviewRow>
      <ReviewRow label={S.fields.description}><p className="whitespace-pre-line leading-relaxed text-ink-soft">{form.description}</p></ReviewRow>
      <ReviewRow label={S.fields.category}>{STRINGS.categories[form.category]}</ReviewRow>
      <ReviewRow label={S.fields.attachments}>
        {form.files.length ? (
          <ul className="space-y-1.5">{form.files.map((f) => (
            <li key={f.name} className="flex items-center gap-2 text-ink-soft"><FileText className="h-4 w-4 text-ink-faint" />{f.name}<span className="text-xs text-ink-faint">{formatBytes(f.size)}</span></li>
          ))}</ul>
        ) : <span className="text-ink-muted">{S.noAttachments}</span>}
      </ReviewRow>
      {form.isAnonymous && <ReviewRow label={S.anonymousLabel}><span className="inline-flex items-center gap-2"><AnonymousBadge /><span className="text-ink-muted">{S.anonymousOn}</span></span></ReviewRow>}
    </dl>
  </div>
);

const NewComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user.role === ROLES.TEACHER;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: '', description: '', category: '', files: [], isAnonymous: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const abusive = useProfanityCheck(`${form.title} ${form.description}`);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.title.trim()) e.title = S.errors.titleRequired;
      if (!form.description.trim()) e.description = S.errors.descriptionRequired;
    }
    if (step === 1 && !form.category) e.category = S.errors.categoryRequired;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const submit = async () => {
    setSubmitting(true);
    try {
      const { complaint } = await complaintApi.create({
        title: form.title.trim(), description: form.description.trim(), category: form.category,
        isAnonymous: isTeacher && form.isAnonymous, files: form.files,
      });
      toast.success(S.submitted(complaint.complaintId));
      navigate(ROUTES.COMPLAINT(complaint._id), { replace: true });
    } catch (e) {
      toast.error(e.message);
    } finally { setSubmitting(false); }
  };

  const last = step === S.steps.length - 1;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={S.newTitle} subtitle={S.newSubtitle} />
      <Stepper step={step} />
      <Card>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            {step === 0 && <DetailsStep form={form} set={set} errors={errors} abusive={abusive} isTeacher={isTeacher} />}
            {step === 1 && <CategoryStep form={form} set={set} error={errors.category} />}
            {step === 2 && (
              <div>
                <h2 className="text-base font-semibold text-ink">{S.attachmentsTitle}</h2>
                <p className="mb-4 mt-1 text-sm text-ink-muted">{S.attachmentsHint}</p>
                <FileUpload files={form.files} onChange={(files) => set('files', files)} />
              </div>
            )}
            {step === 3 && <ReviewStep form={form} />}
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-surface-border pt-5">
          {step > 0 ? <Button variant="ghost" icon={ArrowLeft} onClick={back}>{STRINGS.common.back}</Button> : <span />}
          {last
            ? <Button icon={Send} loading={submitting} onClick={submit}>{submitting ? S.submitting : S.submit}</Button>
            : <Button iconRight={ArrowRight} onClick={next}>{STRINGS.common.next}</Button>}
        </div>
      </Card>
    </div>
  );
};
export default NewComplaint;

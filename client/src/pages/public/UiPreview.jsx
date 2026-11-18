// /ui-preview: shows every reusable UI component so the design can be checked in one place.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Mail, FileText, Clock, CheckCircle2, AlertCircle, EyeOff, ArrowLeft } from 'lucide-react';
import Logo from '../../components/layout/Logo.jsx';
import {
  Button, Input, Textarea, Select, Badge, StatusBadge, PriorityBadge, AnonymousBadge, Card, CardHeader, Modal, ConfirmDialog,
  Table, EmptyState, Skeleton, SkeletonText, SkeletonStats, Avatar, StatCard, FileUpload, Pagination, Toggle, StarRating, SegmentedControl,
} from '../../components/ui/index.js';
import theme from '../../config/theme.js';
import { STATUSES, PRIORITIES, CATEGORIES, ROUTES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const U = STRINGS.ui;
const X = U.sample;

const Section = ({ title, children }) => (
  <Card animate={false}>
    <CardHeader title={title} />
    {children}
  </Card>
);

const sampleRows = [
  { _id: '1', id: 'CMP-2026-0041', title: 'Wi-Fi down in Block C', status: 'in_progress', priority: 'urgent' },
  { _id: '2', id: 'CMP-2026-0040', title: 'Library closes too early', status: 'pending', priority: 'normal' },
  { _id: '3', id: 'CMP-2026-0039', title: 'Fee challan not generated', status: 'resolved', priority: 'normal' },
];
const F = STRINGS.complaint.fields;

const UiPreview = () => {
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(3);
  const [toggle, setToggle] = useState(true);
  const [rating, setRating] = useState(4);
  const [view, setView] = useState('table');

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="sticky top-0 z-20 border-b border-surface-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Link to={ROUTES.HOME}><Button variant="ghost" size="sm" icon={ArrowLeft}>{STRINGS.common.back}</Button></Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <div>
          <h1 className="page-title">{U.previewTitle}</h1>
          <p className="page-subtitle">{U.previewSubtitle}</p>
        </div>

        <Section title={U.sections.colors}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {['primary', 'accent', 'success', 'warning', 'danger', 'info', 'ink'].map((k) => (
              <div key={k} className="overflow-hidden rounded-xl border border-surface-border">
                <div className="h-14" style={{ background: theme.colors[k].DEFAULT }} />
                <div className="h-6" style={{ background: theme.colors[k].soft || theme.colors[k].muted }} />
                <p className="px-2 py-1.5 font-mono text-[11px] text-ink-muted">{k}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title={U.sections.buttons}>
          <div className="flex flex-wrap items-center gap-3">
            <Button>{X.primary}</Button>
            <Button variant="secondary">{X.secondary}</Button>
            <Button variant="outline">{X.outline}</Button>
            <Button variant="ghost">{X.ghost}</Button>
            <Button variant="danger">{X.danger}</Button>
            <Button loading>{X.loading}</Button>
            <Button icon={Plus}>{X.withIcon}</Button>
            <Button size="sm" variant="outline">{X.outline}</Button>
            <Button size="lg">{X.primary}</Button>
            <Button size="icon" variant="outline" aria-label={STRINGS.common.search}><Search className="h-4 w-4" /></Button>
          </div>
        </Section>

        <Section title={U.sections.inputs}>
          <div className="grid gap-5 md:grid-cols-2">
            <Input label={X.inputLabel} placeholder={X.inputPlaceholder} hint={X.inputHint} required />
            <Input label={X.errorLabel} icon={Mail} defaultValue={X.errorValue} error={X.errorText} />
            <Select label={X.selectLabel} placeholder={STRINGS.complaint.allCategories} options={Object.values(CATEGORIES).map((c) => ({ value: c, label: STRINGS.categories[c] }))} />
            <Input label={STRINGS.common.search} icon={Search} placeholder={STRINGS.complaint.searchPlaceholder} disabled />
            <Textarea className="md:col-span-2" label={X.textareaLabel} placeholder={X.textareaPlaceholder} maxLength={300} value="" onChange={() => {}} />
          </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title={U.sections.badges}>
            <div className="flex flex-wrap gap-2">
              {Object.values(STATUSES).map((s) => <StatusBadge key={s} status={s} />)}
              {Object.values(PRIORITIES).map((p) => <PriorityBadge key={p} priority={p} />)}
              <AnonymousBadge />
              <Badge tone="primary">{STRINGS.roles.admin}</Badge>
              <Badge>{STRINGS.categories.it}</Badge>
            </div>
          </Section>
          <Section title={U.sections.avatars}>
            <div className="flex items-center gap-3">
              {X.names.map((n, i) => <Avatar key={n} name={n} size={['sm', 'md', 'lg', 'xl'][i]} />)}
              <Avatar anonymous size="lg" />
            </div>
          </Section>
        </div>

        <Section title={U.sections.cards}>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={FileText} label={STRINGS.dashboard.stats.total} value="64" />
            <StatCard icon={Clock} label={STRINGS.dashboard.stats.pending} value="5" tone="warning" index={1} />
            <StatCard icon={AlertCircle} label={STRINGS.dashboard.stats.inProgress} value="7" tone="info" index={2} />
            <StatCard icon={CheckCircle2} label={STRINGS.dashboard.stats.resolved} value="49" tone="success" index={3} note="77%" />
          </div>
          <Card className="mt-4" hover><CardHeader title={X.cardTitle} subtitle={X.cardText} icon={FileText} /></Card>
        </Section>

        <Section title={U.sections.table}>
          <div className="mb-4 flex justify-end">
            <SegmentedControl value={view} onChange={setView} options={[{ value: 'table', label: STRINGS.common.tableView }, { value: 'cards', label: STRINGS.common.cardView }]} />
          </div>
          <div className="overflow-hidden rounded-xl border border-surface-border">
            <Table rows={sampleRows} onRowClick={() => {}} columns={[
              { key: 'id', header: F.id, render: (r) => <span className="font-mono text-xs">{r.id}</span> },
              { key: 'title', header: F.title, render: (r) => <span className="font-medium text-ink">{r.title}</span> },
              { key: 'priority', header: F.priority, render: (r) => <PriorityBadge priority={r.priority} /> },
              { key: 'status', header: F.status, render: (r) => <StatusBadge status={r.status} /> },
            ]} />
            <div className="border-t border-surface-border"><Pagination page={page} pages={7} total={64} limit={10} onChange={setPage} /></div>
          </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title={U.sections.empty}>
            <EmptyState title={X.emptyTitle} text={X.emptyText} action={X.emptyAction} actionIcon={Plus} onAction={() => {}} />
          </Section>
          <Section title={U.sections.skeleton}>
            <div className="space-y-4"><Skeleton className="h-10 w-10 rounded-full" /><SkeletonText lines={4} /></div>
          </Section>
        </div>
        <SkeletonStats />

        <Section title={U.sections.upload}><FileUpload files={files} onChange={setFiles} /></Section>

        <div className="grid gap-6 lg:grid-cols-3">
          <Section title={U.sections.modal}>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setModal(true)}>{X.openModal}</Button>
              <Button variant="danger" onClick={() => setConfirm(true)}>{X.openConfirm}</Button>
              <Button variant="secondary" onClick={() => toast.success(X.toastText)}>{X.toast}</Button>
            </div>
          </Section>
          <Section title={U.sections.rating}>
            <StarRating value={rating} onChange={setRating} />
            <div className="mt-3"><StarRating value={3.6} size="sm" /></div>
          </Section>
          <Section title={U.sections.toggle}>
            <Toggle checked={toggle} onChange={setToggle} label={X.toggleLabel} help={X.toggleHelp} icon={EyeOff} />
          </Section>
        </div>
      </main>

      <Modal open={modal} onClose={() => setModal(false)} title={X.modalTitle}
        footer={<><Button variant="outline" onClick={() => setModal(false)}>{STRINGS.common.cancel}</Button><Button onClick={() => setModal(false)}>{STRINGS.common.save}</Button></>}>
        <p className="text-sm text-ink-muted">{X.modalText}</p>
        <Input className="mt-4" label={X.inputLabel} placeholder={X.inputPlaceholder} />
      </Modal>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={() => setConfirm(false)} title={X.confirmTitle} text={X.confirmText} confirmLabel={STRINGS.common.delete} />
    </div>
  );
};
export default UiPreview;

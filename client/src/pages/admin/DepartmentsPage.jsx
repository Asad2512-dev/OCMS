// Admin department management: cards with officer/complaint counts, create/edit, activate/deactivate, delete.
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Building2, Users, FileText, Power } from 'lucide-react';
import { Card, PageHeader, Button, Input, Textarea, Modal, ConfirmDialog, Badge, EmptyState, ErrorState, SkeletonCard } from '../../components/ui/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { departmentApi } from '../../services/endpoints.js';
import { STRINGS } from '../../config/strings.js';
import { cn } from '../../utils/cn.js';

const D = STRINGS.departments;

const DepartmentForm = ({ open, onClose, dept, onSaved }) => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) { setForm({ name: dept?.name || '', description: dept?.description || '' }); setError(''); } }, [open, dept]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (dept) await departmentApi.update(dept._id, form); else await departmentApi.create(form);
      toast.success(dept ? D.updated : D.created);
      onSaved(); onClose();
    } catch (err) { setError(err.errors?.[0]?.message || err.message); } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={dept ? D.edit : D.add}
      footer={<><Button variant="outline" onClick={onClose}>{STRINGS.common.cancel}</Button><Button type="submit" form="dept-form" loading={saving}>{STRINGS.common.save}</Button></>}>
      <form id="dept-form" onSubmit={submit} className="space-y-4">
        <Input label={D.name} required value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(''); }} error={error} />
        <Textarea label={D.description} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
      </form>
    </Modal>
  );
};

const DepartmentsPage = () => {
  const { data, loading, error, reload } = useAsync(() => departmentApi.list(true).then((r) => r.departments), []);
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const toggle = async (d) => {
    try { await departmentApi.update(d._id, { isActive: !d.isActive }); toast.success(D.updated); reload(); } catch (e) { toast.error(e.message); }
  };
  const remove = async () => {
    setBusy(true);
    try { await departmentApi.remove(deleting._id); toast.success(D.deleted); setDeleting(null); reload(); } catch (e) { toast.error(e.message); setDeleting(null); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title={D.title} subtitle={D.subtitle} actions={<Button icon={Plus} onClick={() => setEditing(null)}>{D.add}</Button>} />
      {error ? <Card><ErrorState error={error} onRetry={reload} /></Card> : loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : !data.length ? (
        <Card><EmptyState icon={Building2} title={D.empty} text={D.emptyText} action={D.add} actionIcon={Plus} onAction={() => setEditing(null)} /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((d, i) => (
            <motion.div key={d._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={cn('flex flex-col rounded-card border border-surface-border bg-surface p-5 shadow-card', !d.isActive && 'opacity-70')}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary"><Building2 className="h-5 w-5" /></span>
                <Badge tone={d.isActive ? 'success' : 'neutral'}>{d.isActive ? STRINGS.common.active : STRINGS.common.inactive}</Badge>
              </div>
              <h3 className="mt-4 font-semibold text-ink">{d.name}</h3>
              <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-ink-muted">{d.description || STRINGS.common.none}</p>
              <div className="mt-4 flex gap-4 text-sm text-ink-soft">
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-ink-faint" />{D.officers(d.officerCount)}</span>
                <span className="inline-flex items-center gap-1.5"><FileText className="h-4 w-4 text-ink-faint" />{D.complaints(d.complaintCount)}</span>
              </div>
              <div className="mt-5 flex gap-1 border-t border-surface-border pt-3">
                <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing(d)}>{STRINGS.common.edit}</Button>
                <Button size="sm" variant="ghost" icon={Power} onClick={() => toggle(d)}>{d.isActive ? D.deactivate : D.activate}</Button>
                <Button size="sm" variant="danger-ghost" icon={Trash2} className="ml-auto" onClick={() => setDeleting(d)} aria-label={STRINGS.common.delete} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <DepartmentForm open={editing !== undefined} onClose={() => setEditing(undefined)} dept={editing} onSaved={reload} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} loading={busy} title={D.deleteTitle} text={D.deleteText} confirmLabel={STRINGS.common.delete} />
    </>
  );
};
export default DepartmentsPage;

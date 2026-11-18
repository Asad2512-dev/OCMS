// Admin "Review & assign" drawer: pick department → officer list filters automatically → priority → assign.
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, UserCheck } from 'lucide-react';
import { Modal, Button, Select, StatusBadge, PriorityBadge, Avatar } from '../ui/index.js';
import { departmentApi, userApi, complaintApi } from '../../services/endpoints.js';
import { PRIORITIES, ROLES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { cn } from '../../utils/cn.js';

const S = STRINGS.complaint;

const AssignDrawer = ({ open, onClose, complaint, onAssigned }) => {
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [form, setForm] = useState({ department: '', assignedTo: '', priority: PRIORITIES.NORMAL });
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !complaint) return;
    setForm({ department: complaint.department?._id || '', assignedTo: complaint.assignedTo?._id || '', priority: complaint.priority });
    departmentApi.list().then((r) => setDepartments(r.departments)).catch((e) => toast.error(e.message));
  }, [open, complaint]);

  // Officer list follows the chosen department.
  useEffect(() => {
    if (!form.department) { setOfficers([]); return; }
    setLoadingOfficers(true);
    userApi.list({ role: ROLES.OFFICER, department: form.department, isActive: 'true', limit: 50 })
      .then((r) => setOfficers(r.users))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingOfficers(false));
  }, [form.department]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v, ...(k === 'department' && { assignedTo: '' }) }));

  const submit = async () => {
    setSaving(true);
    try {
      const { complaint: updated } = await complaintApi.assign(complaint._id, form);
      toast.success(S.assigned);
      onAssigned?.(updated);
      onClose();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} side="right" title={S.assignTitle} subtitle={S.assignSubtitle}
      footer={<>
        <Button variant="outline" onClick={onClose}>{STRINGS.common.cancel}</Button>
        <Button icon={UserCheck} loading={saving} disabled={!form.department || !form.assignedTo} onClick={submit}>{S.assign}</Button>
      </>}>
      {complaint && (
        <div className="space-y-6">
          <div className="rounded-xl border border-surface-border bg-surface-muted p-4">
            <p className="font-mono text-xs text-ink-faint">{complaint.complaintId}</p>
            <p className="mt-1 font-semibold text-ink">{complaint.title}</p>
            <p className="mt-1 line-clamp-3 text-sm text-ink-muted">{complaint.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={complaint.status} />
              <span className="text-xs text-ink-muted">{STRINGS.categories[complaint.category]}</span>
            </div>
          </div>

          <Select label={S.fields.department} required value={form.department} onChange={(e) => set('department', e.target.value)}
            placeholder={S.chooseDepartment} options={departments.map((d) => ({ value: d._id, label: d.name }))} />

          <fieldset>
            <legend className="label">{S.fields.assignedTo}<span className="ml-0.5 text-danger" aria-hidden>*</span></legend>
            {!form.department ? (
              <p className="rounded-xl border border-dashed border-surface-border px-4 py-5 text-center text-sm text-ink-muted"><Building2 className="mx-auto mb-1 h-5 w-5 text-ink-faint" />{S.pickDepartmentFirst}</p>
            ) : loadingOfficers ? (
              <p className="px-1 py-3 text-sm text-ink-muted">{STRINGS.common.loading}</p>
            ) : officers.length === 0 ? (
              <p className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">{S.noOfficers}</p>
            ) : (
              <div className="space-y-2">
                {officers.map((o) => (
                  <label key={o.id} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all',
                    form.assignedTo === o.id ? 'border-primary bg-primary-soft ring-4 ring-primary/10' : 'border-surface-border hover:border-surface-strong')}>
                    <input type="radio" name="officer" className="sr-only" checked={form.assignedTo === o.id} onChange={() => set('assignedTo', o.id)} />
                    <Avatar name={o.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{o.name}</span>
                      <span className="block truncate text-xs text-ink-muted">{o.email}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend className="label">{S.fields.priority}</legend>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(PRIORITIES).map((p) => (
                <label key={p} className={cn('flex cursor-pointer items-center justify-center rounded-xl border p-3 transition-all',
                  form.priority === p ? 'border-primary bg-primary-soft ring-4 ring-primary/10' : 'border-surface-border hover:border-surface-strong')}>
                  <input type="radio" name="priority" className="sr-only" checked={form.priority === p} onChange={() => set('priority', p)} />
                  <PriorityBadge priority={p} />
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </Modal>
  );
};
export default AssignDrawer;

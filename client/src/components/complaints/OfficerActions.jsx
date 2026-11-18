// Officer panel on a complaint: move it to the next status (with an optional note) and add remarks.
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PlayCircle, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardHeader, Button, Modal, Textarea } from '../ui/index.js';
import RemarkForm from './RemarkForm.jsx';
import { complaintApi } from '../../services/endpoints.js';
import { OFFICER_NEXT_STATUS, CLOSED_STATUSES, LIMITS } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const S = STRINGS.complaint;

const OfficerActions = ({ complaint, onChange }) => {
  const next = OFFICER_NEXT_STATUS[complaint.status];
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  if (CLOSED_STATUSES.includes(complaint.status)) {
    return <Card><p className="flex items-center gap-2 text-sm text-ink-muted"><Lock className="h-4 w-4" />{S.closedNotice}</p></Card>;
  }

  const save = async () => {
    setSaving(true);
    try {
      const { complaint: updated } = await complaintApi.updateStatus(complaint._id, next, note.trim() || undefined);
      toast.success(S.statusUpdated);
      setOpen(false); setNote('');
      onChange(updated);
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const isStart = next === 'in_progress';
  return (
    <Card>
      <CardHeader title={S.updateStatus} />
      <Button className="w-full" variant={isStart ? 'primary' : 'primary'} icon={isStart ? PlayCircle : CheckCircle2} onClick={() => setOpen(true)}>
        {isStart ? S.markInProgress : S.markResolved}
      </Button>
      <div className="my-5 h-px bg-surface-border" />
      <RemarkForm complaintId={complaint._id} onAdded={onChange} />

      <Modal open={open} onClose={() => setOpen(false)} size="sm" title={S.statusConfirmTitle(STRINGS.statuses[next])} subtitle={S.statusConfirmText}
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>{STRINGS.common.cancel}</Button><Button loading={saving} onClick={save}>{STRINGS.common.confirm}</Button></>}>
        <Textarea label={S.remarks} placeholder={S.statusRemarkPlaceholder} value={note} onChange={(e) => setNote(e.target.value)} maxLength={LIMITS.REMARK_MAX} rows={3} />
      </Modal>
    </Card>
  );
};
export default OfficerActions;

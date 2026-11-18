// "Are you sure?" dialog. With requireReason it also asks for a text reason (e.g. rejecting a complaint).
import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import Textarea from './Textarea.jsx';
import { STRINGS } from '../../config/strings.js';
import { LIMITS } from '../../config/constants.js';

const ConfirmDialog = ({
  open, onClose, onConfirm, title, text, confirmLabel = STRINGS.common.confirm, tone = 'danger',
  loading, requireReason, reasonLabel, reasonPlaceholder, reasonError,
}) => {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  useEffect(() => { if (open) { setReason(''); setTouched(false); } }, [open]);

  const submit = () => {
    setTouched(true);
    if (requireReason && !reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <Button variant="outline" onClick={onClose}>{STRINGS.common.cancel}</Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={loading} onClick={submit}>{confirmLabel}</Button>
      </>}
    >
      <div className="flex gap-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-primary-soft text-primary'}`}>
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="pt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
      </div>
      {requireReason && (
        <Textarea className="mt-5" label={reasonLabel} placeholder={reasonPlaceholder} value={reason} required
          maxLength={LIMITS.REMARK_MAX} onChange={(e) => setReason(e.target.value)} rows={3}
          error={touched && !reason.trim() ? reasonError : undefined} />
      )}
    </Modal>
  );
};
export default ConfirmDialog;

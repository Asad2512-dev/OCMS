// Small form to add a remark to a complaint (officer / admin).
import { useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquarePlus } from 'lucide-react';
import { Textarea, Button } from '../ui/index.js';
import { complaintApi } from '../../services/endpoints.js';
import { LIMITS } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const RemarkForm = ({ complaintId, onAdded }) => {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      const { complaint } = await complaintApi.addRemark(complaintId, text.trim());
      setText('');
      toast.success(STRINGS.complaint.remarkAdded);
      onAdded(complaint);
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Textarea label={STRINGS.complaint.addRemark} placeholder={STRINGS.complaint.remarkPlaceholder} value={text}
        onChange={(e) => setText(e.target.value)} maxLength={LIMITS.REMARK_MAX} rows={3} />
      <Button type="submit" variant="secondary" icon={MessageSquarePlus} loading={saving} disabled={!text.trim()}>{STRINGS.complaint.addRemark}</Button>
    </form>
  );
};
export default RemarkForm;

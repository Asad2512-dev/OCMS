// Feedback card: the owner can rate a resolved complaint once; everyone else sees the rating if given.
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Star, Send } from 'lucide-react';
import { Card, CardHeader, StarRating, Textarea, Button, Skeleton } from '../ui/index.js';
import { complaintApi } from '../../services/endpoints.js';
import { STRINGS } from '../../config/strings.js';
import { LIMITS, STATUSES } from '../../config/constants.js';
import { formatDate } from '../../utils/format.js';

const S = STRINGS.complaint;

const FeedbackSection = ({ complaint }) => {
  const [feedback, setFeedback] = useState(undefined);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const resolved = complaint.status === STATUSES.RESOLVED;

  useEffect(() => {
    if (!resolved) return;
    complaintApi.getFeedback(complaint._id).then((r) => setFeedback(r.feedback)).catch(() => setFeedback(null));
  }, [complaint._id, resolved]);

  if (!resolved) return null;
  if (feedback === undefined) return <Card><Skeleton className="h-24" /></Card>;
  if (!feedback && !complaint.isOwner) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) { setError(S.ratingRequired); return; }
    setSaving(true);
    try {
      const r = await complaintApi.giveFeedback(complaint._id, { rating, comment });
      setFeedback(r.feedback);
      toast.success(S.feedbackThanks);
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  if (feedback) {
    return (
      <Card>
        <CardHeader icon={Star} title={complaint.isOwner ? S.feedbackGiven : S.feedbackFrom} subtitle={formatDate(feedback.createdAt)} />
        <StarRating value={feedback.rating} size="md" />
        {feedback.comment && <p className="mt-3 text-sm leading-relaxed text-ink-soft">“{feedback.comment}”</p>}
      </Card>
    );
  }

  return (
    <Card className="border-primary-muted bg-gradient-to-br from-primary-soft/60 to-surface">
      <CardHeader icon={Star} title={S.feedbackTitle} subtitle={S.feedbackText} />
      <form onSubmit={submit} className="space-y-4">
        <div>
          <StarRating value={rating} onChange={(v) => { setRating(v); setError(''); }} size="lg" />
          {error && <p role="alert" className="mt-2 text-xs font-medium text-danger">{error}</p>}
        </div>
        <Textarea label={S.feedbackComment} placeholder={S.feedbackPlaceholder} value={comment} onChange={(e) => setComment(e.target.value)}
          maxLength={LIMITS.COMMENT_MAX} rows={3} />
        <Button type="submit" icon={Send} loading={saving}>{S.feedbackSubmit}</Button>
      </form>
    </Card>
  );
};
export default FeedbackSection;

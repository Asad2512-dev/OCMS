// Vertical timeline that merges status changes and remarks in date order.
import { motion } from 'framer-motion';
import { CircleDot, PlayCircle, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { STRINGS } from '../../config/strings.js';
import { formatDateTime } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const S = STRINGS.complaint;
const STYLE = {
  pending: { icon: CircleDot, ring: 'bg-warning-soft text-warning' },
  in_progress: { icon: PlayCircle, ring: 'bg-info-soft text-info' },
  resolved: { icon: CheckCircle2, ring: 'bg-success-soft text-success' },
  rejected: { icon: XCircle, ring: 'bg-danger-soft text-danger' },
  remark: { icon: MessageSquare, ring: 'bg-primary-soft text-primary' },
};

// Who did it: their name, "Anonymous Teacher" if hidden, or "You".
const actorName = (by, complaint) => {
  if (by?.name) return by.name;
  return complaint.isAnonymous ? S.anonymous : S.system;
};

export const buildEvents = (c) => [
  ...(c.statusHistory || []).map((h, i) => ({ id: `s${i}`, type: h.status, date: h.date, by: h.by })),
  ...(c.remarks || []).map((r) => ({ id: r._id, type: 'remark', date: r.date, by: r.by, text: r.text })),
].sort((a, b) => new Date(a.date) - new Date(b.date) || (a.type === 'remark' ? 1 : -1));

const Timeline = ({ complaint }) => {
  const events = buildEvents(complaint);
  return (
    <ol className="relative">
      {events.map((e, i) => {
        const { icon: Icon, ring } = STYLE[e.type] || STYLE.remark;
        const last = i === events.length - 1;
        return (
          <motion.li key={e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && <span className="absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-px bg-surface-border" aria-hidden />}
            <span className={cn('relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-surface', ring)}>
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-sm font-semibold text-ink">{S.timelineEvents[e.type]}</p>
                <time className="text-xs text-ink-faint" dateTime={e.date}>{formatDateTime(e.date)}</time>
              </div>
              <p className="mt-0.5 text-xs text-ink-muted">{S.by(actorName(e.by, complaint))}</p>
              {e.text && (
                <p className={cn('mt-2 whitespace-pre-line rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed',
                  complaint.status === 'rejected' && last ? 'border-danger-border bg-danger-soft text-ink-soft' : 'border-surface-border bg-surface-muted text-ink-soft')}>
                  {e.text}
                </p>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
};
export default Timeline;

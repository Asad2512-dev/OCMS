// Compact card for one complaint (used in card view, dashboards and mobile lists).
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Paperclip, Building2, Clock } from 'lucide-react';
import { StatusBadge, PriorityBadge, AnonymousBadge } from '../ui/index.js';
import { ROUTES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { timeAgo } from '../../utils/format.js';

const ComplaintCard = ({ c, index = 0, showSubmitter }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 8) * 0.03 }}>
    <Link to={ROUTES.COMPLAINT(c._id)}
      className="group flex h-full flex-col rounded-card border border-surface-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-muted hover:shadow-lift">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-medium text-ink-faint">{c.complaintId}</span>
        <StatusBadge status={c.status} />
      </div>
      <h3 className="line-clamp-2 font-semibold text-ink group-hover:text-primary">{c.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{c.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={c.priority} />
        {c.isAnonymous && <AnonymousBadge />}
      </div>
      <div className="mt-auto flex items-center gap-4 border-t border-surface-border pt-3 text-xs text-ink-muted [&:not(:first-child)]:mt-4">
        <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{c.department?.name || STRINGS.common.unassigned}</span>
        {c.attachments?.length > 0 && <span className="inline-flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" />{c.attachments.length}</span>}
        <span className="ml-auto inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(c.updatedAt)}</span>
      </div>
      {showSubmitter && <span className="sr-only">{c.submitterName || c.submittedBy?.name}</span>}
    </Link>
  </motion.div>
);
export default ComplaintCard;

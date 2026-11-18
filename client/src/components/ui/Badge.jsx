// Small colored label. StatusBadge and PriorityBadge pick their colors from constants (which use theme colors).
import { AlertTriangle, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { STATUS_STYLES, STATUS_DOT, PRIORITY_STYLES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const TONES = {
  neutral: 'bg-surface-subtle text-ink-soft ring-surface-border',
  primary: 'bg-primary-soft text-primary ring-primary-muted',
  success: 'bg-success-soft text-success ring-success-border',
  warning: 'bg-warning-soft text-warning ring-warning-border',
  danger: 'bg-danger-soft text-danger ring-danger-border',
  info: 'bg-info-soft text-info ring-info-border',
};

export const Badge = ({ tone = 'neutral', className, children, icon: Icon, dot }) => (
  <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', TONES[tone] || tone, className)}>
    {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} aria-hidden />}
    {Icon && <Icon className="h-3 w-3" aria-hidden />}
    {children}
  </span>
);

export const StatusBadge = ({ status }) => (
  <Badge tone={STATUS_STYLES[status]} dot={STATUS_DOT[status]}>{STRINGS.statuses[status] || status}</Badge>
);

export const PriorityBadge = ({ priority }) => (
  <Badge tone={PRIORITY_STYLES[priority]} icon={priority === 'urgent' ? AlertTriangle : undefined}>
    {STRINGS.priorities[priority] || priority}
  </Badge>
);

export const AnonymousBadge = () => <Badge tone="primary" icon={EyeOff}>{STRINGS.complaint.anonymous}</Badge>;

export default Badge;

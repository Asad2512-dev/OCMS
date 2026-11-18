// Dashboard number tile: icon, big value, label and an optional small note.
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn.js';

const TONES = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface-subtle text-ink-soft',
};

const StatCard = ({ icon: Icon, label, value, note, tone = 'primary', index = 0, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }}
    onClick={onClick}
    className={cn('group rounded-card border border-surface-border bg-surface p-5 shadow-card transition-all',
      onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lift')}
  >
    <div className="flex items-start justify-between">
      <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', TONES[tone])}>
        {Icon && <Icon className="h-5 w-5" aria-hidden />}
      </span>
      {note && <span className="text-xs font-medium text-ink-faint">{note}</span>}
    </div>
    <p className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{value}</p>
    <p className="mt-1 text-sm text-ink-muted">{label}</p>
  </motion.div>
);
export default StatCard;

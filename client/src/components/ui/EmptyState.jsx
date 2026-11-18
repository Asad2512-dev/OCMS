// Friendly message shown when a list has nothing to show (or loading failed, with tone="error").
import { Inbox, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './Button.jsx';
import { cn } from '../../utils/cn.js';
import { STRINGS } from '../../config/strings.js';

const EmptyState = ({ icon: Icon = Inbox, title, text, action, onAction, actionIcon, tone, className }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
    <div className={cn('mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-8',
      tone === 'error' ? 'bg-danger-soft text-danger ring-danger-soft/50' : 'bg-primary-soft text-primary ring-primary-soft/50')}>
      {tone === 'error' ? <AlertCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
    </div>
    <h3 className="text-base font-semibold text-ink">{title}</h3>
    {text && <p className="mt-1 max-w-sm text-sm text-ink-muted">{text}</p>}
    {action && <Button className="mt-5" variant={tone === 'error' ? 'outline' : 'primary'} icon={actionIcon} onClick={onAction}>{action}</Button>}
  </motion.div>
);

export const ErrorState = ({ error, onRetry }) => (
  <EmptyState tone="error" title={STRINGS.common.errorTitle} text={error?.message || STRINGS.common.errorText}
    action={onRetry && STRINGS.common.retry} onAction={onRetry} />
);

export default EmptyState;

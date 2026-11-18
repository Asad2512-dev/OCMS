// Bell icon with unread count. Opens a dropdown of the latest alerts (from NotificationContext).
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, BellOff } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useClickOutside } from './useClickOutside.js';
import { ROUTES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { timeAgo } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const T = STRINGS.topbar;

export const NotificationItem = ({ n, onClick }) => (
  <button type="button" onClick={onClick}
    className={cn('flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted', !n.isRead && 'bg-primary-soft/40')}>
    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.isRead ? 'bg-transparent' : 'bg-primary')} aria-hidden />
    <span className="min-w-0 flex-1">
      <span className={cn('block text-sm leading-snug', n.isRead ? 'text-ink-muted' : 'font-medium text-ink')}>{n.message}</span>
      <span className="mt-1 block text-xs text-ink-faint">{timeAgo(n.createdAt)}</span>
    </span>
  </button>
);

const NotificationBell = () => {
  const { items, unread, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  const openItem = async (n) => {
    if (!n.isRead) await markRead(n._id);
    close();
    if (n.complaint?._id) navigate(ROUTES.COMPLAINT(n.complaint._id));
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={`${T.notifications} (${unread})`} aria-expanded={open}
        className="relative rounded-xl p-2.5 text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink">
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span key={unread} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-ink-inverse ring-2 ring-surface">
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.15 }}
            className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-card border border-surface-border bg-surface shadow-pop sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
            <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
              <p className="text-sm font-semibold text-ink">{T.notifications}</p>
              {unread > 0 && (
                <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover">
                  <CheckCheck className="h-3.5 w-3.5" />{T.markAllRead}
                </button>
              )}
            </div>
            <div className="scrollbar-thin max-h-96 divide-y divide-surface-border overflow-y-auto">
              {items.length ? items.map((n) => <NotificationItem key={n._id} n={n} onClick={() => openItem(n)} />) : (
                <div className="flex flex-col items-center px-6 py-10 text-center">
                  <BellOff className="mb-3 h-8 w-8 text-ink-faint" />
                  <p className="text-sm font-medium text-ink">{T.noNotifications}</p>
                  <p className="mt-1 text-xs text-ink-muted">{T.noNotificationsText}</p>
                </div>
              )}
            </div>
            <button type="button" onClick={() => { close(); navigate(ROUTES.NOTIFICATIONS); }}
              className="block w-full border-t border-surface-border bg-surface-muted/60 px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-surface-subtle">
              {T.viewAll}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default NotificationBell;

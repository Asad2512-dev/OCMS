// Avatar button in the top bar that opens a small menu: profile, change password, log out.
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, UserCircle, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../ui/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useClickOutside } from './useClickOutside.js';
import { ROUTES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  const go = (path) => { close(); navigate(path); };
  const signOut = async () => {
    close();
    await logout();
    toast.success(STRINGS.auth.loggedOut);
    navigate(ROUTES.LOGIN);
  };

  const itemClass = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-subtle hover:text-ink';

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-surface-subtle">
        <Avatar name={user.name} size="sm" />
        <span className="hidden text-left md:block">
          <span className="block max-w-[10rem] truncate text-sm font-medium leading-tight text-ink">{user.name}</span>
          <span className="block text-xs leading-tight text-ink-muted">{STRINGS.roles[user.role]}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-ink-faint md:block" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-card border border-surface-border bg-surface p-1.5 shadow-pop">
            <div className="flex items-center gap-3 px-3 py-3">
              <Avatar name={user.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                <p className="truncate text-xs text-ink-muted">{user.email}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-surface-border" />
            <button type="button" role="menuitem" className={itemClass} onClick={() => go(ROUTES.PROFILE)}><UserCircle className="h-4 w-4" />{STRINGS.topbar.profile}</button>
            <button type="button" role="menuitem" className={itemClass} onClick={() => go(`${ROUTES.PROFILE}#password`)}><KeyRound className="h-4 w-4" />{STRINGS.topbar.changePassword}</button>
            <div className="my-1 h-px bg-surface-border" />
            <button type="button" role="menuitem" className={`${itemClass} text-danger hover:bg-danger-soft hover:text-danger`} onClick={signOut}><LogOut className="h-4 w-4" />{STRINGS.topbar.logout}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default UserMenu;

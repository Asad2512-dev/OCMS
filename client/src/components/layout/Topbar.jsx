// Top bar: mobile menu button, global search (text search or jump to a complaint ID), bell and user menu.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import NotificationBell from './NotificationBell.jsx';
import UserMenu from './UserMenu.jsx';
import { ROUTES, COMPLAINT_ID_PATTERN } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const Topbar = ({ onMenu }) => {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  // Shorter placeholder on small screens so it is not cut off.
  const [small, setSmall] = useState(() => window.matchMedia('(max-width: 639px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = (e) => setSmall(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(COMPLAINT_ID_PATTERN.test(term) ? `${ROUTES.TRACK}?code=${encodeURIComponent(term.toUpperCase())}` : `${ROUTES.COMPLAINTS}?search=${encodeURIComponent(term)}`);
    setQ('');
  };

  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-surface-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <button type="button" onClick={onMenu} className="rounded-xl p-2 text-ink-muted hover:bg-surface-subtle lg:hidden" aria-label={STRINGS.common.openMenu}>
        <Menu className="h-5 w-5" />
      </button>
      <form onSubmit={submit} className="relative max-w-md flex-1" role="search">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder={small ? STRINGS.topbar.searchPlaceholderShort : STRINGS.topbar.searchPlaceholder} aria-label={STRINGS.common.search}
          className="h-10 w-full rounded-control border border-transparent bg-surface-subtle pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
        />
      </form>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <NotificationBell />
        <div className="mx-1 hidden h-6 w-px bg-surface-border sm:block" />
        <UserMenu />
      </div>
    </header>
  );
};
export default Topbar;

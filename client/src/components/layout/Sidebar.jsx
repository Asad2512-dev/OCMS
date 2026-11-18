// Left navigation. Menu items come from constants.js (MENU) for the user's role.
// Collapsible on desktop; slides in as a drawer on mobile.
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { MENU, ROUTES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';
import { cn } from '../../utils/cn.js';

const NavItem = ({ item, collapsed, badge, onNavigate }) => {
  const Icon = item.icon;
  const label = STRINGS.menu[item.label];
  return (
    <NavLink
      to={item.path}
      end={item.path === ROUTES.COMPLAINTS || item.path === ROUTES.DASHBOARD}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) => cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
        collapsed && 'justify-center px-0',
        isActive ? 'bg-primary-soft text-primary' : 'text-ink-muted hover:bg-surface-subtle hover:text-ink'
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId="nav-active" className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />}
          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
          {!collapsed && <span className="flex-1 truncate">{label}</span>}
          {badge > 0 && (
            <span className={cn('rounded-full bg-primary px-1.5 text-[10px] font-semibold leading-4 text-ink-inverse', collapsed && 'absolute right-1.5 top-1.5')}>
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

const SidebarContent = ({ collapsed, onToggle, onNavigate, mobile }) => {
  const { user } = useAuth();
  const { unread } = useNotifications();
  const items = MENU[user?.role] || [];

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 items-center border-b border-surface-border px-4', collapsed ? 'justify-center' : 'justify-between')}>
        <NavLink to={ROUTES.DASHBOARD} onClick={onNavigate}><Logo compact={collapsed} /></NavLink>
        {mobile && (
          <button type="button" onClick={onNavigate} className="rounded-lg p-2 text-ink-muted hover:bg-surface-subtle" aria-label={STRINGS.common.close}>
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {!collapsed && (
        <p className="px-6 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{STRINGS.roles[user?.role]}</p>
      )}
      <nav className={cn('scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3', collapsed && 'pt-5')} aria-label={STRINGS.common.menu}>
        {items.map((item) => (
          <NavItem key={item.path + item.label} item={item} collapsed={collapsed} onNavigate={onNavigate}
            badge={item.path === ROUTES.NOTIFICATIONS ? unread : 0} />
        ))}
      </nav>
      {!mobile && (
        <div className="border-t border-surface-border p-3">
          <button type="button" onClick={onToggle}
            className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink', collapsed && 'justify-center px-0')}
            aria-label={collapsed ? STRINGS.common.expand : STRINGS.common.collapse}>
            {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <><ChevronsLeft className="h-[18px] w-[18px]" />{STRINGS.common.collapse}</>}
          </button>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => (
  <>
    <aside className={cn('fixed inset-y-0 left-0 z-30 hidden border-r border-surface-border bg-surface transition-[width] duration-300 lg:block', collapsed ? 'w-[76px]' : 'w-64')}>
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
    <AnimatePresence>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <motion.div className="absolute inset-0 bg-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onMobileClose} />
          <motion.aside className="absolute inset-y-0 left-0 w-72 bg-surface shadow-pop"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
            <SidebarContent mobile onNavigate={onMobileClose} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  </>
);
export default Sidebar;

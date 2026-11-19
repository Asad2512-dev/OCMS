// The frame around every logged-in page: sidebar on the left, top bar, and the page content.
import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { cn } from '../../utils/cn.js';
import { Spinner } from '../ui/Spinner.jsx';

const STORAGE_KEY = 'univoice.sidebar.collapsed';
const readCollapsed = () => { try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; } };

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); } catch { /* ignore */ } }, [collapsed]);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="no-print">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      </div>
      <div className={cn('transition-[padding] duration-300', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Suspense fallback={<div className="flex justify-center py-24"><Spinner className="h-7 w-7" /></div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};
export default AppLayout;

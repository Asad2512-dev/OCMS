// Polls notifications every 15 seconds while logged in. Shows a toast when a new alert arrives
// and keeps the unread count for the bell. Dashboard alerts only — no email or SMS.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { notificationApi } from '../services/endpoints.js';
import { useAuth } from './AuthContext.jsx';
import { POLL_INTERVAL_MS, BELL_PREVIEW_COUNT } from '../config/constants.js';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [version, setVersion] = useState(0); // bumps when new alerts arrive, so pages can refresh
  const seen = useRef(null); // ids we have already shown

  const load = useCallback(async () => {
    try {
      const [{ notifications }, { count }] = await Promise.all([
        notificationApi.list({ limit: BELL_PREVIEW_COUNT }),
        notificationApi.unreadCount(),
      ]);
      const fresh = seen.current ? notifications.filter((n) => !n.isRead && !seen.current.has(n._id)) : [];
      fresh.forEach((n) => toast(n.message, { icon: '🔔' }));
      if (fresh.length) setVersion((v) => v + 1);
      seen.current = new Set([...(seen.current || []), ...notifications.map((n) => n._id)]);
      setItems(notifications);
      setUnread(count);
    } catch { /* silent: polling will try again */ }
  }, []);

  useEffect(() => {
    if (!user) { setItems([]); setUnread(0); seen.current = null; return undefined; }
    load();
    const timer = setInterval(() => { if (!document.hidden) load(); }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [user, load]);

  const markRead = useCallback(async (id) => {
    await notificationApi.markRead(id);
    setItems((list) => list.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    setItems((list) => list.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  }, []);

  const value = useMemo(() => ({ items, unread, version, reload: load, markRead, markAllRead }), [items, unread, version, load, markRead, markAllRead]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => useContext(NotificationContext);

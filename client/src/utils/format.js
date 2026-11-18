// Formatting helpers for dates, times and durations shown on screen.
import { LOCALE } from '../config/constants.js';
import { STRINGS } from '../config/strings.js';

const C = STRINGS.common;

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' }) : C.none);

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : C.none;

export const formatMonth = (label) => {
  const [y, m] = label.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(LOCALE, { month: 'short', year: '2-digit' });
};

// "5 min ago", "3 h ago", "2 d ago" or a date.
export const timeAgo = (d) => {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return C.justNow;
  if (mins < 60) return C.minutesAgo(mins);
  if (mins < 1440) return C.hoursAgo(Math.floor(mins / 60));
  if (mins < 10080) return C.daysAgo(Math.floor(mins / 1440));
  return formatDate(d);
};

// Hours → "18 h" or "3.5 d".
export const formatHours = (h) => {
  if (h == null) return C.none;
  return h < 48 ? C.hours(Math.round(h)) : C.days(Math.round((h / 24) * 10) / 10);
};

export const formatBytes = (b) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';

// "Dr. Imran Qureshi" → "Imran" (skips titles listed in strings.js).
export const firstName = (name = '') => name.split(' ').find((p) => p && !STRINGS.app.titles.includes(p.toLowerCase().replace(/\./g, ''))) || name;

export const greetingKey = () => {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
};

export const today = () => new Date().toISOString().slice(0, 10);

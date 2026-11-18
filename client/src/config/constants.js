// Fixed lists used by the frontend: roles, statuses, priorities, categories, routes, menus and limits.
// Keep the enum values in sync with server/config/constants.js.
import {
  LayoutDashboard, FilePlus2, FileText, Search, Bell, UserCircle, Users, Building2, Star, BarChart3, ClipboardList,
} from 'lucide-react';

export const ROLES = { ADMIN: 'admin', OFFICER: 'officer', STUDENT: 'student', TEACHER: 'teacher' };
export const COMPLAINANT_ROLES = [ROLES.STUDENT, ROLES.TEACHER];

export const STATUSES = { PENDING: 'pending', IN_PROGRESS: 'in_progress', RESOLVED: 'resolved', REJECTED: 'rejected' };
export const PRIORITIES = { URGENT: 'urgent', NORMAL: 'normal' };
export const CATEGORIES = { HOSTEL: 'hostel', LIBRARY: 'library', ACCOUNTS: 'accounts', IT: 'it', ACADEMICS: 'academics', OTHER: 'other' };

// Which status an officer may choose next (must match the server).
export const OFFICER_NEXT_STATUS = { pending: 'in_progress', in_progress: 'resolved' };
export const CLOSED_STATUSES = [STATUSES.RESOLVED, STATUSES.REJECTED];

// Badge colors per status / priority (Tailwind classes built from theme.js colors).
export const STATUS_STYLES = {
  pending: 'bg-warning-soft text-warning ring-warning-border',
  in_progress: 'bg-info-soft text-info ring-info-border',
  resolved: 'bg-success-soft text-success ring-success-border',
  rejected: 'bg-danger-soft text-danger ring-danger-border',
};
export const STATUS_DOT = { pending: 'bg-warning', in_progress: 'bg-info', resolved: 'bg-success', rejected: 'bg-danger' };
export const PRIORITY_STYLES = {
  urgent: 'bg-danger-soft text-danger ring-danger-border',
  normal: 'bg-surface-subtle text-ink-soft ring-surface-border',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  UI_PREVIEW: '/ui-preview',
  UNAUTHORIZED: '/unauthorized',
  DASHBOARD: '/dashboard',
  COMPLAINTS: '/complaints',
  NEW_COMPLAINT: '/complaints/new',
  COMPLAINT: (id = ':id') => `/complaints/${id}`,
  TRACK: '/track',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  USERS: '/admin/users',
  DEPARTMENTS: '/admin/departments',
  FEEDBACK: '/admin/feedback',
  REPORTS: '/admin/reports',
};

// Sidebar menu per role. "label" is a key in strings.menu.
const item = (label, path, icon) => ({ label, path, icon });
export const MENU = {
  student: [
    item('dashboard', ROUTES.DASHBOARD, LayoutDashboard),
    item('newComplaint', ROUTES.NEW_COMPLAINT, FilePlus2),
    item('myComplaints', ROUTES.COMPLAINTS, FileText),
    item('track', ROUTES.TRACK, Search),
    item('notifications', ROUTES.NOTIFICATIONS, Bell),
    item('profile', ROUTES.PROFILE, UserCircle),
  ],
  officer: [
    item('dashboard', ROUTES.DASHBOARD, LayoutDashboard),
    item('assigned', ROUTES.COMPLAINTS, ClipboardList),
    item('track', ROUTES.TRACK, Search),
    item('notifications', ROUTES.NOTIFICATIONS, Bell),
    item('profile', ROUTES.PROFILE, UserCircle),
  ],
  admin: [
    item('dashboard', ROUTES.DASHBOARD, LayoutDashboard),
    item('allComplaints', ROUTES.COMPLAINTS, FileText),
    item('users', ROUTES.USERS, Users),
    item('departments', ROUTES.DEPARTMENTS, Building2),
    item('feedback', ROUTES.FEEDBACK, Star),
    item('reports', ROUTES.REPORTS, BarChart3),
    item('notifications', ROUTES.NOTIFICATIONS, Bell),
    item('profile', ROUTES.PROFILE, UserCircle),
  ],
};
MENU.teacher = MENU.student;

// Base address of the backend API. "/api" works with the Vite proxy in development.
export const API_URL = import.meta.env.VITE_API_URL || '/api';

// Attachment upload rules (must match the server).
export const UPLOAD = {
  FIELD: 'attachments',
  MAX_FILES: 3,
  MAX_SIZE_MB: 5,
  ACCEPT: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'application/pdf': ['.pdf'] },
};

export const LIMITS = { TITLE_MAX: 150, DESCRIPTION_MAX: 3000, REMARK_MAX: 1000, COMMENT_MAX: 1000, PASSWORD_MIN: 6 };

export const POLL_INTERVAL_MS = 15000;      // notifications refresh
export const TEXT_CHECK_DELAY_MS = 600;     // live profanity check delay
export const PAGE_SIZE = 10;
export const SEARCH_DEBOUNCE_MS = 400;
export const BELL_PREVIEW_COUNT = 6;
export const COMPLAINT_ID_PATTERN = /^[A-Za-z]+-\d{4}-\d+$/;

export const SORTS = ['newest', 'oldest', 'priority', 'status', 'updated'];
export const RATING_MAX = 5;

// Quick-login buttons on the login page (for the project demo / viva).
// Set VITE_SHOW_DEMO=false in client/.env to hide them.
export const SHOW_DEMO = import.meta.env.VITE_SHOW_DEMO !== 'false';
export const DEMO_PASSWORD = 'Password@123';
export const DEMO_ACCOUNTS = [
  { role: ROLES.ADMIN, email: 'admin@univoice.edu.pk' },
  { role: ROLES.OFFICER, email: 'it.officer@univoice.edu.pk' },
  { role: ROLES.STUDENT, email: 'ali.student@univoice.edu.pk' },
  { role: ROLES.TEACHER, email: 'sana.teacher@univoice.edu.pk' },
];

// Date display format.
export const LOCALE = 'en-GB';

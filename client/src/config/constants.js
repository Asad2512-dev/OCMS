// Fixed lists used by the frontend: roles, statuses, priorities, categories, departments and page routes.
// Keep these in sync with server/config/constants.js.

export const ROLES = {
  ADMIN: 'admin',
  OFFICER: 'officer',
  STUDENT: 'student',
  TEACHER: 'teacher',
};

export const STATUSES = {};
export const PRIORITIES = {};
export const CATEGORIES = {};
export const DEPARTMENTS = {};

export const ROUTES = {
  HOME: '/',
  // e.g. LOGIN: '/login', DASHBOARD: '/dashboard'
};

// Base address of the backend API (comes from client/.env).
export const API_URL = import.meta.env.VITE_API_URL || '/api';

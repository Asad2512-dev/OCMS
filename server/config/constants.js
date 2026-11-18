// All fixed lists (enums) used by the backend: roles, statuses, priorities, categories, departments.
// Keep these in sync with client/src/config/constants.js.

export const ROLES = {
  ADMIN: 'admin',
  OFFICER: 'officer',
  STUDENT: 'student',
  TEACHER: 'teacher',
};

export const STATUSES = {
  // e.g. PENDING: 'pending', IN_PROGRESS: 'in_progress', RESOLVED: 'resolved'
};

export const PRIORITIES = {
  // e.g. LOW: 'low', MEDIUM: 'medium', HIGH: 'high'
};

export const CATEGORIES = {
  // e.g. ACADEMIC: 'academic', HOSTEL: 'hostel'
};

export const DEPARTMENTS = {
  // e.g. CS: 'computer_science'
};

// All fixed lists (enums) used by the backend: roles, statuses, priorities, categories, departments.
// Keep these in sync with client/src/config/constants.js.

export const ROLES = {
  ADMIN: 'admin',
  OFFICER: 'officer',
  STUDENT: 'student',
  TEACHER: 'teacher',
};

export const STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export const PRIORITIES = {
  URGENT: 'urgent',
  NORMAL: 'normal',
};

export const CATEGORIES = {
  HOSTEL: 'hostel',
  LIBRARY: 'library',
  ACCOUNTS: 'accounts',
  IT: 'it',
  ACADEMICS: 'academics',
  OTHER: 'other',
};

// Default departments created by the seed script.
export const DEPARTMENTS = {
  HOSTEL: 'Hostel',
  LIBRARY: 'Library',
  ACCOUNTS: 'Accounts',
  IT: 'IT',
  ACADEMICS: 'Academics',
};

// Roles allowed to submit a complaint anonymously.
export const ANONYMOUS_ALLOWED_ROLES = [ROLES.TEACHER];

// Complaint ID format: CMP-<year>-<4 digit number>
export const COMPLAINT_ID = { PREFIX: 'CMP', PAD: 4 };

export const RATING = { MIN: 1, MAX: 5 };

export const SECURITY = {
  BCRYPT_ROUNDS: 10,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 300,
  JSON_LIMIT: '1mb',
};

// Helper: turns an enum object into an array of its values (for Mongoose "enum").
export const values = (obj) => Object.values(obj);

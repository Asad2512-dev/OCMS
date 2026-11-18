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

// Readable names for statuses (used in notification text).
export const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

// Which status an officer may move a complaint to, from each current status.
export const OFFICER_TRANSITIONS = {
  pending: ['in_progress'],
  in_progress: ['resolved'],
  resolved: [],
  rejected: [],
};

// Statuses after which a complaint is closed (no more assigning/updating).
export const CLOSED_STATUSES = ['resolved', 'rejected'];

// Roles that can submit complaints.
export const COMPLAINANT_ROLES = [ROLES.STUDENT, ROLES.TEACHER];

// Roles allowed to submit a complaint anonymously.
export const ANONYMOUS_ALLOWED_ROLES = [ROLES.TEACHER];

// Complaint ID format: CMP-<year>-<4 digit number>
export const COMPLAINT_ID = { PREFIX: 'CMP', PAD: 4 };

// Attachment upload rules.
export const UPLOAD = {
  FIELD: 'attachments',
  MAX_FILES: 3,
  MAX_SIZE_MB: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  ALLOWED_EXT: ['.jpg', '.jpeg', '.png', '.pdf'],
  DIR: 'uploads',
};

// List / pagination settings.
export const PAGINATION = { DEFAULT_LIMIT: 10, MAX_LIMIT: 50 };

// Allowed ?sort= values for complaint lists and the database sort each one uses.
export const COMPLAINT_SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  priority: { priority: -1, createdAt: -1 }, // "urgent" sorts before "normal"
  status: { status: 1, createdAt: -1 },
  updated: { updatedAt: -1 },
};

export const TEXT_LIMITS = { TITLE_MAX: 150, DESCRIPTION_MAX: 3000, REMARK_MAX: 1000, COMMENT_MAX: 1000, SEARCH_MAX: 100 };

// Name shown instead of the submitter for anonymous complaints.
export const ANONYMOUS_LABEL = 'Anonymous Teacher';

export const RATING = { MIN: 1, MAX: 5 };

export const AUTH = {
  COOKIE_NAME: 'univoice_token',
  COOKIE_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days, keep in line with JWT_EXPIRES_IN
  PASSWORD_MIN: 6,
  LOGIN_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  LOGIN_LIMIT_MAX: 10, // failed+successful attempts per IP per window
};

export const SECURITY = {
  BCRYPT_ROUNDS: 10,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 300,
  JSON_LIMIT: '1mb',
};

// Helper: turns an enum object into an array of its values (for Mongoose "enum").
export const values = (obj) => Object.values(obj);

// Analytics / reports settings.
export const ANALYTICS = {
  TREND_MONTHS: 12,
  TIMEZONE: 'Asia/Karachi',
  CSV_FILENAME: 'univoice-report',
  MAX_EXPORT_ROWS: 10000,
};

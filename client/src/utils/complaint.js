// Small helpers about complaints used by many screens.
import { STRINGS } from '../config/strings.js';
import { API_URL } from '../config/constants.js';

// Name to show for the submitter ("Anonymous Teacher" when hidden).
export const submitterName = (c) => c.submitterName || c.submittedBy?.name || STRINGS.complaint.anonymous;

// Full URL of an uploaded file (works with the dev proxy or an absolute API address).
export const fileUrl = (path) => (/^https?:/.test(API_URL) ? new URL(API_URL).origin + path : path);

export const isImage = (mimetype = '') => mimetype.startsWith('image/');

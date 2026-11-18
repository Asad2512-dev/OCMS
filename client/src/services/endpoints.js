// All backend calls in one place, grouped by feature. Screens import these instead of using URLs directly.
import api from './api.js';
import { API_URL, UPLOAD } from '../config/constants.js';

// Removes empty values so URLs stay clean (?status=pending instead of ?status=&search=).
const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== false));

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  session: () => api.get('/auth/session'),
  changePassword: (body) => api.patch('/auth/change-password', body),
};

export const complaintApi = {
  list: (params) => api.get('/complaints', { params: clean(params) }),
  get: (id) => api.get(`/complaints/${id}`),
  track: (code) => api.get(`/complaints/track/${encodeURIComponent(code)}`),
  create: ({ files = [], ...fields }) => {
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.append(k, v));
    files.forEach((f) => form.append(UPLOAD.FIELD, f));
    return api.post('/complaints', form);
  },
  checkText: (text) => api.post('/complaints/check-text', { text }),
  assign: (id, body) => api.patch(`/complaints/${id}/assign`, body),
  reject: (id, reason) => api.patch(`/complaints/${id}/reject`, { reason }),
  updateStatus: (id, status, remark) => api.patch(`/complaints/${id}/status`, { status, remark }),
  addRemark: (id, text) => api.post(`/complaints/${id}/remarks`, { text }),
  getFeedback: (id) => api.get(`/complaints/${id}/feedback`),
  giveFeedback: (id, body) => api.post(`/complaints/${id}/feedback`, body),
};

export const notificationApi = {
  list: (params) => api.get('/notifications', { params: clean(params) }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const userApi = {
  list: (params) => api.get('/users', { params: clean(params) }),
  create: (body) => api.post('/users', body),
  update: (id, body) => api.patch(`/users/${id}`, body),
  setStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),
  resetPassword: (id, newPassword) => api.patch(`/users/${id}/reset-password`, { newPassword }),
};

export const departmentApi = {
  list: (all = false) => api.get('/departments', { params: all ? { all: true } : {} }),
  create: (body) => api.post('/departments', body),
  update: (id, body) => api.patch(`/departments/${id}`, body),
  remove: (id) => api.delete(`/departments/${id}`),
};

export const analyticsApi = {
  summary: (range) => api.get('/analytics/summary', { params: clean(range) }),
  departments: (range) => api.get('/analytics/departments', { params: clean(range) }),
  trend: () => api.get('/analytics/trend'),
  yearly: () => api.get('/analytics/yearly'),
  officers: (range) => api.get('/analytics/officers', { params: clean(range) }),
  ratings: () => api.get('/analytics/ratings'),
  me: () => api.get('/analytics/me'),
};

export const feedbackApi = { list: (params) => api.get('/feedback', { params: clean(params) }) };

// Downloads the CSV report as a file.
export const reportApi = {
  exportCsv: async (params) => {
    const blob = await api.get('/reports/export', { params: clean(params), responseType: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `univoice-report-${new Date().toISOString().slice(0, 10)}.csv` });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  },
};

export { API_URL };

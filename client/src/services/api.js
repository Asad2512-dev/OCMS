// The ONE axios client for the whole app. Sends the login cookie with every request
// and turns server errors into a simple readable message (error.message).
import axios from 'axios';
import { API_URL } from '../config/constants.js';
import { STRINGS } from '../config/strings.js';

export const AUTH_EXPIRED_EVENT = 'univoice:auth-expired';

const api = axios.create({ baseURL: API_URL, withCredentials: true });

api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const data = error.response?.data;
    const err = new Error(data?.message || (error.response ? STRINGS.common.errorTitle : STRINGS.common.networkError));
    err.status = error.response?.status;
    err.errors = data?.errors || [];
    // Tell the app the session is gone (except for the initial "who am I" and login calls).
    const url = error.config?.url || '';
    if (err.status === 401 && !url.includes('/auth/me') && !url.includes('/auth/login')) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(err);
  }
);

export default api;

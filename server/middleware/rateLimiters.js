// Extra-strict request limits for sensitive routes such as login.
import rateLimit from 'express-rate-limit';
import { AUTH } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

export const loginLimiter = rateLimit({
  windowMs: AUTH.LOGIN_LIMIT_WINDOW_MS,
  max: AUTH.LOGIN_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: MESSAGES.AUTH.TOO_MANY_LOGINS },
});

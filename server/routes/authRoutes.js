// Auth endpoints: login, logout, current user, change password.
import { Router } from 'express';
import { login, logout, getMe, getSession, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter } from '../middleware/rateLimiters.js';
import { loginRules, changePasswordRules } from '../validators/authValidators.js';

const router = Router();

router.post('/login', loginLimiter, loginRules, validate, login);
router.post('/logout', logout);
router.get('/session', getSession);
router.get('/me', protect, getMe);
router.patch('/change-password', protect, changePasswordRules, validate, changePassword);

export default router;

// User management endpoints (admin only).
import { Router } from 'express';
import * as U from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as R from '../validators/userValidators.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect, authorize(ROLES.ADMIN));

router.route('/')
  .get(R.listUserRules, validate, U.listUsers)
  .post(R.createUserRules, validate, U.createUser);
router.route('/:id')
  .get(R.userIdRule, validate, U.getUser)
  .patch(R.updateUserRules, validate, U.updateUser);
router.patch('/:id/status', R.statusRules, validate, U.setUserStatus);
router.patch('/:id/reset-password', R.resetPasswordRules, validate, U.resetPassword);

export default router;

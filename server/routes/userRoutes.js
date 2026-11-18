// User management endpoints (admin only).
import { Router } from 'express';
import { createUser, listUsers } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createUserRules } from '../validators/userValidators.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));
router.route('/').get(listUsers).post(createUserRules, validate, createUser);

export default router;

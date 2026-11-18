// Department endpoints: list for everyone logged in, create/edit/delete for admin.
import { Router } from 'express';
import { body, param } from 'express-validator';
import * as D from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const V = MESSAGES.VALIDATION;
const idParam = param('id').isMongoId().withMessage(V.ID_INVALID);
const fields = [
  body('description').optional().isString().trim(),
  body('isActive').optional().isBoolean().withMessage(MESSAGES.ERRORS.VALIDATION).toBoolean(),
];

const router = Router();
router.use(protect);

router.get('/', D.listDepartments);
router.post('/', authorize(ROLES.ADMIN), body('name').trim().notEmpty().withMessage(V.NAME_REQUIRED), ...fields, validate, D.createDepartment);
router.patch('/:id', authorize(ROLES.ADMIN), idParam, body('name').optional().trim().notEmpty().withMessage(V.NAME_REQUIRED), ...fields, validate, D.updateDepartment);
router.delete('/:id', authorize(ROLES.ADMIN), idParam, validate, D.deleteDepartment);

export default router;

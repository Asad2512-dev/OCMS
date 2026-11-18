// Input rules for admin user management (create, update, status, reset password, list).
import { body, param, query } from 'express-validator';
import { AUTH, ROLES, values } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const V = MESSAGES.VALIDATION;
const isRole = (...roles) => (value, { req }) => roles.includes(req.body.role);

const idParam = param('id').isMongoId().withMessage(V.ID_INVALID);
const email = (chain) => chain.trim().notEmpty().withMessage(V.EMAIL_REQUIRED).bail().isEmail().withMessage(V.EMAIL_INVALID).toLowerCase();
const password = (field) => body(field).isString().withMessage(V.PASSWORD_REQUIRED).bail().isLength({ min: AUTH.PASSWORD_MIN }).withMessage(V.PASSWORD_SHORT);

export const createUserRules = [
  body('name').trim().notEmpty().withMessage(V.NAME_REQUIRED),
  email(body('email')),
  password('password'),
  body('role').isIn(values(ROLES)).withMessage(V.ROLE_INVALID),
  body('department')
    .if(isRole(ROLES.OFFICER))
    .notEmpty().withMessage(V.DEPARTMENT_REQUIRED_OFFICER).bail()
    .isMongoId().withMessage(V.DEPARTMENT_INVALID),
  body('rollNo').if(isRole(ROLES.STUDENT)).trim().notEmpty().withMessage(V.ROLL_NO_REQUIRED),
  body('employeeId')
    .if(isRole(ROLES.ADMIN, ROLES.OFFICER, ROLES.TEACHER))
    .trim().notEmpty().withMessage(V.EMPLOYEE_ID_REQUIRED),
];

// Every field is optional on update; the controller checks the final combination.
export const updateUserRules = [
  idParam,
  body('name').optional().trim().notEmpty().withMessage(V.NAME_REQUIRED),
  email(body('email').optional()),
  body('role').optional().isIn(values(ROLES)).withMessage(V.ROLE_INVALID),
  body('department').optional({ values: 'falsy' }).isMongoId().withMessage(V.DEPARTMENT_INVALID),
  body('rollNo').optional().trim(),
  body('employeeId').optional().trim(),
];

export const statusRules = [idParam, body('isActive').isBoolean().withMessage(MESSAGES.ERRORS.VALIDATION).toBoolean()];
export const resetPasswordRules = [idParam, password('newPassword')];
export const userIdRule = [idParam];

export const listUserRules = [
  query('role').optional().isIn(values(ROLES)).withMessage(V.ROLE_INVALID),
  query('page').optional().isInt({ min: 1 }).withMessage(V.PAGE_INVALID),
  query('limit').optional().isInt({ min: 1 }).withMessage(V.PAGE_INVALID),
];

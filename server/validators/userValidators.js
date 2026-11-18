// Input rules for the admin "create user" request.
import { body } from 'express-validator';
import { AUTH, ROLES, values } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const V = MESSAGES.VALIDATION;
const isRole = (...roles) => (value, { req }) => roles.includes(req.body.role);

export const createUserRules = [
  body('name').trim().notEmpty().withMessage(V.NAME_REQUIRED),
  body('email').trim().notEmpty().withMessage(V.EMAIL_REQUIRED).bail().isEmail().withMessage(V.EMAIL_INVALID).toLowerCase(),
  body('password').isString().withMessage(V.PASSWORD_REQUIRED).bail().isLength({ min: AUTH.PASSWORD_MIN }).withMessage(V.PASSWORD_SHORT),
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

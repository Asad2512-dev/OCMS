// Input rules for login and change-password requests.
import { body } from 'express-validator';
import { AUTH } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const V = MESSAGES.VALIDATION;

export const loginRules = [
  body('email').trim().notEmpty().withMessage(V.EMAIL_REQUIRED).bail().isEmail().withMessage(V.EMAIL_INVALID).toLowerCase(),
  body('password').isString().withMessage(V.PASSWORD_REQUIRED).bail().notEmpty().withMessage(V.PASSWORD_REQUIRED),
];

export const changePasswordRules = [
  body('currentPassword').isString().withMessage(V.CURRENT_PASSWORD_REQUIRED).bail().notEmpty().withMessage(V.CURRENT_PASSWORD_REQUIRED),
  body('newPassword')
    .isString().notEmpty().withMessage(V.NEW_PASSWORD_REQUIRED).bail()
    .isLength({ min: AUTH.PASSWORD_MIN }).withMessage(V.PASSWORD_SHORT),
  body('confirmPassword').custom((value, { req }) => value === req.body.newPassword).withMessage(V.CONFIRM_PASSWORD_MISMATCH),
];

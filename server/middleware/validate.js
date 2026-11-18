// Runs after express-validator rules and returns all problems in one 400 response.
import { validationResult } from 'express-validator';
import { MESSAGES } from '../config/messages.js';

export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  res.status(400).json({ success: false, message: MESSAGES.ERRORS.VALIDATION, errors });
};

// Runs after express-validator rules and returns all problems in one 400 response.
// Any files uploaded with the failed request are deleted.
import { validationResult } from 'express-validator';
import { MESSAGES } from '../config/messages.js';
import { removeRequestFiles } from '../utils/files.js';

export const validate = async (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  await removeRequestFiles(req);
  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  res.status(400).json({ success: false, message: MESSAGES.ERRORS.VALIDATION, errors });
};

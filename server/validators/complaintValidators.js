// Input rules for complaint, feedback and notification requests.
import { body, param, query } from 'express-validator';
import { values, CATEGORIES, PRIORITIES, STATUSES, COMPLAINT_SORTS, TEXT_LIMITS, RATING } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const V = MESSAGES.VALIDATION;

export const idParam = [param('id').isMongoId().withMessage(V.ID_INVALID)];

export const createComplaintRules = [
  body('title').trim().notEmpty().withMessage(V.TITLE_REQUIRED).bail()
    .isLength({ max: TEXT_LIMITS.TITLE_MAX }).withMessage(V.TITLE_LONG),
  body('description').trim().notEmpty().withMessage(V.DESCRIPTION_REQUIRED).bail()
    .isLength({ max: TEXT_LIMITS.DESCRIPTION_MAX }).withMessage(V.DESCRIPTION_LONG),
  body('category').optional({ values: 'falsy' }).isIn(values(CATEGORIES)).withMessage(V.CATEGORY_INVALID),
  body('isAnonymous').optional().isBoolean().withMessage(MESSAGES.ERRORS.VALIDATION).toBoolean(),
];

export const listRules = [
  query('page').optional().isInt({ min: 1 }).withMessage(V.PAGE_INVALID),
  query('limit').optional().isInt({ min: 1 }).withMessage(V.PAGE_INVALID),
  query('sort').optional().isIn(Object.keys(COMPLAINT_SORTS)).withMessage(V.SORT_INVALID),
  query('status').optional().isIn(values(STATUSES)).withMessage(V.STATUS_INVALID),
  query('category').optional().isIn(values(CATEGORIES)).withMessage(V.CATEGORY_INVALID),
  query('priority').optional().isIn(values(PRIORITIES)).withMessage(V.PRIORITY_INVALID),
  query('search').optional().isString().trim().isLength({ max: TEXT_LIMITS.SEARCH_MAX }),
];

export const assignRules = [
  ...idParam,
  body('department').isMongoId().withMessage(V.DEPARTMENT_INVALID),
  body('assignedTo').isMongoId().withMessage(V.OFFICER_INVALID),
  body('priority').optional().isIn(values(PRIORITIES)).withMessage(V.PRIORITY_INVALID),
];

export const rejectRules = [
  ...idParam,
  body('reason').isString().withMessage(V.REASON_REQUIRED).bail().trim().notEmpty().withMessage(V.REASON_REQUIRED).bail()
    .isLength({ max: TEXT_LIMITS.REMARK_MAX }).withMessage(V.REMARK_LONG),
];

export const statusRules = [
  ...idParam,
  body('status').isIn(values(STATUSES)).withMessage(V.STATUS_INVALID),
  body('remark').optional({ values: 'falsy' }).isString().trim().isLength({ max: TEXT_LIMITS.REMARK_MAX }).withMessage(V.REMARK_LONG),
];

export const remarkRules = [
  ...idParam,
  body('text').isString().withMessage(V.REMARK_REQUIRED).bail().trim().notEmpty().withMessage(V.REMARK_REQUIRED).bail()
    .isLength({ max: TEXT_LIMITS.REMARK_MAX }).withMessage(V.REMARK_LONG),
];

export const feedbackRules = [
  ...idParam,
  body('rating').isInt({ min: RATING.MIN, max: RATING.MAX }).withMessage(V.RATING_RANGE).toInt(),
  body('comment').optional({ values: 'falsy' }).isString().trim().isLength({ max: TEXT_LIMITS.COMMENT_MAX }).withMessage(V.COMMENT_LONG),
];

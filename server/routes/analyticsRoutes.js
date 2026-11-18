// Analytics and report endpoints (admin; officers can see their own workload).
import { Router } from 'express';
import { query } from 'express-validator';
import * as A from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildCsv } from '../services/reportService.js';
import { ROLES, ANALYTICS } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const dateRules = [
  query('from').optional({ values: 'falsy' }).isISO8601().withMessage(MESSAGES.ANALYTICS.DATE_INVALID),
  query('to').optional({ values: 'falsy' }).isISO8601().withMessage(MESSAGES.ANALYTICS.DATE_INVALID),
  validate,
];

export const analyticsRouter = Router();
analyticsRouter.use(protect);
analyticsRouter.get('/me', authorize(ROLES.OFFICER), A.myWorkload);
analyticsRouter.use(authorize(ROLES.ADMIN));
analyticsRouter.get('/summary', dateRules, A.summary);
analyticsRouter.get('/departments', dateRules, A.departments);
analyticsRouter.get('/trend', A.trend);
analyticsRouter.get('/yearly', A.yearly);
analyticsRouter.get('/officers', dateRules, A.officers);
analyticsRouter.get('/ratings', A.ratings);

export const reportRouter = Router();
// GET /api/reports/export?from=2026-01-01&to=2026-12-31&status=&department=
reportRouter.get('/export', protect, authorize(ROLES.ADMIN), dateRules, asyncHandler(async (req, res) => {
  const csv = await buildCsv(req.query);
  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${ANALYTICS.CSV_FILENAME}-${stamp}.csv"`);
  res.send(csv);
}));

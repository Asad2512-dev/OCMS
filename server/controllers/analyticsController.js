// Analytics endpoints for the admin dashboard and reports (all use MongoDB aggregation).
import { asyncHandler } from '../utils/asyncHandler.js';
import * as A from '../services/analyticsService.js';
import { MESSAGES } from '../config/messages.js';

const send = (res, data) => res.json({ success: true, message: MESSAGES.ANALYTICS.LOADED, data });
const range = (q) => ({ from: q.from, to: q.to });

export const summary = asyncHandler(async (req, res) => send(res, await A.getSummary(range(req.query))));
export const departments = asyncHandler(async (req, res) => send(res, await A.getDepartmentPerformance(range(req.query))));
export const trend = asyncHandler(async (req, res) => send(res, await A.getMonthlyTrend()));
export const yearly = asyncHandler(async (req, res) => send(res, await A.getYearlySummary()));
export const officers = asyncHandler(async (req, res) => send(res, await A.getOfficerWorkload(range(req.query))));
export const ratings = asyncHandler(async (req, res) => send(res, await A.getRatings()));

// GET /api/analytics/me — an officer's own workload numbers
export const myWorkload = asyncHandler(async (req, res) => {
  const [mine] = await A.getOfficerWorkload({}, req.user._id.toString());
  send(res, mine);
});

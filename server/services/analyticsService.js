// MongoDB aggregation pipelines that power the admin dashboard and reports.
import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { STATUSES, ROLES, ANALYTICS } from '../config/constants.js';

const HOUR_MS = 3600000;
const TZ = ANALYTICS.TIMEZONE;

// ---------- reusable stages ----------

// Optional date range on createdAt. "to" includes the whole day.
export const dateMatch = ({ from, to } = {}) => {
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(new Date(to).getTime() + 24 * HOUR_MS - 1);
  return Object.keys(range).length ? { createdAt: range } : {};
};

// Adds "resolvedAt" (from statusHistory) and "resolutionHours".
export const resolutionStages = [
  {
    $addFields: {
      resolvedAt: {
        $max: {
          $map: {
            input: { $filter: { input: '$statusHistory', cond: { $eq: ['$$this.status', STATUSES.RESOLVED] } } },
            in: '$$this.date',
          },
        },
      },
    },
  },
  {
    $addFields: {
      resolutionHours: {
        $cond: [{ $ifNull: ['$resolvedAt', false] }, { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, HOUR_MS] }, null],
      },
    },
  },
];

const countIf = (status) => ({ $sum: { $cond: [{ $eq: ['$status', status] }, 1, 0] } });
const statusCounts = {
  total: { $sum: 1 },
  pending: countIf(STATUSES.PENDING),
  inProgress: countIf(STATUSES.IN_PROGRESS),
  resolved: countIf(STATUSES.RESOLVED),
  rejected: countIf(STATUSES.REJECTED),
  avgResolutionHours: { $avg: '$resolutionHours' },
};
const round = (n, d = 1) => (n == null ? null : Math.round(n * 10 ** d) / 10 ** d);
const toMap = (rows) => Object.fromEntries(rows.map((r) => [r._id ?? 'none', r.count]));

// ---------- 1. totals by status, priority, category ----------
export const getSummary = async (range) => {
  const [res] = await Complaint.aggregate([
    { $match: dateMatch(range) },
    ...resolutionStages,
    {
      $facet: {
        overall: [{ $group: { _id: null, ...statusCounts, unassigned: { $sum: { $cond: [{ $ifNull: ['$assignedTo', false] }, 0, 1] } } } }],
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        byCategory: [{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
      },
    },
  ]);
  const o = res.overall[0] || {};
  const [rating] = await Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]);
  return {
    total: o.total || 0,
    pending: o.pending || 0,
    inProgress: o.inProgress || 0,
    resolved: o.resolved || 0,
    rejected: o.rejected || 0,
    unassigned: o.unassigned || 0,
    avgResolutionHours: round(o.avgResolutionHours),
    resolutionRate: o.total ? round((o.resolved / o.total) * 100) : 0,
    avgRating: round(rating?.avg),
    feedbackCount: rating?.count || 0,
    byStatus: toMap(res.byStatus),
    byPriority: toMap(res.byPriority),
    byCategory: toMap(res.byCategory),
  };
};

// ---------- 2. department performance + average rating ----------
const ratingsByDepartment = () =>
  Feedback.aggregate([
    { $lookup: { from: 'complaints', localField: 'complaint', foreignField: '_id', as: 'c' } },
    { $unwind: '$c' },
    { $group: { _id: '$c.department', avgRating: { $avg: '$rating' }, ratings: { $sum: 1 } } },
  ]);

export const getDepartmentPerformance = async (range) => {
  const [rows, ratings] = await Promise.all([
    Complaint.aggregate([
      { $match: { ...dateMatch(range), department: { $ne: null } } },
      ...resolutionStages,
      { $group: { _id: '$department', ...statusCounts } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'd' } },
      { $unwind: '$d' },
      { $sort: { total: -1 } },
    ]),
    ratingsByDepartment(),
  ]);
  return rows.map((r) => {
    const rt = ratings.find((x) => x._id?.equals(r._id));
    return {
      departmentId: r._id,
      department: r.d.name,
      total: r.total, pending: r.pending, inProgress: r.inProgress, resolved: r.resolved, rejected: r.rejected,
      resolutionRate: r.total ? round((r.resolved / r.total) * 100) : 0,
      avgResolutionHours: round(r.avgResolutionHours),
      avgRating: round(rt?.avgRating),
      ratings: rt?.ratings || 0,
    };
  });
};

// ---------- 3. monthly trend (last 12 months) ----------
export const getMonthlyTrend = async (months = ANALYTICS.TREND_MONTHS) => {
  const start = new Date();
  start.setDate(1); start.setHours(0, 0, 0, 0);
  start.setMonth(start.getMonth() - (months - 1));

  const rows = await Complaint.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { y: { $year: { date: '$createdAt', timezone: TZ } }, m: { $month: { date: '$createdAt', timezone: TZ } } },
        total: { $sum: 1 },
        resolved: countIf(STATUSES.RESOLVED),
        rejected: countIf(STATUSES.REJECTED),
      },
    },
  ]);

  // Fill months with no complaints so the chart has all 12 points.
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const y = d.getFullYear(); const m = d.getMonth() + 1;
    const r = rows.find((x) => x._id.y === y && x._id.m === m) || {};
    return { year: y, month: m, label: `${y}-${String(m).padStart(2, '0')}`, total: r.total || 0, resolved: r.resolved || 0, rejected: r.rejected || 0 };
  });
};

// ---------- 4. yearly summary ----------
export const getYearlySummary = async () => {
  const rows = await Complaint.aggregate([
    ...resolutionStages,
    { $group: { _id: { $year: { date: '$createdAt', timezone: TZ } }, ...statusCounts } },
    { $sort: { _id: -1 } },
  ]);
  return rows.map(({ _id, avgResolutionHours, ...r }) => ({
    year: _id, ...r, avgResolutionHours: round(avgResolutionHours), resolutionRate: r.total ? round((r.resolved / r.total) * 100) : 0,
  }));
};

// ---------- 5. officer workload ----------
export const getOfficerWorkload = async (range, officerId) => {
  const officerFilter = { role: ROLES.OFFICER, ...(officerId && { _id: new mongoose.Types.ObjectId(officerId) }) };
  const [officers, rows] = await Promise.all([
    User.find(officerFilter).populate('department', 'name').lean(),
    Complaint.aggregate([
      { $match: { ...dateMatch(range), assignedTo: { $ne: null }, ...(officerId && { assignedTo: new mongoose.Types.ObjectId(officerId) }) } },
      ...resolutionStages,
      { $group: { _id: '$assignedTo', ...statusCounts, urgentOpen: { $sum: { $cond: [{ $and: [{ $eq: ['$priority', 'urgent'] }, { $in: ['$status', [STATUSES.PENDING, STATUSES.IN_PROGRESS]] }] }, 1, 0] } } } },
    ]),
  ]);
  return officers
    .map((o) => {
      const r = rows.find((x) => x._id.equals(o._id)) || {};
      return {
        officerId: o._id, name: o.name, email: o.email, department: o.department?.name || null, isActive: o.isActive,
        total: r.total || 0, pending: r.pending || 0, inProgress: r.inProgress || 0, resolved: r.resolved || 0,
        open: (r.pending || 0) + (r.inProgress || 0), urgentOpen: r.urgentOpen || 0,
        avgResolutionHours: round(r.avgResolutionHours),
      };
    })
    .sort((a, b) => b.open - a.open);
};

// ---------- 6. ratings ----------
export const getRatings = async () => {
  const [byDept, dist] = await Promise.all([
    ratingsByDepartment().then((rows) => mongoose.model('Department').populate(rows, { path: '_id', select: 'name' })),
    Feedback.aggregate([{ $group: { _id: '$rating', count: { $sum: 1 } } }]),
  ]);
  return {
    byDepartment: byDept.filter((r) => r._id).map((r) => ({ department: r._id.name, avgRating: round(r.avgRating), ratings: r.ratings })),
    distribution: [1, 2, 3, 4, 5].map((star) => ({ rating: star, count: dist.find((d) => d._id === star)?.count || 0 })),
  };
};

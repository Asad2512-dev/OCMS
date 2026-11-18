// Builds the CSV report (date range + optional filters). Anonymous submitters are never revealed.
import Complaint from '../models/Complaint.js';
import Feedback from '../models/Feedback.js';
import { dateMatch, resolutionStages } from './analyticsService.js';
import { ANONYMOUS_LABEL, ANALYTICS, STATUSES, values } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';
import mongoose from 'mongoose';

// Puts quotes around a value and blocks spreadsheet formula injection (=, +, -, @).
const cell = (v) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};
const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export const buildCsv = async ({ from, to, status, department }) => {
  const match = { ...dateMatch({ from, to }) };
  if (values(STATUSES).includes(status)) match.status = status;
  if (mongoose.isValidObjectId(department)) match.department = new mongoose.Types.ObjectId(department);

  const rows = await Complaint.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $limit: ANALYTICS.MAX_EXPORT_ROWS },
    ...resolutionStages,
    { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'dept' } },
    { $lookup: { from: 'users', localField: 'submittedBy', foreignField: '_id', as: 'by' } },
    { $lookup: { from: 'users', localField: 'assignedTo', foreignField: '_id', as: 'officer' } },
  ]);
  const ratings = await Feedback.find({ complaint: { $in: rows.map((r) => r._id) } }).lean();

  const lines = rows.map((r) => {
    const by = r.by[0];
    const rating = ratings.find((f) => f.complaint.equals(r._id))?.rating;
    return [
      r.complaintId, r.title, r.category, r.dept[0]?.name || MESSAGES.REPORT.UNASSIGNED, r.priority, r.status,
      r.isAnonymous ? ANONYMOUS_LABEL : by?.name, r.isAnonymous ? '' : by?.role,
      r.officer[0]?.name || '', day(r.createdAt), day(r.resolvedAt),
      r.resolutionHours == null ? '' : r.resolutionHours.toFixed(1), rating ?? '',
    ].map(cell).join(',');
  });
  // ﻿ makes Excel open the file as UTF-8 (so Urdu text shows correctly).
  return `﻿${[MESSAGES.REPORT.HEADERS.map(cell).join(','), ...lines].join('\r\n')}`;
};

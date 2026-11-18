// Complaint actions: submit, list, view, and the admin/officer workflow (assign, reject, update status, remarks).
// All assignment is manual by the admin — there is no automatic routing.
import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isAbusive } from '../utils/profanity.js';
import { complaintView } from '../utils/complaintView.js';
import { toAttachments } from '../middleware/upload.js';
import { notify, notifyAdmins } from '../services/notificationService.js';
import { findComplaints, findVisibleComplaint, populateComplaint } from '../services/complaintQuery.js';
import {
  ROLES, STATUSES, STATUS_LABELS, OFFICER_TRANSITIONS, CLOSED_STATUSES, ANONYMOUS_ALLOWED_ROLES,
} from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const M = MESSAGES.COMPLAINT;

// ---------- small helpers ----------

const ensureOpen = (complaint) => {
  if (CLOSED_STATUSES.includes(complaint.status)) throw new AppError(M.CLOSED, 400);
};

// Changes status and records who did it and when.
const setStatus = (complaint, status, userId) => {
  complaint.status = status;
  complaint.statusHistory.push({ status, by: userId });
};

const ownerOf = (complaint) => complaint.submittedBy?._id || complaint.submittedBy;

// Saves, reloads the related names, and sends the response.
const respond = async (res, complaint, user, message, code = 200) => {
  await populateComplaint(complaint);
  res.status(code).json({ success: true, message, complaint: complaintView(complaint, user) });
};

// ---------- complainant ----------

// POST /api/complaints  (student, teacher)
export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, isAnonymous = false } = req.body;

  if (isAnonymous && !ANONYMOUS_ALLOWED_ROLES.includes(req.user.role)) {
    throw new AppError(MESSAGES.VALIDATION.ANONYMOUS_NOT_ALLOWED, 400);
  }
  if (isAbusive(title, description)) throw new AppError(M.PROFANITY, 400);

  const complaint = await Complaint.create({
    title, description, category, isAnonymous,
    submittedBy: req.user._id,
    attachments: toAttachments(req.files),
  });

  await notify(req.user._id, complaint._id, MESSAGES.NOTIFY.SUBMITTED(complaint.complaintId));
  await notifyAdmins(complaint._id, MESSAGES.NOTIFY.NEW_FOR_ADMIN(complaint.complaintId));
  await respond(res, complaint, req.user, M.CREATED, 201);
});

// ---------- everyone (scoped by role) ----------

// GET /api/complaints  — students/teachers: own; officers: assigned to them; admin: all
export const listComplaints = asyncHandler(async (req, res) => {
  const { items, pagination } = await findComplaints(req.user, req.query);
  res.json({ success: true, message: M.LIST, pagination, complaints: items.map((c) => complaintView(c, req.user)) });
});

// GET /api/complaints/:id
export const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await findVisibleComplaint(req.user, req.params.id);
  res.json({ success: true, message: M.DETAIL, complaint: complaintView(complaint, req.user) });
});

// ---------- admin ----------

// Checks the department is active and the officer is an active officer of that department.
const checkAssignment = async (departmentId, officerId) => {
  const [dept, officer] = await Promise.all([
    Department.findOne({ _id: departmentId, isActive: true }),
    User.findOne({ _id: officerId, role: ROLES.OFFICER, isActive: true }),
  ]);
  if (!dept) throw new AppError(M.DEPARTMENT_INACTIVE, 404);
  if (!officer) throw new AppError(M.OFFICER_NOT_FOUND, 404);
  if (officer.department?.toString() !== dept._id.toString()) throw new AppError(M.OFFICER_WRONG_DEPARTMENT, 400);
  return { dept, officer };
};

// PATCH /api/complaints/:id/assign  { department, assignedTo, priority? }
export const assignComplaint = asyncHandler(async (req, res) => {
  const complaint = await findVisibleComplaint(req.user, req.params.id, { populate: false });
  ensureOpen(complaint);
  const { dept, officer } = await checkAssignment(req.body.department, req.body.assignedTo);

  complaint.department = dept._id;
  complaint.assignedTo = officer._id;
  if (req.body.priority) complaint.priority = req.body.priority;
  await complaint.save();

  await notify(ownerOf(complaint), complaint._id, MESSAGES.NOTIFY.ASSIGNED(complaint.complaintId, dept.name));
  await notify(officer._id, complaint._id, MESSAGES.NOTIFY.ASSIGNED_TO_OFFICER(complaint.complaintId));
  await respond(res, complaint, req.user, M.ASSIGNED);
});

// PATCH /api/complaints/:id/reject  { reason }
export const rejectComplaint = asyncHandler(async (req, res) => {
  const complaint = await findVisibleComplaint(req.user, req.params.id, { populate: false });
  ensureOpen(complaint);

  setStatus(complaint, STATUSES.REJECTED, req.user._id);
  complaint.remarks.push({ by: req.user._id, text: req.body.reason });
  await complaint.save();

  await notify(ownerOf(complaint), complaint._id, MESSAGES.NOTIFY.REJECTED(complaint.complaintId, req.body.reason));
  await respond(res, complaint, req.user, M.REJECTED);
});

// ---------- officer ----------

// PATCH /api/complaints/:id/status  { status, remark? }  — pending → in_progress → resolved
export const updateStatus = asyncHandler(async (req, res) => {
  const complaint = await findVisibleComplaint(req.user, req.params.id, { populate: false });
  const { status, remark } = req.body;

  if (!OFFICER_TRANSITIONS[complaint.status]?.includes(status)) throw new AppError(M.BAD_TRANSITION, 400);

  setStatus(complaint, status, req.user._id);
  if (remark) complaint.remarks.push({ by: req.user._id, text: remark });
  await complaint.save();

  await notify(ownerOf(complaint), complaint._id, MESSAGES.NOTIFY.STATUS(complaint.complaintId, STATUS_LABELS[status]));
  await respond(res, complaint, req.user, M.STATUS_UPDATED);
});

// POST /api/complaints/:id/remarks  { text }  — assigned officer (or admin)
export const addRemark = asyncHandler(async (req, res) => {
  const complaint = await findVisibleComplaint(req.user, req.params.id, { populate: false });
  ensureOpen(complaint);

  complaint.remarks.push({ by: req.user._id, text: req.body.text });
  await complaint.save();

  await notify(ownerOf(complaint), complaint._id, MESSAGES.NOTIFY.REMARK(complaint.complaintId));
  await respond(res, complaint, req.user, M.REMARK_ADDED, 201);
});

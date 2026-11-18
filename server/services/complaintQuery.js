// Builds database queries for complaints: who may see what (scope), filters, search, sort and pagination.
import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import AppError from '../utils/AppError.js';
import { ROLES, PAGINATION, COMPLAINT_SORTS, values, STATUSES, CATEGORIES, PRIORITIES } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

// Fields loaded with every complaint (the owner's details are hidden later for anonymous complaints).
const POPULATE = [
  { path: 'submittedBy', select: 'name email role rollNo employeeId' },
  { path: 'department', select: 'name' },
  { path: 'assignedTo', select: 'name email' },
  { path: 'remarks.by', select: 'name role' },
  { path: 'statusHistory.by', select: 'name role' },
];

// Which complaints a user may see at all.
export const scopeFor = (user) => {
  if (user.role === ROLES.ADMIN) return {};
  if (user.role === ROLES.OFFICER) return { assignedTo: user._id };
  return { submittedBy: user._id };
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Filters everyone may use: status, category, priority, search.
const commonFilters = ({ status, category, priority, search }) => {
  const f = {};
  if (values(STATUSES).includes(status)) f.status = status;
  if (values(CATEGORIES).includes(category)) f.category = category;
  if (values(PRIORITIES).includes(priority)) f.priority = priority;
  if (search) {
    // Search never looks at the submitter, so anonymous complaints can't be found by name.
    const rx = new RegExp(escapeRegex(search), 'i');
    f.$or = [{ title: rx }, { description: rx }, { complaintId: rx }];
  }
  return f;
};

// Extra filters only the admin may use.
const adminFilters = ({ department, assignedTo, unassigned }) => {
  const f = {};
  const isId = mongoose.isValidObjectId;
  if (department && isId(department)) f.department = department;
  if (assignedTo && isId(assignedTo)) f.assignedTo = assignedTo;
  if (unassigned === 'true') f.assignedTo = null;
  return f;
};

export const buildFilter = (user, query) => ({
  ...(user.role === ROLES.ADMIN ? adminFilters(query) : {}),
  ...commonFilters(query),
  ...scopeFor(user), // applied last so it can never be overridden
});

export const paging = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT, 1), PAGINATION.MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
};

export const findComplaints = async (user, query) => {
  const filter = buildFilter(user, query);
  const { page, limit, skip } = paging(query);
  const sort = COMPLAINT_SORTS[query.sort] || COMPLAINT_SORTS.newest;
  const [items, total] = await Promise.all([
    Complaint.find(filter).sort(sort).skip(skip).limit(limit).populate(POPULATE),
    Complaint.countDocuments(filter),
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

// Loads one complaint the user is allowed to see, or throws 404 (we don't reveal that it exists).
export const findVisibleComplaint = async (user, id, { populate = true, code } = {}) => {
  const q = Complaint.findOne({ ...(code ? { complaintId: code } : { _id: id }), ...scopeFor(user) });
  const complaint = populate ? await q.populate(POPULATE) : await q;
  if (!complaint) throw new AppError(MESSAGES.COMPLAINT.NOT_FOUND, 404);
  return complaint;
};

export const populateComplaint = (complaint) => complaint.populate(POPULATE);

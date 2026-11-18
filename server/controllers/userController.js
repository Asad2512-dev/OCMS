// Admin-only user management: create, list, view, edit, activate/deactivate, reset password.
// There is no public sign-up: the admin creates every account.
import mongoose from 'mongoose';
import User from '../models/User.js';
import Department from '../models/Department.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { userView } from '../utils/userView.js';
import { paging } from '../services/complaintQuery.js';
import { ROLES } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const U = MESSAGES.USER;
const escapeRegex = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ensureDepartment = async (id) => {
  if (!(await Department.exists({ _id: id }))) throw new AppError(U.DEPARTMENT_NOT_FOUND, 404);
};

// Keeps only the ID fields that make sense for the role.
const applyRoleFields = (user, { department, rollNo, employeeId }) => {
  const isStudent = user.role === ROLES.STUDENT;
  user.department = user.role === ROLES.OFFICER ? (department ?? user.department) : undefined;
  user.rollNo = isStudent ? (rollNo ?? user.rollNo) : undefined;
  user.employeeId = isStudent ? undefined : (employeeId ?? user.employeeId);
};

const loadUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(U.NOT_FOUND, 404);
  return user;
};

const sendUser = async (res, user, message, code = 200) => {
  await user.populate('department', 'name');
  res.status(code).json({ success: true, message, user: userView(user) });
};

// POST /api/users
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (role === ROLES.OFFICER) await ensureDepartment(req.body.department);

  const user = new User({ name, email, password, role });
  applyRoleFields(user, req.body);
  await user.save();
  await sendUser(res, user, U.CREATED, 201);
});

// GET /api/users?role=&department=&search=&isActive=&page=&limit=
export const listUsers = asyncHandler(async (req, res) => {
  const { role, department, search, isActive } = req.query;
  const filter = {};
  if (Object.values(ROLES).includes(role)) filter.role = role;
  if (mongoose.isValidObjectId(department)) filter.department = department;
  if (isActive === 'true' || isActive === 'false') filter.isActive = isActive === 'true';
  if (search) {
    const rx = new RegExp(escapeRegex(String(search)), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { rollNo: rx }, { employeeId: rx }];
  }
  const { page, limit, skip } = paging(req.query);
  const [users, total] = await Promise.all([
    User.find(filter).populate('department', 'name').sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({
    success: true, message: U.LIST, count: users.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    users: users.map(userView),
  });
});

// GET /api/users/:id
export const getUser = asyncHandler(async (req, res) => {
  await sendUser(res, await loadUser(req.params.id), U.DETAIL);
});

// PATCH /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const user = await loadUser(req.params.id);
  const isSelf = user._id.equals(req.user._id);
  if (isSelf && req.body.role && req.body.role !== user.role) throw new AppError(U.CANNOT_CHANGE_SELF, 400);

  ['name', 'email', 'role'].forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
  if (user.role === ROLES.OFFICER && req.body.department) await ensureDepartment(req.body.department);
  applyRoleFields(user, req.body);
  await user.save(); // model validation checks e.g. officers must have a department
  await sendUser(res, user, U.UPDATED);
});

// PATCH /api/users/:id/status  { isActive }
export const setUserStatus = asyncHandler(async (req, res) => {
  const user = await loadUser(req.params.id);
  if (user._id.equals(req.user._id)) throw new AppError(U.CANNOT_CHANGE_SELF, 400);
  user.isActive = req.body.isActive;
  await user.save();
  await sendUser(res, user, user.isActive ? U.ACTIVATED : U.DEACTIVATED);
});

// PATCH /api/users/:id/reset-password  { newPassword }
export const resetPassword = asyncHandler(async (req, res) => {
  const user = await loadUser(req.params.id);
  user.password = req.body.newPassword; // hashed by the model
  await user.save();
  res.json({ success: true, message: U.PASSWORD_RESET });
});

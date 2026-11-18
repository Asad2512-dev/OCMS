// Admin-only user management. There is no public sign-up: the admin creates every account.
import mongoose from 'mongoose';
import User from '../models/User.js';
import Department from '../models/Department.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { userView } from '../utils/userView.js';
import { ROLES } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

// POST /api/users
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, rollNo, employeeId } = req.body;
  const isOfficer = role === ROLES.OFFICER;

  if (isOfficer && !(await Department.exists({ _id: department }))) {
    throw new AppError(MESSAGES.USER.DEPARTMENT_NOT_FOUND, 404);
  }

  const user = await User.create({
    name, email, password, role,
    department: isOfficer ? department : undefined,
    rollNo: role === ROLES.STUDENT ? rollNo : undefined,
    employeeId: role === ROLES.STUDENT ? undefined : employeeId,
  });
  res.status(201).json({ success: true, message: MESSAGES.USER.CREATED, user: userView(user) });
});

// GET /api/users  (optional ?role=officer&department=<id>)
export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (Object.values(ROLES).includes(req.query.role)) filter.role = req.query.role;
  if (mongoose.isValidObjectId(req.query.department)) filter.department = req.query.department;
  const users = await User.find(filter).populate('department', 'name').sort('-createdAt');
  res.json({ success: true, message: MESSAGES.USER.LIST, count: users.length, users: users.map(userView) });
});

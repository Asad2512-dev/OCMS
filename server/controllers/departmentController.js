// Department management: list (everyone), create / edit / delete (admin).
import Department from '../models/Department.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const D = MESSAGES.DEPARTMENT;

const loadDepartment = async (id) => {
  const dept = await Department.findById(id);
  if (!dept) throw new AppError(D.NOT_FOUND, 404);
  return dept;
};

// GET /api/departments — active only; admin can add ?all=true. Includes officer & complaint counts.
export const listDepartments = asyncHandler(async (req, res) => {
  const showAll = req.user.role === ROLES.ADMIN && req.query.all === 'true';
  const departments = await Department.find(showAll ? {} : { isActive: true }).sort('name').lean();
  const [officers, complaints] = await Promise.all([
    User.aggregate([{ $match: { role: ROLES.OFFICER } }, { $group: { _id: '$department', n: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$department', n: { $sum: 1 } } }]),
  ]);
  const count = (list, id) => list.find((x) => x._id?.toString() === id.toString())?.n || 0;
  res.json({
    success: true, message: D.LIST,
    departments: departments.map((d) => ({ ...d, officerCount: count(officers, d._id), complaintCount: count(complaints, d._id) })),
  });
});

// POST /api/departments  { name, description? }
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const department = await Department.create({ name, description });
  res.status(201).json({ success: true, message: D.CREATED, department });
});

// PATCH /api/departments/:id  { name?, description?, isActive? }
export const updateDepartment = asyncHandler(async (req, res) => {
  const dept = await loadDepartment(req.params.id);
  ['name', 'description', 'isActive'].forEach((f) => { if (req.body[f] !== undefined) dept[f] = req.body[f]; });
  await dept.save();
  res.json({ success: true, message: D.UPDATED, department: dept });
});

// DELETE /api/departments/:id — only if no officers or complaints use it
export const deleteDepartment = asyncHandler(async (req, res) => {
  const dept = await loadDepartment(req.params.id);
  const inUse = (await User.exists({ department: dept._id })) || (await Complaint.exists({ department: dept._id }));
  if (inUse) throw new AppError(D.IN_USE, 409);
  await dept.deleteOne();
  res.json({ success: true, message: D.DELETED });
});

// Department endpoints. For now: list departments (admin uses this to pick a department when assigning).
import { Router } from 'express';
import Department from '../models/Department.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { MESSAGES } from '../config/messages.js';

const router = Router();

// GET /api/departments — active departments, any logged-in user
router.get('/', protect, asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).sort('name');
  res.json({ success: true, message: MESSAGES.DEPARTMENT.LIST, departments });
}));

export default router;

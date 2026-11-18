// Shapes a user object for API responses (never includes the password).
export const userView = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  department: u.department,
  rollNo: u.rollNo,
  employeeId: u.employeeId,
  isActive: u.isActive,
  createdAt: u.createdAt,
});

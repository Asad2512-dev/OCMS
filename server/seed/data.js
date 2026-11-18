// Sample data used by the seed script: departments, users and complaints.
import { ROLES, DEPARTMENTS, CATEGORIES, PRIORITIES, STATUSES } from '../config/constants.js';

export const DEFAULT_PASSWORD = 'Password@123';

export const departments = [
  { name: DEPARTMENTS.HOSTEL, description: 'Hostel accommodation, mess and maintenance', category: CATEGORIES.HOSTEL },
  { name: DEPARTMENTS.LIBRARY, description: 'Books, study rooms and library services', category: CATEGORIES.LIBRARY },
  { name: DEPARTMENTS.ACCOUNTS, description: 'Fees, challans, refunds and scholarships', category: CATEGORIES.ACCOUNTS },
  { name: DEPARTMENTS.IT, description: 'Wi-Fi, LMS, portal and computer labs', category: CATEGORIES.IT },
  { name: DEPARTMENTS.ACADEMICS, description: 'Classes, exams, results and timetable', category: CATEGORIES.ACADEMICS },
];

export const admin = { name: 'System Admin', email: 'admin@univoice.edu.pk', role: ROLES.ADMIN, employeeId: 'EMP-0001' };

// One officer per department (email is built from the department name).
export const officerFor = (dept, i) => ({
  name: `${dept.name} Officer`,
  email: `${dept.name.toLowerCase()}.officer@univoice.edu.pk`,
  role: ROLES.OFFICER,
  department: dept._id,
  employeeId: `EMP-01${String(i + 1).padStart(2, '0')}`,
});

export const students = [
  { name: 'Ali Raza', email: 'ali.student@univoice.edu.pk', rollNo: 'NUML-S26-001' },
  { name: 'Ayesha Khan', email: 'ayesha.student@univoice.edu.pk', rollNo: 'NUML-S26-002' },
  { name: 'Usman Tariq', email: 'usman.student@univoice.edu.pk', rollNo: 'NUML-S26-003' },
].map((s) => ({ ...s, role: ROLES.STUDENT }));

export const teachers = [
  { name: 'Dr. Sana Malik', email: 'sana.teacher@univoice.edu.pk', employeeId: 'EMP-0201' },
  { name: 'Prof. Bilal Ahmed', email: 'bilal.teacher@univoice.edu.pk', employeeId: 'EMP-0202' },
].map((t) => ({ ...t, role: ROLES.TEACHER }));

// [title, description, category, priority, status]
export const complaints = [
  ['Water leakage in Room 12', 'The bathroom ceiling has been leaking for a week.', CATEGORIES.HOSTEL, PRIORITIES.URGENT, STATUSES.PENDING],
  ['Mess food quality', 'Dinner quality has dropped noticeably this month.', CATEGORIES.HOSTEL, PRIORITIES.NORMAL, STATUSES.IN_PROGRESS],
  ['Broken fan in hostel B', 'Ceiling fan in room B-7 is not working.', CATEGORIES.HOSTEL, PRIORITIES.NORMAL, STATUSES.RESOLVED],
  ['Library closes too early', 'Please extend library hours during exams.', CATEGORIES.LIBRARY, PRIORITIES.NORMAL, STATUSES.PENDING],
  ['Missing reference books', 'Data Structures reference books are unavailable.', CATEGORIES.LIBRARY, PRIORITIES.NORMAL, STATUSES.RESOLVED],
  ['Noisy study area', 'Group discussions disturb the silent zone.', CATEGORIES.LIBRARY, PRIORITIES.NORMAL, STATUSES.REJECTED],
  ['Fee challan not generated', 'My semester challan is not showing on the portal.', CATEGORIES.ACCOUNTS, PRIORITIES.URGENT, STATUSES.IN_PROGRESS],
  ['Scholarship refund delayed', 'Refund has been pending for two months.', CATEGORIES.ACCOUNTS, PRIORITIES.URGENT, STATUSES.PENDING],
  ['Late fee charged wrongly', 'I paid on time but was charged a late fee.', CATEGORIES.ACCOUNTS, PRIORITIES.NORMAL, STATUSES.RESOLVED],
  ['Wi-Fi down in Block C', 'No internet in Block C since Monday.', CATEGORIES.IT, PRIORITIES.URGENT, STATUSES.IN_PROGRESS],
  ['LMS login error', 'Getting "invalid session" error on LMS.', CATEGORIES.IT, PRIORITIES.NORMAL, STATUSES.PENDING],
  ['Lab PCs outdated', 'Computer Lab 2 PCs are too slow for programming.', CATEGORIES.IT, PRIORITIES.NORMAL, STATUSES.PENDING],
  ['Result not uploaded', 'Mid-term result for OOP is still not uploaded.', CATEGORIES.ACADEMICS, PRIORITIES.URGENT, STATUSES.PENDING],
  ['Timetable clash', 'Two of my courses are scheduled at the same time.', CATEGORIES.ACADEMICS, PRIORITIES.NORMAL, STATUSES.RESOLVED],
  ['Classroom projector faulty', 'Projector in Room 204 flickers during lectures.', CATEGORIES.ACADEMICS, PRIORITIES.NORMAL, STATUSES.IN_PROGRESS],
];

// Sample data for the demo: departments, accounts and realistic complaint texts per category.
import { ROLES, DEPARTMENTS, CATEGORIES } from '../config/constants.js';

export const DEFAULT_PASSWORD = 'Password@123';
export const COMPLAINT_COUNT = 64; // spread over the last 12 months

export const departments = [
  { name: DEPARTMENTS.HOSTEL, description: 'Hostel accommodation, mess and maintenance', category: CATEGORIES.HOSTEL },
  { name: DEPARTMENTS.LIBRARY, description: 'Books, study rooms and library services', category: CATEGORIES.LIBRARY },
  { name: DEPARTMENTS.ACCOUNTS, description: 'Fees, challans, refunds and scholarships', category: CATEGORIES.ACCOUNTS },
  { name: DEPARTMENTS.IT, description: 'Wi-Fi, LMS, portal and computer labs', category: CATEGORIES.IT },
  { name: DEPARTMENTS.ACADEMICS, description: 'Classes, exams, results and timetable', category: CATEGORIES.ACADEMICS },
];

export const admin = { name: 'Dr. Imran Qureshi', email: 'admin@univoice.edu.pk', role: ROLES.ADMIN, employeeId: 'EMP-0001' };

const officerNames = ['Tariq Mehmood', 'Nadia Hussain', 'Khalid Javed', 'Faisal Iqbal', 'Rabia Saleem'];
export const officerFor = (dept, i) => ({
  name: officerNames[i],
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

// [title, description] per category
export const templates = {
  [CATEGORIES.HOSTEL]: [
    ['Water leakage in room ceiling', 'The bathroom ceiling in my room has been leaking for a week and the floor stays wet.'],
    ['Mess food quality has dropped', 'Dinner is often cold and the quality has dropped noticeably this month.'],
    ['Ceiling fan not working', 'The ceiling fan in my room stopped working three days ago.'],
    ['No hot water in Block B', 'Geysers in Block B have not worked since the start of winter.'],
    ['Broken window latch', 'The window latch is broken and the room cannot be locked properly.'],
    ['Pest problem in common room', 'There are cockroaches in the common room and kitchen area.'],
  ],
  [CATEGORIES.LIBRARY]: [
    ['Library closes too early during exams', 'Please extend library hours during the exam weeks.'],
    ['Reference books unavailable', 'Only one copy of the Data Structures reference book is available for 120 students.'],
    ['Noise in the silent zone', 'Group discussions are happening in the silent study area.'],
    ['Library Wi-Fi very slow', 'The library network is too slow to open research papers.'],
    ['Fine charged after returning book', 'I returned the book on time but was still charged a late fine.'],
  ],
  [CATEGORIES.ACCOUNTS]: [
    ['Fee challan not generated', 'My semester fee challan is not showing on the student portal.'],
    ['Scholarship refund delayed', 'My scholarship refund has been pending for two months.'],
    ['Late fee charged wrongly', 'I paid before the due date but a late fee was added.'],
    ['Transport fee charged twice', 'The transport fee appears twice on my fee statement.'],
    ['Salary slip shows wrong deduction', 'This month\'s salary slip shows an incorrect tax deduction.'],
  ],
  [CATEGORIES.IT]: [
    ['Wi-Fi down in Block C', 'There has been no internet in Block C since Monday.'],
    ['LMS login error', 'I get an "invalid session" error every time I log in to the LMS.'],
    ['Lab computers are outdated', 'Computers in Lab 2 are too slow to run an IDE.'],
    ['Projector cable missing in lab', 'The HDMI cable in Lab 4 is missing so slides cannot be shown.'],
    ['University email not receiving mail', 'My university email account has not received any emails for a week.'],
    ['Portal shows wrong attendance', 'The student portal shows me absent for classes I attended.'],
  ],
  [CATEGORIES.ACADEMICS]: [
    ['Mid-term result not uploaded', 'The mid-term result for Object Oriented Programming is still not uploaded.'],
    ['Timetable clash between two courses', 'Two of my registered courses are scheduled at the same time.'],
    ['Classroom projector faulty', 'The projector in Room 204 flickers during every lecture.'],
    ['Course outline not shared', 'The course outline for Software Engineering has not been shared yet.'],
    ['Exam date clash', 'Two final exams are scheduled on the same day and time.'],
    ['Classroom air conditioner not working', 'The AC in Room 110 has not worked for two weeks.'],
  ],
};

export const officerRemarks = [
  'We have received your complaint and are looking into it.',
  'A staff member has been sent to inspect the issue.',
  'The required parts have been ordered.',
  'Issue discussed with the concerned section head.',
];
export const resolveRemarks = [
  'The issue has been fixed. Please let us know if it happens again.',
  'Resolved after inspection. Thank you for reporting.',
  'Corrected in the system. You should now see the updated record.',
];
export const rejectReasons = [
  'Duplicate of an existing complaint that is already being handled.',
  'This matter is outside the scope of the university administration.',
  'Not enough detail provided. Please submit a new complaint with more information.',
];
export const feedbackComments = [
  'Quick response, thank you!', 'Resolved well but took a bit long.', 'Very helpful staff.',
  'Problem is fixed now.', 'Satisfied with the process.', 'Could have been faster.', '',
];

// Seed script (npm run seed): wipes the database and fills it with sample departments, users and complaints.
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { MESSAGES } from '../config/messages.js';
import { STATUSES } from '../config/constants.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';
import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';
import Counter from '../models/Counter.js';
import * as data from './data.js';

const clearAll = () =>
  Promise.all([User, Department, Complaint, Feedback, Notification, Counter].map((M) => M.deleteMany({})));

// User.create runs the password-hashing hook for each user.
const createUsers = (list) => User.create(list.map((u) => ({ ...u, password: data.DEFAULT_PASSWORD })));

const createComplaints = async (depts, officers, submitters) => {
  const created = [];
  for (const [i, [title, description, category, priority, status]] of data.complaints.entries()) {
    const deptIndex = depts.findIndex((d) => d.category === category);
    const officer = officers[deptIndex];
    const submitter = submitters[i % submitters.length];
    const history = [{ status: STATUSES.PENDING, by: submitter._id }];
    if (status !== STATUSES.PENDING) history.push({ status, by: officer._id });

    // Sequential so complaint IDs come out in order.
    // eslint-disable-next-line no-await-in-loop
    const c = await Complaint.create({
      title, description, category, priority, status,
      submittedBy: submitter._id,
      isAnonymous: submitter.role === 'teacher' && i % 2 === 0,
      department: depts[deptIndex].doc._id,
      assignedTo: status === STATUSES.PENDING ? undefined : officer._id,
      remarks: status === STATUSES.PENDING ? [] : [{ by: officer._id, text: 'Looking into this.' }],
      statusHistory: history,
    });
    created.push(c);
  }
  return created;
};

const printCredentials = (users) => {
  console.log(`\n${MESSAGES.SEED.CREDENTIALS} (password for all: ${data.DEFAULT_PASSWORD})`);
  console.table(users.map((u) => ({ role: u.role, name: u.name, email: u.email })));
};

const run = async () => {
  console.log(MESSAGES.SEED.START);
  await connectDB();
  await clearAll();
  console.log(MESSAGES.SEED.CLEARED);

  const deptDocs = await Department.create(data.departments.map(({ name, description }) => ({ name, description })));
  const depts = data.departments.map((d, i) => ({ ...d, doc: deptDocs[i] }));

  const [admin] = await createUsers([data.admin]);
  const officers = await createUsers(deptDocs.map(data.officerFor));
  const students = await createUsers(data.students);
  const teachers = await createUsers(data.teachers);

  const complaints = await createComplaints(depts, officers, [...students, ...teachers]);

  console.log(`Departments: ${deptDocs.length} | Users: ${1 + officers.length + students.length + teachers.length} | Complaints: ${complaints.length}`);
  printCredentials([admin, ...officers, ...students, ...teachers]);
  console.log(MESSAGES.SEED.DONE);
};

run()
  .catch((err) => {
    console.error(MESSAGES.SEED.FAILED, err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

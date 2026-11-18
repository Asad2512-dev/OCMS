// Seed script (npm run seed): wipes the database and fills it with a realistic year of demo data.
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { MESSAGES } from '../config/messages.js';
import { STATUSES, PRIORITIES, ROLES, STATUS_LABELS } from '../config/constants.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';
import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';
import Counter from '../models/Counter.js';
import * as data from './data.js';

const DAY = 86400000;
const HOUR = 3600000;

// Small seeded random generator so every seed run produces the same demo data.
let state = 20260101;
const rand = () => { state = (state * 1103515245 + 12345) % 2147483648; return state / 2147483648; };
const pick = (list) => list[Math.floor(rand() * list.length)];
const between = (min, max) => min + rand() * (max - min);

const clearAll = () =>
  Promise.all([User, Department, Complaint, Feedback, Notification, Counter].map((M) => M.deleteMany({})));

const createUsers = (list) => User.create(list.map((u) => ({ ...u, password: data.DEFAULT_PASSWORD })));

// Older complaints are mostly closed; recent ones are mostly still open.
const pickStatus = (ageDays) => {
  const r = rand();
  if (ageDays > 30) return r < 0.78 ? STATUSES.RESOLVED : r < 0.9 ? STATUSES.REJECTED : STATUSES.IN_PROGRESS;
  if (ageDays > 7) return r < 0.45 ? STATUSES.RESOLVED : r < 0.75 ? STATUSES.IN_PROGRESS : r < 0.85 ? STATUSES.REJECTED : STATUSES.PENDING;
  return r < 0.15 ? STATUSES.RESOLVED : r < 0.5 ? STATUSES.IN_PROGRESS : STATUSES.PENDING;
};

// Builds the timeline (history, remarks) for one complaint with realistic gaps between steps.
const buildTimeline = ({ status, createdAt, submitter, officer, admin, assign }) => {
  const history = [{ status: STATUSES.PENDING, by: submitter._id, date: createdAt }];
  const remarks = [];
  let t = createdAt.getTime() + between(2, 30) * HOUR; // admin reviews within ~a day
  if (status === STATUSES.REJECTED) {
    history.push({ status, by: admin._id, date: new Date(t) });
    remarks.push({ by: admin._id, text: pick(data.rejectReasons), date: new Date(t) });
    return { history, remarks, last: t };
  }
  if (!assign) return { history, remarks, last: t };
  t += between(1, 24) * HOUR;
  history.push({ status: STATUSES.IN_PROGRESS, by: officer._id, date: new Date(t) });
  remarks.push({ by: officer._id, text: pick(data.officerRemarks), date: new Date(t) });
  if (status === STATUSES.RESOLVED) {
    t += between(6, 24 * 9) * HOUR;
    history.push({ status, by: officer._id, date: new Date(t) });
    remarks.push({ by: officer._id, text: pick(data.resolveRemarks), date: new Date(t) });
  }
  return { history, remarks, last: t };
};

const createComplaint = async ({ depts, officers, submitters, admin, now, ageDays }) => {
  const dIndex = Math.floor(rand() * depts.length);
  const dept = depts[dIndex];
  const officer = officers[dIndex];
  const submitter = pick(submitters);
  const createdAt = new Date(now - ageDays * DAY);
  const status = pickStatus(ageDays);
  const assign = status !== STATUSES.REJECTED && (status !== STATUSES.PENDING || rand() < 0.4);
  const [title, description] = pick(data.templates[dept.category]);
  const { history, remarks, last } = buildTimeline({ status, createdAt, submitter, officer, admin, assign });

  // eslint-disable-next-line no-await-in-loop
  const c = await Complaint.create({
    title, description, category: dept.category,
    priority: rand() < 0.3 ? PRIORITIES.URGENT : PRIORITIES.NORMAL,
    status,
    submittedBy: submitter._id,
    isAnonymous: submitter.role === ROLES.TEACHER && rand() < 0.5,
    department: assign || status === STATUSES.REJECTED ? dept.doc._id : undefined,
    assignedTo: assign ? officer._id : undefined,
    remarks, statusHistory: history,
  });
  // Back-date the timestamps (Mongoose would otherwise set "now").
  await Complaint.collection.updateOne({ _id: c._id }, { $set: { createdAt, updatedAt: new Date(Math.min(last, now)) } });
  return { c, submitter, createdAt, last, status };
};

const addFeedback = async ({ c, submitter, last, status }) => {
  if (status !== STATUSES.RESOLVED || rand() > 0.75) return;
  const rating = Math.max(1, Math.min(5, Math.round(between(2.6, 5.4))));
  await Feedback.create({ complaint: c._id, user: submitter._id, rating, comment: pick(data.feedbackComments) });
  await Feedback.collection.updateOne({ complaint: c._id }, { $set: { createdAt: new Date(last + DAY) } });
};

// Recent activity becomes dashboard notifications so the bell isn't empty in the demo.
const addNotifications = async (items, admin, now) => {
  const recent = items.filter((i) => now - i.last < 21 * DAY);
  const docs = recent.flatMap(({ c, submitter, status }) => [
    { user: submitter._id, complaint: c._id, message: MESSAGES.NOTIFY.STATUS(c.complaintId, STATUS_LABELS[status]), isRead: rand() < 0.4 },
    ...(c.assignedTo ? [{ user: c.assignedTo, complaint: c._id, message: MESSAGES.NOTIFY.ASSIGNED_TO_OFFICER(c.complaintId), isRead: rand() < 0.5 }] : []),
    ...(!c.assignedTo && status === STATUSES.PENDING ? [{ user: admin._id, complaint: c._id, message: MESSAGES.NOTIFY.NEW_FOR_ADMIN(c.complaintId), isRead: false }] : []),
  ]);
  await Notification.insertMany(docs);
  return docs.length;
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

  // Create oldest first so complaint IDs follow date order.
  const now = Date.now();
  const ages = Array.from({ length: data.COMPLAINT_COUNT }, () => Math.pow(rand(), 1.4) * 360) // more in recent months
    .sort((a, b) => b - a);
  const items = [];
  for (const ageDays of ages) {
    // eslint-disable-next-line no-await-in-loop
    items.push(await createComplaint({ depts, officers, submitters: [...students, ...students, ...teachers], admin, now, ageDays }));
  }
  await Promise.all(items.map(addFeedback));
  const notes = await addNotifications(items, admin, now);

  console.log(`Departments: ${deptDocs.length} | Users: ${1 + officers.length + students.length + teachers.length} | Complaints: ${items.length} | Feedback: ${await Feedback.countDocuments()} | Notifications: ${notes}`);
  printCredentials([admin, ...officers, ...students, ...teachers]);
  console.log(MESSAGES.SEED.DONE);
};

run()
  .catch((err) => {
    console.error(MESSAGES.SEED.FAILED, err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

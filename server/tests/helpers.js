// Shared test setup: an in-memory MongoDB, the Express app, a small data set and login helpers.
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

const { default: app } = await import('../app.js');
const { default: User } = await import('../models/User.js');
const { default: Department } = await import('../models/Department.js');
const { removeFiles } = await import('../utils/files.js');

export const PASSWORD = 'Password@123';
let mongo;

export const startDb = async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
};

export const stopDb = async () => {
  await mongoose.disconnect();
  await mongo?.stop();
};

// Creates departments and one user per role (two students, two officers).
export const seedBasics = async () => {
  const [it, accounts, library] = await Department.create([{ name: 'IT' }, { name: 'Accounts' }, { name: 'Library' }]);
  const mk = (u) => User.create({ password: PASSWORD, ...u });
  const users = {
    admin: await mk({ name: 'Admin User', email: 'admin@test.pk', role: 'admin', employeeId: 'E1' }),
    itOfficer: await mk({ name: 'IT Officer', email: 'it@test.pk', role: 'officer', department: it._id, employeeId: 'E2' }),
    accOfficer: await mk({ name: 'Accounts Officer', email: 'acc@test.pk', role: 'officer', department: accounts._id, employeeId: 'E3' }),
    libOfficer: await mk({ name: 'Library Officer', email: 'lib@test.pk', role: 'officer', department: library._id, employeeId: 'E4' }),
    student: await mk({ name: 'Ali Student', email: 'ali@test.pk', role: 'student', rollNo: 'S1' }),
    student2: await mk({ name: 'Ayesha Student', email: 'ayesha@test.pk', role: 'student', rollNo: 'S2' }),
    teacher: await mk({ name: 'Sana Teacher', email: 'sana@test.pk', role: 'teacher', employeeId: 'E5' }),
  };
  return { depts: { it, accounts, library }, users };
};

export const api = () => request(app);

// Logs in and returns a supertest "agent" that keeps the cookie.
export const loginAs = async (email, password = PASSWORD) => {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({ email, password });
  if (res.status !== 200) throw new Error(`login failed for ${email}: ${res.body.message}`);
  return agent;
};

// Submits a complaint as multipart form data (like the real form).
export const submit = (agent, fields, files = []) => {
  let req = agent.post('/api/complaints');
  Object.entries(fields).forEach(([k, v]) => { req = req.field(k, String(v)); });
  files.forEach(({ buffer, name, type }) => { req = req.attach('attachments', buffer, { filename: name, contentType: type }); });
  return req;
};

export const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');

// Deletes files uploaded during tests.
export const cleanUploads = async (complaints) => {
  const files = complaints.flatMap((c) => c.attachments || []).map((a) => ({ path: new URL(`..${a.url}`, import.meta.url).pathname }));
  await removeFiles(files);
};

// Integration coverage for account/department management and reporting using an isolated database.
import { startDb, stopDb, seedBasics, loginAs, api, PASSWORD, submit } from './helpers.js';

let d; let admin; let student; let officer; let teacher;
beforeAll(async () => {
  await startDb();
  d = await seedBasics();
  [admin, student, officer, teacher] = await Promise.all(
    ['admin@test.pk', 'ali@test.pk', 'it@test.pk', 'sana@test.pk'].map((email) => loginAs(email))
  );
});
afterAll(stopDb);

describe('Admin management', () => {
  let department; let account;

  test('creates an active department and rejects duplicate names', async () => {
    const res = await admin.post('/api/departments').send({ name: 'Transport', description: 'Campus buses' });
    expect(res.status).toBe(201);
    department = res.body.department;
    expect(department.isActive).toBe(true);
    expect((await admin.post('/api/departments').send({ name: 'Transport' })).status).toBe(409);
  });

  test('creates a student who can log in, without exposing the password', async () => {
    const res = await admin.post('/api/users').send({ name: 'New Student', email: 'new@test.pk', role: 'student', rollNo: 'NEW1', password: PASSWORD });
    expect(res.status).toBe(201);
    account = res.body.user;
    expect(account.password).toBeUndefined();
    expect((await (await loginAs(account.email)).get('/api/auth/me')).status).toBe(200);
  });

  test('requires a student roll number and an officer department', async () => {
    for (const fields of [{ role: 'student' }, { role: 'officer', employeeId: 'NEW2' }]) {
      expect((await admin.post('/api/users').send({ name: 'Missing fields', email: 'missing@test.pk', password: PASSWORD, ...fields })).status).toBe(400);
    }
  });

  test('creates an officer in the new department and protects departments in use', async () => {
    const res = await admin.post('/api/users').send({ name: 'New Officer', email: 'new-officer@test.pk', role: 'officer', employeeId: 'NEW2', department: department._id, password: PASSWORD });
    expect(res.status).toBe(201);
    expect(res.body.user.department.name).toBe('Transport');
    expect((await admin.delete(`/api/departments/${department._id}`)).status).toBe(409);
  });

  test('edits and filters users by role and search', async () => {
    expect((await admin.patch(`/api/users/${account.id}`).send({ name: 'Updated Student' })).status).toBe(200);
    const res = await admin.get('/api/users?role=student&search=Updated');
    expect(res.status).toBe(200);
    expect(res.body.users.map((u) => u.email)).toEqual([account.email]);
  });

  test('cannot remove a student roll number when editing', async () => {
    const res = await admin.patch(`/api/users/${account.id}`).send({ rollNo: '' });
    expect(res.status).toBe(400);
    expect((await admin.get(`/api/users/${account.id}`)).body.user.rollNo).toBe('NEW1');
  });

  test('requires an employee ID when changing a student to a teacher', async () => {
    const res = await admin.patch(`/api/users/${account.id}`).send({ role: 'teacher', employeeId: '' });
    expect(res.status).toBe(400);
    expect((await admin.get(`/api/users/${account.id}`)).body.user.role).toBe('student');
  });

  test('rejects duplicate user emails and roll numbers', async () => {
    for (const fields of [{ email: account.email, rollNo: 'UNUSED' }, { email: 'another@test.pk', rollNo: 'NEW1' }]) {
      expect((await admin.post('/api/users').send({ name: 'Duplicate', password: PASSWORD, role: 'student', ...fields })).status).toBe(409);
    }
  });

  test('deactivation blocks login and existing sessions; activation restores login', async () => {
    const session = await loginAs(account.email);
    expect((await admin.patch(`/api/users/${account.id}/status`).send({ isActive: false })).status).toBe(200);
    expect((await session.get('/api/auth/me')).status).toBe(403);
    expect((await api().post('/api/auth/login').send({ email: account.email, password: PASSWORD })).status).toBe(403);
    expect((await admin.patch(`/api/users/${account.id}/status`).send({ isActive: true })).status).toBe(200);
    expect((await (await loginAs(account.email)).get('/api/auth/me')).status).toBe(200);
  });

  test('resets a password and invalidates the old password', async () => {
    expect((await admin.patch(`/api/users/${account.id}/reset-password`).send({ newPassword: 'NewPassword@123' })).status).toBe(200);
    expect((await api().post('/api/auth/login').send({ email: account.email, password: PASSWORD })).status).toBe(401);
    expect((await (await loginAs(account.email, 'NewPassword@123')).get('/api/auth/me')).status).toBe(200);
  });

  test('prevents an admin from deactivating or demoting themselves', async () => {
    expect((await admin.patch(`/api/users/${d.users.admin._id}/status`).send({ isActive: false })).status).toBe(400);
    expect((await admin.patch(`/api/users/${d.users.admin._id}`).send({ role: 'student', rollNo: 'SELF' })).status).toBe(400);
  });

  test('hides inactive departments from assignment choices', async () => {
    expect((await admin.patch(`/api/departments/${department._id}`).send({ isActive: false })).status).toBe(200);
    expect((await admin.get('/api/departments')).body.departments.some((x) => x._id === department._id)).toBe(false);
    expect((await admin.get('/api/departments?all=true')).body.departments.some((x) => x._id === department._id)).toBe(true);
  });

  test('deletes an unused department', async () => {
    const res = await admin.post('/api/departments').send({ name: 'Unused' });
    expect((await admin.delete(`/api/departments/${res.body.department._id}`)).status).toBe(200);
  });

  test.each(['student', 'officer', 'teacher'])('%s cannot manage users or departments', async (role) => {
    const agent = { student, officer, teacher }[role];
    expect((await agent.get('/api/users')).status).toBe(403);
    expect((await agent.post('/api/departments').send({ name: 'Forbidden' })).status).toBe(403);
  });
});

describe('Reports and analytics', () => {
  let complaint;
  beforeAll(async () => {
    const res = await submit(teacher, { title: 'Anonymous library request', description: 'Please check the reference books.', category: 'library', isAnonymous: true });
    complaint = res.body.complaint;
  });

  test.each(['summary', 'departments', 'trend', 'yearly', 'officers', 'ratings'])('%s returns analytics successfully', async (endpoint) => {
    const res = await admin.get(`/api/analytics/${endpoint}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect((await student.get(`/api/analytics/${endpoint}`)).status).toBe(403);
  });

  test('exports CSV while hiding anonymous teacher identity', async () => {
    const res = await admin.get('/api/reports/export');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
    expect(res.text).toContain(complaint.complaintId);
    expect(res.text).toContain('Anonymous Teacher');
    expect(res.text).not.toContain('Sana Teacher');
    expect(res.text).not.toContain('sana@test.pk');
    expect((await officer.get('/api/reports/export')).status).toBe(403);
  });

  test('date filtering can return empty reports and rejects malformed dates', async () => {
    const range = '?from=2000-01-01&to=2000-01-31';
    expect((await admin.get(`/api/analytics/summary${range}`)).body.data.total).toBe(0);
    expect((await admin.get(`/api/reports/export${range}`)).text.trim().split('\r\n')).toHaveLength(1);
    expect((await admin.get('/api/reports/export?from=invalid')).status).toBe(400);
  });
});

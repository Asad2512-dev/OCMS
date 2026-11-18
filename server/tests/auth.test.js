// Tests for login, logout, session, change password and role-based access.
import { startDb, stopDb, seedBasics, api, loginAs, PASSWORD } from './helpers.js';
import { tc } from './cases.js';

let data;
beforeAll(async () => { await startDb(); data = await seedBasics(); });
afterAll(stopDb);

const login = (email, password) => api().post('/api/auth/login').send({ email, password });

describe('Authentication', () => {
  test(tc('TC-AUTH-01'), async () => {
    const res = await login('admin@test.pk', PASSWORD);
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('admin');
    expect(res.headers['set-cookie'][0]).toMatch(/univoice_token=.+HttpOnly/i);
  });

  test(tc('TC-AUTH-02'), async () => {
    const res = await login('admin@test.pk', 'wrong-pass');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test(tc('TC-AUTH-03'), async () => {
    const res = await login('nobody@test.pk', PASSWORD);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test(tc('TC-AUTH-04'), async () => {
    const res = await login('abc', PASSWORD);
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toContain('email');
  });

  test(tc('TC-AUTH-05'), async () => {
    const res = await login('admin@test.pk', '');
    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBe('Password is required');
  });

  test(tc('TC-AUTH-06'), async () => {
    const res = await api().post('/api/auth/login').send({ email: { $ne: null }, password: { $ne: null } });
    expect(res.status).toBe(400);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test(tc('TC-AUTH-07'), async () => {
    const res = await api().get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Please log in to continue');
  });

  test(tc('TC-AUTH-08'), async () => {
    const agent = await loginAs('ali@test.pk');
    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('ali@test.pk');
    expect(res.body.user.password).toBeUndefined();
  });

  test(tc('TC-AUTH-09'), async () => {
    const agent = await loginAs('ali@test.pk');
    const out = await agent.post('/api/auth/logout');
    expect(out.status).toBe(200);
    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });

  test(tc('TC-AUTH-10'), async () => {
    const admin = await loginAs('admin@test.pk');
    await admin.patch(`/api/users/${data.users.student2._id}/status`).send({ isActive: false });
    const res = await login('ayesha@test.pk', PASSWORD);
    expect(res.status).toBe(403);
    await admin.patch(`/api/users/${data.users.student2._id}/status`).send({ isActive: true });
  });

  test(tc('TC-AUTH-11'), async () => {
    const agent = await loginAs('sana@test.pk');
    const res = await agent.patch('/api/auth/change-password').send({ currentPassword: 'nope123', newPassword: 'NewPass@1', confirmPassword: 'NewPass@1' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Current password is incorrect');
  });

  test(tc('TC-AUTH-12'), async () => {
    const agent = await loginAs('sana@test.pk');
    const res = await agent.patch('/api/auth/change-password').send({ currentPassword: PASSWORD, newPassword: 'NewPass@1', confirmPassword: 'Other@1' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBe('Passwords do not match');
  });

  test(tc('TC-AUTH-13'), async () => {
    const agent = await loginAs('sana@test.pk');
    const res = await agent.patch('/api/auth/change-password').send({ currentPassword: PASSWORD, newPassword: 'NewPass@1', confirmPassword: 'NewPass@1' });
    expect(res.status).toBe(200);
    expect((await login('sana@test.pk', 'NewPass@1')).status).toBe(200);
    expect((await login('sana@test.pk', PASSWORD)).status).toBe(401);
  });

  test(tc('TC-AUTH-14'), async () => {
    const agent = await loginAs('ali@test.pk');
    const res = await agent.get('/api/users');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('You do not have permission to do this');
  });

  test(tc('TC-AUTH-15'), async () => {
    const res = await api().post('/api/users').send({ name: 'X', email: 'x@test.pk', password: '123456', role: 'student', rollNo: 'S9' });
    expect(res.status).toBe(401);
  });
});

// Tests for the admin/officer workflow: assignment, rejection, status updates, remarks, feedback and notifications.
import { startDb, stopDb, seedBasics, loginAs, submit } from './helpers.js';
import { tc } from './cases.js';

let d; let student; let student2; let admin; let itOfficer; let libOfficer;
let c1; let c2;

beforeAll(async () => {
  await startDb();
  d = await seedBasics();
  [student, student2, admin, itOfficer, libOfficer] = await Promise.all(
    ['ali@test.pk', 'ayesha@test.pk', 'admin@test.pk', 'it@test.pk', 'lib@test.pk'].map((e) => loginAs(e))
  );
  c1 = (await submit(student, { title: 'Wi-Fi down', description: 'No internet in Block C', category: 'it' })).body.complaint;
  c2 = (await submit(student, { title: 'Library fine', description: 'Wrong fine charged', category: 'library' })).body.complaint;
});
afterAll(stopDb);

const assign = (agent, id, body) => agent.patch(`/api/complaints/${id}/assign`).send(body);
const status = (agent, id, s, remark) => agent.patch(`/api/complaints/${id}/status`).send({ status: s, remark });
const unread = async (agent) => (await agent.get('/api/notifications/unread-count')).body.count;

describe('Assignment (admin)', () => {
  test(tc('TC-ASG-04'), async () => {
    expect((await itOfficer.get(`/api/complaints/${c1._id}`)).status).toBe(404);
  });

  test(tc('TC-ASG-02'), async () => {
    const res = await assign(admin, c1._id, { department: d.depts.accounts._id, assignedTo: d.users.itOfficer._id });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/does not belong/);
  });

  test(tc('TC-ASG-03'), async () => {
    const res = await assign(student, c1._id, { department: d.depts.it._id, assignedTo: d.users.itOfficer._id });
    expect(res.status).toBe(403);
  });

  test(tc('TC-ASG-01'), async () => {
    const res = await assign(admin, c1._id, { department: d.depts.it._id, assignedTo: d.users.itOfficer._id, priority: 'urgent' });
    expect(res.status).toBe(200);
    expect(res.body.complaint.department.name).toBe('IT');
    expect(res.body.complaint.assignedTo.name).toBe('IT Officer');
    expect(res.body.complaint.priority).toBe('urgent');
  });

  test(tc('TC-ASG-05'), async () => {
    const s = await student.get('/api/notifications');
    const o = await itOfficer.get('/api/notifications');
    expect(s.body.notifications.some((n) => n.message.includes('assigned to the IT department'))).toBe(true);
    expect(o.body.notifications.some((n) => n.message.includes('assigned to you'))).toBe(true);
  });

  test(tc('TC-ASG-06'), async () => {
    const res = await admin.patch(`/api/complaints/${c2._id}/reject`).send({ reason: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBe('Please give a reason for rejecting');
  });

  test(tc('TC-ASG-07'), async () => {
    const res = await admin.patch(`/api/complaints/${c2._id}/reject`).send({ reason: 'Outside university scope' });
    expect(res.status).toBe(200);
    expect(res.body.complaint.status).toBe('rejected');
    expect(res.body.complaint.remarks.at(-1).text).toBe('Outside university scope');
    const notes = (await student.get('/api/notifications')).body.notifications;
    expect(notes.some((n) => n.message.includes('was rejected'))).toBe(true);
  });

  test(tc('TC-ASG-08'), async () => {
    const res = await assign(admin, c2._id, { department: d.depts.library._id, assignedTo: d.users.libOfficer._id });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('This complaint is already closed');
  });

  test(tc('TC-ASG-09'), async () => {
    await submit(student2, { title: 'Exam clash', description: 'Two exams same time', category: 'academics' });
    await submit(student2, { title: 'Fan broken', description: 'Room 3 fan', category: 'hostel' });
    await submit(student2, { title: 'Fee issue', description: 'Challan missing', category: 'accounts' });
    const res = await admin.get('/api/complaints?unassigned=true&sort=oldest&limit=2&page=1');
    expect(res.status).toBe(200);
    expect(res.body.complaints.length).toBeLessThanOrEqual(2);
    expect(res.body.complaints.every((c) => !c.assignedTo)).toBe(true);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 2 });
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(3);
  });
});

describe('Status update (officer)', () => {
  test(tc('TC-STS-02'), async () => {
    const res = await status(itOfficer, c1._id, 'resolved');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('This status change is not allowed');
  });

  test(tc('TC-STS-03'), async () => {
    expect((await status(libOfficer, c1._id, 'in_progress')).status).toBe(404);
  });

  test(tc('TC-STS-01'), async () => {
    const before = await unread(student);
    const res = await status(itOfficer, c1._id, 'in_progress', 'Technician sent');
    expect(res.status).toBe(200);
    expect(res.body.complaint.status).toBe('in_progress');
    expect(res.body.complaint.remarks.at(-1).text).toBe('Technician sent');
    expect(await unread(student)).toBe(before + 1);
  });

  test(tc('TC-STS-04'), async () => {
    const res = await student.get(`/api/complaints/${c1._id}`);
    expect(res.body.complaint.statusHistory.map((h) => h.status)).toEqual(['pending', 'in_progress']);
    const notes = (await student.get('/api/notifications')).body.notifications;
    expect(notes.some((n) => n.message.includes('"In Progress"'))).toBe(true);
  });

  test(tc('TC-STS-08'), async () => {
    const res = await itOfficer.post(`/api/complaints/${c1._id}/remarks`).send({ text: 'Part ordered' });
    expect(res.status).toBe(201);
    expect(res.body.complaint.remarks.at(-1)).toMatchObject({ text: 'Part ordered', by: { name: 'IT Officer' } });
  });

  test(tc('TC-FB-01'), async () => {
    const res = await student.post(`/api/complaints/${c1._id}/feedback`).send({ rating: 5 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/only after the complaint is resolved/);
  });

  test(tc('TC-STS-07'), async () => {
    expect((await status(itOfficer, c1._id, 'rejected')).status).toBe(400);
  });

  test(tc('TC-STS-05'), async () => {
    const res = await status(itOfficer, c1._id, 'resolved');
    expect(res.status).toBe(200);
    expect(res.body.complaint.status).toBe('resolved');
  });

  test(tc('TC-STS-06'), async () => {
    expect((await status(itOfficer, c1._id, 'in_progress')).status).toBe(400);
  });
});

describe('Feedback', () => {
  test(tc('TC-FB-02'), async () => {
    expect((await student2.post(`/api/complaints/${c1._id}/feedback`).send({ rating: 5 })).status).toBe(404);
  });

  test(tc('TC-FB-03'), async () => {
    const res = await student.post(`/api/complaints/${c1._id}/feedback`).send({ rating: 9 });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBe('Rating must be between 1 and 5');
  });

  test(tc('TC-FB-06'), async () => {
    const res = await student.post(`/api/complaints/${c1._id}/feedback`).send({ rating: 2, comment: 'officer is a kamina' });
    expect(res.status).toBe(400);
  });

  test(tc('TC-FB-04'), async () => {
    const res = await student.post(`/api/complaints/${c1._id}/feedback`).send({ rating: 4, comment: 'Fixed quickly' });
    expect(res.status).toBe(201);
    expect(res.body.feedback.rating).toBe(4);
  });

  test(tc('TC-FB-05'), async () => {
    const res = await student.post(`/api/complaints/${c1._id}/feedback`).send({ rating: 5 });
    expect(res.status).toBe(409);
  });
});

describe('Notifications', () => {
  let noteId;

  test(tc('TC-NTF-01'), async () => {
    expect(await unread(student)).toBeGreaterThan(0);
  });

  test(tc('TC-NTF-02'), async () => {
    const before = await unread(student);
    noteId = (await student.get('/api/notifications?unread=true')).body.notifications[0]._id;
    const res = await student.patch(`/api/notifications/${noteId}/read`);
    expect(res.body.notification.isRead).toBe(true);
    expect(await unread(student)).toBe(before - 1);
  });

  test(tc('TC-NTF-03'), async () => {
    expect((await student2.patch(`/api/notifications/${noteId}/read`)).status).toBe(404);
  });

  test(tc('TC-NTF-04'), async () => {
    await student.patch('/api/notifications/read-all');
    expect(await unread(student)).toBe(0);
  });
});

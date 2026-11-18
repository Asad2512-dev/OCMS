// Tests for complaint submission: validation, profanity filter, anonymity rules, attachments and visibility.
import { startDb, stopDb, seedBasics, loginAs, submit, PNG, cleanUploads } from './helpers.js';
import { tc } from './cases.js';

let data; let student; let student2; let teacher; let admin; let itOfficer;
const created = [];
const valid = { title: 'Projector broken', description: 'Room 5 projector does not turn on', category: 'it' };

beforeAll(async () => {
  await startDb();
  data = await seedBasics();
  [student, student2, teacher, admin, itOfficer] = await Promise.all(
    ['ali@test.pk', 'ayesha@test.pk', 'sana@test.pk', 'admin@test.pk', 'it@test.pk'].map((e) => loginAs(e))
  );
});
afterAll(async () => { await cleanUploads(created); await stopDb(); });

const ok = async (agent, fields, files) => {
  const res = await submit(agent, fields, files);
  if (res.body.complaint) created.push(res.body.complaint);
  return res;
};
const RESPECTFUL = /respectful/;

describe('Complaint submission', () => {
  let first; let anon;

  test(tc('TC-CMP-01'), async () => {
    const res = await ok(student, valid);
    expect(res.status).toBe(201);
    expect(res.body.complaint.complaintId).toMatch(/^CMP-\d{4}-\d{4}$/);
    expect(res.body.complaint.status).toBe('pending');
    first = res.body.complaint;
  });

  test(tc('TC-CMP-02'), async () => {
    const res = await ok(student, { ...valid, title: 'Second complaint' });
    const n = (id) => Number(id.split('-')[2]);
    expect(n(res.body.complaint.complaintId)).toBe(n(first.complaintId) + 1);
  });

  test(tc('TC-CMP-03'), async () => {
    const res = await submit(student, { description: 'no title' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('title');
  });

  test(tc('TC-CMP-04'), async () => {
    const res = await submit(student, { ...valid, title: 'This shit is broken' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(RESPECTFUL);
  });

  test(tc('TC-CMP-05'), async () => {
    const res = await submit(student, { ...valid, title: 'Warden is a kamina' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(RESPECTFUL);
  });

  test(tc('TC-CMP-06'), async () => {
    const res = await submit(student, { ...valid, description: 'وارڈن حرامی ہے' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(RESPECTFUL);
  });

  test(tc('TC-CMP-07'), async () => {
    const res = await submit(student, { ...valid, description: 'KUTTAAA staff' });
    expect(res.status).toBe(400);
  });

  test(tc('TC-CMP-08'), async () => {
    const res = await ok(student, { ...valid, title: 'My class assignment portal', description: 'A chor stole my bag in gali 4 near the hostel' });
    expect(res.status).toBe(201);
  });

  test(tc('TC-CMP-09'), async () => {
    const res = await submit(student, { ...valid, isAnonymous: true });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Only teachers can submit anonymous complaints');
  });

  test(tc('TC-CMP-10'), async () => {
    const res = await ok(teacher, { title: 'Salary slip issue', description: 'Wrong tax deduction this month', category: 'accounts', isAnonymous: true });
    expect(res.status).toBe(201);
    expect(res.body.complaint.isAnonymous).toBe(true);
    expect(res.body.complaint.submittedBy.email).toBe('sana@test.pk');
    anon = res.body.complaint;
  });

  test(tc('TC-CMP-11'), async () => {
    const res = await admin.get(`/api/complaints/${anon._id}`);
    const raw = JSON.stringify(res.body.complaint);
    expect(res.body.complaint.submittedBy).toBeNull();
    expect(res.body.complaint.submitterName).toBe('Anonymous Teacher');
    expect(raw).not.toContain(data.users.teacher._id.toString());
    expect(raw).not.toContain('Sana');
  });

  test(tc('TC-CMP-12'), async () => {
    const accOfficer = await loginAs('acc@test.pk');
    await admin.patch(`/api/complaints/${anon._id}/assign`).send({ department: data.depts.accounts._id, assignedTo: data.users.accOfficer._id });
    const res = await accOfficer.get(`/api/complaints/${anon._id}`);
    expect(res.status).toBe(200);
    expect(res.body.complaint.submittedBy).toBeNull();
    expect(res.body.complaint.submitterName).toBe('Anonymous Teacher');
    expect(JSON.stringify(res.body.complaint)).not.toContain(data.users.teacher._id.toString());
  });

  test(tc('TC-CMP-13'), async () => {
    const res = await admin.get('/api/complaints?search=Sana');
    expect(res.body.pagination.total).toBe(0);
  });

  test(tc('TC-CMP-14'), async () => {
    const res = await ok(student, valid, [{ buffer: PNG, name: 'photo.png', type: 'image/png' }]);
    expect(res.status).toBe(201);
    expect(res.body.complaint.attachments).toHaveLength(1);
    expect(res.body.complaint.attachments[0].url).toMatch(/^\/uploads\//);
  });

  test(tc('TC-CMP-15'), async () => {
    const res = await submit(student, valid, [{ buffer: Buffer.from('hello'), name: 'notes.txt', type: 'text/plain' }]);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Only JPG, PNG and PDF files are allowed');
  });

  test(tc('TC-CMP-16'), async () => {
    const res = await submit(student, valid, [{ buffer: Buffer.alloc(6 * 1024 * 1024), name: 'big.png', type: 'image/png' }]);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Each file must be 5 MB or smaller');
  });

  test(tc('TC-CMP-17'), async () => {
    const files = [1, 2, 3, 4].map((i) => ({ buffer: PNG, name: `${i}.png`, type: 'image/png' }));
    const res = await submit(student, valid, files);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('You can attach up to 3 files');
  });

  test(tc('TC-CMP-18'), async () => {
    const res = await submit(admin, valid);
    expect(res.status).toBe(403);
  });

  test(tc('TC-CMP-19'), async () => {
    await ok(student2, { ...valid, title: 'Ayesha complaint' });
    const res = await student.get('/api/complaints');
    expect(res.body.complaints.length).toBeGreaterThan(0);
    expect(res.body.complaints.every((c) => c.submittedBy.email === 'ali@test.pk')).toBe(true);
  });

  test(tc('TC-CMP-20'), async () => {
    const res = await student2.get(`/api/complaints/${first._id}`);
    expect(res.status).toBe(404);
  });

  test(tc('TC-CMP-21'), async () => {
    const res = await student.get('/api/complaints?status=pending&search=projector');
    expect(res.status).toBe(200);
    expect(res.body.complaints.length).toBeGreaterThan(0);
    expect(res.body.complaints.every((c) => c.status === 'pending' && /projector/i.test(c.title + c.description))).toBe(true);
  });

  test(tc('TC-CMP-22'), async () => {
    const res = await student.get(`/api/complaints/track/${first.complaintId}`);
    expect(res.status).toBe(200);
    expect(res.body.complaint._id).toBe(first._id);
    expect((await itOfficer.get(`/api/complaints/track/${first.complaintId}`)).status).toBe(404);
  });
});

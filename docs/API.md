# UniVoice API – Endpoint Guide

Base URL (local): `http://localhost:5000/api`

**How login works:** when you log in, the server saves a secure cookie called `univoice_token`. Postman and Thunder Client keep this cookie automatically, so every request after login is "logged in". Logging out deletes the cookie.

Every response has this shape:
```json
{ "success": true, "message": "…", "...data": "…" }
```
If something is wrong, `success` is `false`, and `errors` lists each invalid field.

Run `npm run seed` first. Every sample account uses the password `Password@123`.

---

## Summary

| # | Method | URL | Who can use it |
|---|--------|-----|----------------|
| 1 | GET   | `/api/health`               | Everyone |
| 2 | POST  | `/api/auth/login`           | Everyone (max 10 tries per 15 min) |
| 3 | POST  | `/api/auth/logout`          | Everyone |
| 4 | GET   | `/api/auth/me`              | Logged-in users |
| 5 | PATCH | `/api/auth/change-password` | Logged-in users |
| 6 | POST  | `/api/users`                | Admin only |
| 7 | GET   | `/api/users?role=officer&department=<id>` | Admin only |
| 8 | GET   | `/api/departments`          | Logged-in users |
| 9 | POST  | `/api/complaints`           | Student, Teacher |
| 10 | GET  | `/api/complaints`           | Everyone logged in (own / assigned / all) |
| 11 | GET  | `/api/complaints/:id`       | Everyone logged in (if allowed to see it) |
| 12 | PATCH | `/api/complaints/:id/assign` | Admin |
| 13 | PATCH | `/api/complaints/:id/reject` | Admin |
| 14 | PATCH | `/api/complaints/:id/status` | Assigned officer |
| 15 | POST | `/api/complaints/:id/remarks` | Assigned officer, Admin |
| 16 | POST | `/api/complaints/:id/feedback` | Owner (after resolved, once) |
| 17 | GET  | `/api/complaints/:id/feedback` | Everyone who can see the complaint |
| 18 | GET  | `/api/notifications?unread=true` | Logged-in users |
| 19 | GET  | `/api/notifications/unread-count` | Logged-in users |
| 20 | PATCH | `/api/notifications/:id/read` | Logged-in users (own) |
| 21 | PATCH | `/api/notifications/read-all` | Logged-in users |

---

## 1. Health check
`GET /api/health`
```json
{ "success": true, "message": "UniVoice API is running" }
```

## 2. Login
`POST /api/auth/login` · Body → raw → JSON
```json
{ "email": "admin@univoice.edu.pk", "password": "Password@123" }
```
Success (200) sets the cookie and returns:
```json
{ "success": true, "message": "Logged in successfully",
  "user": { "id": "…", "name": "System Admin", "email": "admin@univoice.edu.pk", "role": "admin" } }
```
Wrong email or password → 401 `"Invalid email or password"`. More than 10 tries in 15 minutes → 429.

## 3. Logout
`POST /api/auth/logout` (no body)
```json
{ "success": true, "message": "Logged out successfully" }
```

## 4. Get me (current user)
`GET /api/auth/me`
```json
{ "success": true, "message": "Current user loaded", "user": { "id": "…", "role": "officer", "department": { "_id": "…", "name": "IT" } } }
```
Not logged in → 401 `"Please log in to continue"`.

## 5. Change password
`PATCH /api/auth/change-password`
```json
{ "currentPassword": "Password@123", "newPassword": "MyNewPass@1", "confirmPassword": "MyNewPass@1" }
```
→ 200 `"Password changed successfully"`. Wrong current password → 400. Passwords not matching → 400 with an `errors` list.

## 6. Create user (admin)
Log in as the admin first. `POST /api/users`

Student (needs `rollNo`):
```json
{ "name": "Sara Iqbal", "email": "sara@univoice.edu.pk", "password": "Student@123", "role": "student", "rollNo": "NUML-S26-010" }
```
Teacher (needs `employeeId`):
```json
{ "name": "Dr. Hina", "email": "hina@univoice.edu.pk", "password": "Teacher@123", "role": "teacher", "employeeId": "EMP-0210" }
```
Officer (needs `employeeId` and a `department` ID. Get a department ID from the `department` field in `GET /api/users?role=officer`):
```json
{ "name": "New IT Officer", "email": "it2@univoice.edu.pk", "password": "Officer@123", "role": "officer", "employeeId": "EMP-0150", "department": "<departmentId>" }
```
→ 201 `"User created successfully"`. Email already used → 409. A non-admin user → 403 `"You do not have permission to do this"`.

## 7. List users (admin)
`GET /api/users` – all users. Add `?role=student`, `teacher`, `officer` or `admin` to show only that role, and `&department=<id>` to show the officers of one department.
```json
{ "success": true, "message": "Users loaded", "count": 3, "users": [ … ] }
```

---

## 8. Departments
`GET /api/departments` → the active departments with their `_id`s. The admin needs these IDs when assigning a complaint.

---

## Complaints

### 9. Submit a complaint (student / teacher)
`POST /api/complaints` · In Postman choose **Body → form-data** (not JSON):

| Key | Type | Example |
|-----|------|---------|
| title | Text | Wi-Fi not working in Block C |
| description | Text | No internet since Monday morning |
| category | Text | `hostel`, `library`, `accounts`, `it`, `academics` or `other` |
| isAnonymous | Text | `true` (teachers only) |
| attachments | **File** | up to 3 files, JPG/PNG/PDF, max 5 MB each (add the key 3 times for 3 files) |

→ 201, with a complaint ID like `CMP-2026-0016`. Errors you can try:
- A student sending `isAnonymous=true` → 400 "Only teachers can submit anonymous complaints"
- Offensive words in the title or description → 400 "Please keep your complaint respectful…"
- 4 files, a .txt file or a file over 5 MB → 400 with a clear message

**Anonymous complaints:** the teacher who submitted it sees their own details. Officers and the admin see `"submittedBy": null` and `"submitterName": "Anonymous"`, and the teacher's ID is removed from the history and remarks too.

### 10. List complaints
`GET /api/complaints` – each role automatically sees only what it is allowed to:
- Student / Teacher → only their own complaints
- Officer → only complaints assigned to them
- Admin → all complaints

Optional filters (add to the URL):

| Filter | Example | Who |
|--------|---------|-----|
| status | `?status=pending` (`pending`, `in_progress`, `resolved`, `rejected`) | everyone |
| search | `?search=wifi` (searches title, description and complaint ID) | everyone |
| category | `?category=it` | everyone |
| priority | `?priority=urgent` | everyone |
| sort | `?sort=newest` (`newest`, `oldest`, `priority`, `status`, `updated`) | everyone |
| page, limit | `?page=2&limit=10` (limit is at most 50) | everyone |
| department | `?department=<departmentId>` | admin |
| assignedTo | `?assignedTo=<officerId>` | admin |
| unassigned | `?unassigned=true` (not yet assigned) | admin |

Example: `GET /api/complaints?status=pending&unassigned=true&sort=oldest&page=1&limit=10`

The response includes `pagination: { page, limit, total, pages }`.

### 11. View one complaint
`GET /api/complaints/<id>` (use the `_id`, not the CMP code). If you aren't allowed to see it → 404.

### 12. Assign (admin)
`PATCH /api/complaints/<id>/assign`
```json
{ "department": "<departmentId>", "assignedTo": "<officerId>", "priority": "urgent" }
```
`priority` is optional (`urgent` or `normal`). The officer must belong to that department. You can reassign until the complaint is resolved or rejected. The complainant and the officer both get a notification.

### 13. Reject (admin)
`PATCH /api/complaints/<id>/reject`
```json
{ "reason": "This issue is outside the university's responsibility." }
```

### 14. Update status (officer)
`PATCH /api/complaints/<id>/status`
```json
{ "status": "in_progress", "remark": "Technician has been sent" }
```
Only these steps are allowed: `pending → in_progress → resolved`. `remark` is optional. Skipping a step or going backwards → 400.

### 15. Add a remark (officer / admin)
`POST /api/complaints/<id>/remarks`
```json
{ "text": "Spare part has been ordered." }
```

### 16. Give feedback (owner)
`POST /api/complaints/<id>/feedback`
```json
{ "rating": 5, "comment": "Fixed quickly, thank you!" }
```
Only the person who submitted the complaint, only after it is **resolved**, and only once (a second try → 409).

### 17. Read feedback
`GET /api/complaints/<id>/feedback` → the feedback, or `null` if there is none yet.

---

## Notifications (dashboard alerts)

Notifications are created automatically when:
- a complaint is submitted (to the complainant, and to every admin)
- a complaint is assigned (to the complainant, and to the officer)
- the status changes, a remark is added, or the complaint is rejected (to the complainant)

| Request | What it does |
|---------|--------------|
| `GET /api/notifications` | Your notifications, newest first (`?unread=true`, `?page=`, `?limit=`) |
| `GET /api/notifications/unread-count` | `{ "count": 3 }` |
| `PATCH /api/notifications/<id>/read` | Mark one as read |
| `PATCH /api/notifications/read-all` | Mark all as read |

---

### Quick test flow
1. Login as `ali.student@univoice.edu.pk` → call `GET /api/auth/me` → you see Ali.
2. As Ali, call `GET /api/users` → 403 (students aren't admins).
3. Logout → login as `admin@univoice.edu.pk` → `POST /api/users` to create a student.
4. Logout → login as the new student.
5. As a student, submit a complaint with an image (form-data).
6. As the admin, `GET /api/departments` and `GET /api/users?role=officer&department=<id>`, then assign the complaint.
7. As that officer, set the status to `in_progress` and then `resolved`.
8. As the student, check `GET /api/notifications`, then post feedback.

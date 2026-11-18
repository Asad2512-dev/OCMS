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
| 7 | GET   | `/api/users?role=student`   | Admin only |

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
`GET /api/users` – all users. Add `?role=student`, `teacher`, `officer` or `admin` to show only that role.
```json
{ "success": true, "message": "Users loaded", "count": 3, "users": [ … ] }
```

---

### Quick test flow
1. Login as `ali.student@univoice.edu.pk` → call `GET /api/auth/me` → you see Ali.
2. As Ali, call `GET /api/users` → 403 (students aren't admins).
3. Logout → login as `admin@univoice.edu.pk` → `POST /api/users` to create a student.
4. Logout → login as the new student.

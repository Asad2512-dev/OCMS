# UniVoice – Test Cases (Chapter 5)

Automated backend tests written with **Jest** and **Supertest**. They run against a temporary in-memory MongoDB, so real data is never touched.

**Run date:** 2026-11-18 · **Total:** 64 · **Passed:** 64 · **Failed:** 0

To run them again: `cd server && npm test` (or `npm run test:report` to regenerate this file).

## Authentication

| ID | Description | Input | Expected result | Actual result | Result |
|----|-------------|-------|-----------------|---------------|--------|
| TC-AUTH-01 | Login with valid credentials | admin@univoice.edu.pk / correct password | 200, success message, httpOnly cookie "univoice_token" set | As expected – 200, success message, httpOnly cookie "univoice_token" set | ✅ Pass |
| TC-AUTH-02 | Login with wrong password | valid email / wrong password | 401 "Invalid email or password" | As expected – 401 "Invalid email or password" | ✅ Pass |
| TC-AUTH-03 | Login with an email that does not exist | nobody@univoice.edu.pk | 401 with the same message as a wrong password | As expected – 401 with the same message as a wrong password | ✅ Pass |
| TC-AUTH-04 | Login with badly formatted email | email = "abc" | 400 validation error on field "email" | As expected – 400 validation error on field "email" | ✅ Pass |
| TC-AUTH-05 | Login with empty password | valid email / empty password | 400 "Password is required" | As expected – 400 "Password is required" | ✅ Pass |
| TC-AUTH-06 | NoSQL injection attempt on login | email = {"$ne": null} | 400 – operator stripped, login refused | As expected – 400 – operator stripped, login refused | ✅ Pass |
| TC-AUTH-07 | Get current user without logging in | GET /api/auth/me, no cookie | 401 "Please log in to continue" | As expected – 401 "Please log in to continue" | ✅ Pass |
| TC-AUTH-08 | Get current user after login | GET /api/auth/me with cookie | 200 with user details and no password field | As expected – 200 with user details and no password field | ✅ Pass |
| TC-AUTH-09 | Logout clears the session | POST /api/auth/logout then GET /me | Cookie cleared; /me returns 401 | As expected – Cookie cleared; /me returns 401 | ✅ Pass |
| TC-AUTH-10 | Deactivated user cannot log in | admin deactivates student, student logs in | 403 account disabled | As expected – 403 account disabled | ✅ Pass |
| TC-AUTH-11 | Change password with wrong current password | currentPassword wrong | 400 "Current password is incorrect" | As expected – 400 "Current password is incorrect" | ✅ Pass |
| TC-AUTH-12 | Change password with mismatched confirmation | newPassword ≠ confirmPassword | 400 "Passwords do not match" | As expected – 400 "Passwords do not match" | ✅ Pass |
| TC-AUTH-13 | Change password successfully | correct current, new = NewPass@1 | 200; login works with the new password | As expected – 200; login works with the new password | ✅ Pass |
| TC-AUTH-14 | Role-based access control | student calls GET /api/users (admin only) | 403 "You do not have permission to do this" | As expected – 403 "You do not have permission to do this" | ✅ Pass |
| TC-AUTH-15 | No public sign-up | POST /api/users without admin login | 401 – only admin can create accounts | As expected – 401 – only admin can create accounts | ✅ Pass |

## Complaint submission

| ID | Description | Input | Expected result | Actual result | Result |
|----|-------------|-------|-----------------|---------------|--------|
| TC-CMP-01 | Student submits a valid complaint | title, description, category = it | 201, complaintId like CMP-2026-0001, status pending | As expected – 201, complaintId like CMP-2026-0001, status pending | ✅ Pass |
| TC-CMP-02 | Complaint IDs are sequential | two complaints in a row | Second ID number = first + 1 | As expected – Second ID number = first + 1 | ✅ Pass |
| TC-CMP-03 | Submit without a title | description only | 400 validation error on "title" | As expected – 400 validation error on "title" | ✅ Pass |
| TC-CMP-04 | Profanity filter – English | title contains an English swear word | 400 "Please keep your complaint respectful…" | As expected – 400 "Please keep your complaint respectful…" | ✅ Pass |
| TC-CMP-05 | Profanity filter – Roman Urdu | title "Warden is a kamina" | 400 respectful-language message | As expected – 400 respectful-language message | ✅ Pass |
| TC-CMP-06 | Profanity filter – Urdu script | description contains "حرامی" | 400 respectful-language message | As expected – 400 respectful-language message | ✅ Pass |
| TC-CMP-07 | Profanity filter – stretched spelling | description "KUTTAAA staff" | 400 respectful-language message | As expected – 400 respectful-language message | ✅ Pass |
| TC-CMP-08 | No false positives on normal words | "My class assignment… a chor stole my bag in gali 4" | 201 – complaint accepted | As expected – 201 – complaint accepted | ✅ Pass |
| TC-CMP-09 | Student cannot submit anonymously | student, isAnonymous = true | 400 "Only teachers can submit anonymous complaints" | As expected – 400 "Only teachers can submit anonymous complaints" | ✅ Pass |
| TC-CMP-10 | Teacher submits anonymously | teacher, isAnonymous = true | 201; the teacher still sees their own details | As expected – 201; the teacher still sees their own details | ✅ Pass |
| TC-CMP-11 | Anonymous identity hidden from admin | admin opens the anonymous complaint | submittedBy = null, name "Anonymous Teacher", teacher id appears nowhere | As expected – submittedBy = null, name "Anonymous Teacher", teacher id appears nowhere | ✅ Pass |
| TC-CMP-12 | Anonymous identity hidden from officer | assigned officer opens it | submittedBy = null, "Anonymous Teacher" | As expected – submittedBy = null, "Anonymous Teacher" | ✅ Pass |
| TC-CMP-13 | Anonymous complaint cannot be found by name | admin searches the teacher's name | 0 results | As expected – 0 results | ✅ Pass |
| TC-CMP-14 | Upload a valid image | 1 PNG attachment | 201 with 1 attachment saved | As expected – 201 with 1 attachment saved | ✅ Pass |
| TC-CMP-15 | Upload a wrong file type | .txt file | 400 "Only JPG, PNG and PDF files are allowed"; nothing saved | As expected – 400 "Only JPG, PNG and PDF files are allowed"; nothing saved | ✅ Pass |
| TC-CMP-16 | Upload a file over 5 MB | 6 MB PNG | 400 "Each file must be 5 MB or smaller" | As expected – 400 "Each file must be 5 MB or smaller" | ✅ Pass |
| TC-CMP-17 | Upload more than 3 files | 4 PNG files | 400 "You can attach up to 3 files" | As expected – 400 "You can attach up to 3 files" | ✅ Pass |
| TC-CMP-18 | Admin cannot submit a complaint | admin POST /api/complaints | 403 | As expected – 403 | ✅ Pass |
| TC-CMP-19 | Users see only their own complaints | student lists complaints | Every complaint returned belongs to that student | As expected – Every complaint returned belongs to that student | ✅ Pass |
| TC-CMP-20 | User cannot open someone else's complaint | student B opens student A's complaint | 404 not found | As expected – 404 not found | ✅ Pass |
| TC-CMP-21 | Filter and search own complaints | ?status=pending&search=projector | Only matching complaints returned | As expected – Only matching complaints returned | ✅ Pass |
| TC-CMP-22 | Track a complaint by its ID | GET /api/complaints/track/<own ID> | 200 with that complaint | As expected – 200 with that complaint | ✅ Pass |

## Assignment (admin)

| ID | Description | Input | Expected result | Actual result | Result |
|----|-------------|-------|-----------------|---------------|--------|
| TC-ASG-01 | Admin assigns department, officer and priority | IT dept + IT officer + urgent | 200; department, officer and priority saved | As expected – 200; department, officer and priority saved | ✅ Pass |
| TC-ASG-02 | Officer must belong to the chosen department | Accounts dept + IT officer | 400 "officer does not belong to the selected department" | As expected – 400 "officer does not belong to the selected department" | ✅ Pass |
| TC-ASG-03 | Non-admin cannot assign | student calls /assign | 403 | As expected – 403 | ✅ Pass |
| TC-ASG-04 | Officer cannot see unassigned complaints | IT officer opens a new complaint | 404 | As expected – 404 | ✅ Pass |
| TC-ASG-05 | Assignment notifies complainant and officer | after assigning | Both have a new notification | As expected – Both have a new notification | ✅ Pass |
| TC-ASG-06 | Reject without a reason | reason empty | 400 "Please give a reason for rejecting" | As expected – 400 "Please give a reason for rejecting" | ✅ Pass |
| TC-ASG-07 | Reject with a reason | reason "Outside university scope" | 200; status rejected, reason saved as remark, complainant notified | As expected – 200; status rejected, reason saved as remark, complainant notified | ✅ Pass |
| TC-ASG-08 | Cannot assign a closed complaint | assign a rejected complaint | 400 "This complaint is already closed" | As expected – 400 "This complaint is already closed" | ✅ Pass |
| TC-ASG-09 | Admin filters, sorts and paginates | ?unassigned=true&sort=oldest&limit=2&page=1 | 200; ≤ 2 items, pagination info returned | As expected – 200; ≤ 2 items, pagination info returned | ✅ Pass |

## Status update (officer)

| ID | Description | Input | Expected result | Actual result | Result |
|----|-------------|-------|-----------------|---------------|--------|
| TC-STS-01 | Officer starts work | pending → in_progress with remark | 200; status in_progress, remark saved | As expected – 200; status in_progress, remark saved | ✅ Pass |
| TC-STS-02 | Officer cannot skip a step | pending → resolved | 400 "This status change is not allowed" | As expected – 400 "This status change is not allowed" | ✅ Pass |
| TC-STS-03 | Other officer cannot update | Library officer updates IT complaint | 404 | As expected – 404 | ✅ Pass |
| TC-STS-04 | Status change is recorded and notified | after in_progress | statusHistory grows by 1; complainant gets a notification | As expected – statusHistory grows by 1; complainant gets a notification | ✅ Pass |
| TC-STS-05 | Officer resolves the complaint | in_progress → resolved | 200; status resolved | As expected – 200; status resolved | ✅ Pass |
| TC-STS-06 | Resolved complaint cannot be reopened | resolved → in_progress | 400 | As expected – 400 | ✅ Pass |
| TC-STS-07 | Officer cannot reject | status = rejected | 400 | As expected – 400 | ✅ Pass |
| TC-STS-08 | Officer adds a remark | text "Part ordered" | 201; remark saved with officer name | As expected – 201; remark saved with officer name | ✅ Pass |

## Feedback

| ID | Description | Input | Expected result | Actual result | Result |
|----|-------------|-------|-----------------|---------------|--------|
| TC-FB-01 | Feedback before resolution | rating 5 on a pending complaint | 400 "only after the complaint is resolved" | As expected – 400 "only after the complaint is resolved" | ✅ Pass |
| TC-FB-02 | Feedback by someone who is not the owner | another student rates it | 404 (cannot see it) | As expected – 404 (cannot see it) | ✅ Pass |
| TC-FB-03 | Rating out of range | rating = 9 | 400 "Rating must be between 1 and 5" | As expected – 400 "Rating must be between 1 and 5" | ✅ Pass |
| TC-FB-04 | Owner gives feedback after resolution | rating 4, comment | 201 feedback saved | As expected – 201 feedback saved | ✅ Pass |
| TC-FB-05 | Feedback only once | second feedback | 409 "already given feedback" | As expected – 409 "already given feedback" | ✅ Pass |
| TC-FB-06 | Abusive feedback comment | comment with an abusive word | 400 respectful-language message | As expected – 400 respectful-language message | ✅ Pass |

## Notifications

| ID | Description | Input | Expected result | Actual result | Result |
|----|-------------|-------|-----------------|---------------|--------|
| TC-NTF-01 | Unread notification count | GET /notifications/unread-count | 200 with a number > 0 | As expected – 200 with a number > 0 | ✅ Pass |
| TC-NTF-02 | Mark one notification as read | PATCH /notifications/:id/read | isRead = true, count decreases by 1 | As expected – isRead = true, count decreases by 1 | ✅ Pass |
| TC-NTF-03 | Cannot mark another user's notification | student B marks student A's | 404 | As expected – 404 | ✅ Pass |
| TC-NTF-04 | Mark all as read | PATCH /notifications/read-all | Unread count becomes 0 | As expected – Unread count becomes 0 | ✅ Pass |

## Manually verified

| ID | Description | Input | Expected result | Actual result | Result |
|----|-------------|-------|-----------------|---------------|--------|
| TC-MAN-01 | Login rate limit | 11 login attempts from one IP within 15 minutes | 429 "Too many login attempts…" | As expected (checked with curl) | ✅ Pass |
| TC-MAN-02 | Live profanity warning in the form | Type "kamina" in the complaint title | Yellow warning appears under the form | As expected (checked in the browser) | ✅ Pass |
| TC-MAN-03 | Real-time notification | Officer changes status while the student is logged in | Within 15 s a toast appears and the bell count increases | As expected (browser test: toast shown, bell 6 → 7) | ✅ Pass |
| TC-MAN-04 | Responsive layout | Open pages at 390 px (phone) and 1440 px (desktop) | No sideways scrolling; sidebar becomes a slide-in menu | As expected (screenshots at both sizes) | ✅ Pass |
| TC-MAN-05 | CSV export | Reports → Export CSV with a date range | A .csv file downloads; anonymous rows show "Anonymous Teacher" | As expected (file content checked: 61 rows, 8 anonymous) | ✅ Pass |

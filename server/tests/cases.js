// The test case catalogue. Each automated test uses one of these IDs, and the same table
// is turned into docs/TEST_CASES.md (for the thesis) by tests/generateReport.js.

export const CASES = {
  // ---------- Authentication ----------
  'TC-AUTH-01': ['Login with valid credentials', 'admin@univoice.edu.pk / correct password', '200, success message, httpOnly cookie "univoice_token" set'],
  'TC-AUTH-02': ['Login with wrong password', 'valid email / wrong password', '401 "Invalid email or password"'],
  'TC-AUTH-03': ['Login with an email that does not exist', 'nobody@univoice.edu.pk', '401 with the same message as a wrong password'],
  'TC-AUTH-04': ['Login with badly formatted email', 'email = "abc"', '400 validation error on field "email"'],
  'TC-AUTH-05': ['Login with empty password', 'valid email / empty password', '400 "Password is required"'],
  'TC-AUTH-06': ['NoSQL injection attempt on login', 'email = {"$ne": null}', '400 – operator stripped, login refused'],
  'TC-AUTH-07': ['Get current user without logging in', 'GET /api/auth/me, no cookie', '401 "Please log in to continue"'],
  'TC-AUTH-08': ['Get current user after login', 'GET /api/auth/me with cookie', '200 with user details and no password field'],
  'TC-AUTH-09': ['Logout clears the session', 'POST /api/auth/logout then GET /me', 'Cookie cleared; /me returns 401'],
  'TC-AUTH-10': ['Deactivated user cannot log in', 'admin deactivates student, student logs in', '403 account disabled'],
  'TC-AUTH-11': ['Change password with wrong current password', 'currentPassword wrong', '400 "Current password is incorrect"'],
  'TC-AUTH-12': ['Change password with mismatched confirmation', 'newPassword ≠ confirmPassword', '400 "Passwords do not match"'],
  'TC-AUTH-13': ['Change password successfully', 'correct current, new = NewPass@1', '200; login works with the new password'],
  'TC-AUTH-14': ['Role-based access control', 'student calls GET /api/users (admin only)', '403 "You do not have permission to do this"'],
  'TC-AUTH-15': ['No public sign-up', 'POST /api/users without admin login', '401 – only admin can create accounts'],

  // ---------- Complaint submission ----------
  'TC-CMP-01': ['Student submits a valid complaint', 'title, description, category = it', '201, complaintId like CMP-2026-0001, status pending'],
  'TC-CMP-02': ['Complaint IDs are sequential', 'two complaints in a row', 'Second ID number = first + 1'],
  'TC-CMP-03': ['Submit without a title', 'description only', '400 validation error on "title"'],
  'TC-CMP-04': ['Profanity filter – English', 'title contains an English swear word', '400 "Please keep your complaint respectful…"'],
  'TC-CMP-05': ['Profanity filter – Roman Urdu', 'title "Warden is a kamina"', '400 respectful-language message'],
  'TC-CMP-06': ['Profanity filter – Urdu script', 'description contains "حرامی"', '400 respectful-language message'],
  'TC-CMP-07': ['Profanity filter – stretched spelling', 'description "KUTTAAA staff"', '400 respectful-language message'],
  'TC-CMP-08': ['No false positives on normal words', '"My class assignment… a chor stole my bag in gali 4"', '201 – complaint accepted'],
  'TC-CMP-09': ['Student cannot submit anonymously', 'student, isAnonymous = true', '400 "Only teachers can submit anonymous complaints"'],
  'TC-CMP-10': ['Teacher submits anonymously', 'teacher, isAnonymous = true', '201; the teacher still sees their own details'],
  'TC-CMP-11': ['Anonymous identity hidden from admin', 'admin opens the anonymous complaint', 'submittedBy = null, name "Anonymous Teacher", teacher id appears nowhere'],
  'TC-CMP-12': ['Anonymous identity hidden from officer', 'assigned officer opens it', 'submittedBy = null, "Anonymous Teacher"'],
  'TC-CMP-13': ['Anonymous complaint cannot be found by name', 'admin searches the teacher\'s name', '0 results'],
  'TC-CMP-14': ['Upload a valid image', '1 PNG attachment', '201 with 1 attachment saved'],
  'TC-CMP-15': ['Upload a wrong file type', '.txt file', '400 "Only JPG, PNG and PDF files are allowed"; nothing saved'],
  'TC-CMP-16': ['Upload a file over 5 MB', '6 MB PNG', '400 "Each file must be 5 MB or smaller"'],
  'TC-CMP-17': ['Upload more than 3 files', '4 PNG files', '400 "You can attach up to 3 files"'],
  'TC-CMP-18': ['Admin cannot submit a complaint', 'admin POST /api/complaints', '403'],
  'TC-CMP-19': ['Users see only their own complaints', 'student lists complaints', 'Every complaint returned belongs to that student'],
  'TC-CMP-20': ['User cannot open someone else\'s complaint', 'student B opens student A\'s complaint', '404 not found'],
  'TC-CMP-21': ['Filter and search own complaints', '?status=pending&search=projector', 'Only matching complaints returned'],
  'TC-CMP-22': ['Track a complaint by its ID', 'GET /api/complaints/track/<own ID>', '200 with that complaint'],

  // ---------- Assignment (admin) ----------
  'TC-ASG-01': ['Admin assigns department, officer and priority', 'IT dept + IT officer + urgent', '200; department, officer and priority saved'],
  'TC-ASG-02': ['Officer must belong to the chosen department', 'Accounts dept + IT officer', '400 "officer does not belong to the selected department"'],
  'TC-ASG-03': ['Non-admin cannot assign', 'student calls /assign', '403'],
  'TC-ASG-04': ['Officer cannot see unassigned complaints', 'IT officer opens a new complaint', '404'],
  'TC-ASG-05': ['Assignment notifies complainant and officer', 'after assigning', 'Both have a new notification'],
  'TC-ASG-06': ['Reject without a reason', 'reason empty', '400 "Please give a reason for rejecting"'],
  'TC-ASG-07': ['Reject with a reason', 'reason "Outside university scope"', '200; status rejected, reason saved as remark, complainant notified'],
  'TC-ASG-08': ['Cannot assign a closed complaint', 'assign a rejected complaint', '400 "This complaint is already closed"'],
  'TC-ASG-09': ['Admin filters, sorts and paginates', '?unassigned=true&sort=oldest&limit=2&page=1', '200; ≤ 2 items, pagination info returned'],

  // ---------- Status update (officer) ----------
  'TC-STS-01': ['Officer starts work', 'pending → in_progress with remark', '200; status in_progress, remark saved'],
  'TC-STS-02': ['Officer cannot skip a step', 'pending → resolved', '400 "This status change is not allowed"'],
  'TC-STS-03': ['Other officer cannot update', 'Library officer updates IT complaint', '404'],
  'TC-STS-04': ['Status change is recorded and notified', 'after in_progress', 'statusHistory grows by 1; complainant gets a notification'],
  'TC-STS-05': ['Officer resolves the complaint', 'in_progress → resolved', '200; status resolved'],
  'TC-STS-06': ['Resolved complaint cannot be reopened', 'resolved → in_progress', '400'],
  'TC-STS-07': ['Officer cannot reject', 'status = rejected', '400'],
  'TC-STS-08': ['Officer adds a remark', 'text "Part ordered"', '201; remark saved with officer name'],

  // ---------- Feedback ----------
  'TC-FB-01': ['Feedback before resolution', 'rating 5 on a pending complaint', '400 "only after the complaint is resolved"'],
  'TC-FB-02': ['Feedback by someone who is not the owner', 'another student rates it', '404 (cannot see it)'],
  'TC-FB-03': ['Rating out of range', 'rating = 9', '400 "Rating must be between 1 and 5"'],
  'TC-FB-04': ['Owner gives feedback after resolution', 'rating 4, comment', '201 feedback saved'],
  'TC-FB-05': ['Feedback only once', 'second feedback', '409 "already given feedback"'],
  'TC-FB-06': ['Abusive feedback comment', 'comment with an abusive word', '400 respectful-language message'],

  // ---------- Notifications ----------
  'TC-NTF-01': ['Unread notification count', 'GET /notifications/unread-count', '200 with a number > 0'],
  'TC-NTF-02': ['Mark one notification as read', 'PATCH /notifications/:id/read', 'isRead = true, count decreases by 1'],
  'TC-NTF-03': ['Cannot mark another user\'s notification', 'student B marks student A\'s', '404'],
  'TC-NTF-04': ['Mark all as read', 'PATCH /notifications/read-all', 'Unread count becomes 0'],
};

// "TC-AUTH-01 – Login with valid credentials" (used as the Jest test name).
export const tc = (id) => `${id} – ${CASES[id][0]}`;

# CRMS Overhaul Plan

Big batch of changes. All data stays client-side in `localStorage` (current architecture — no Lovable Cloud yet). If you want persistent multi-device data, say so and I'll add Cloud in a follow-up.

## 1. Auth changes
- **Registration**: `matricule` becomes required (currently auto-generated). Add validation error if empty.
- **Login**: replace email field with matricule. `loginWithCredentials(matricule, password)` looks up account by matricule instead of email. Demo accounts keyed by their existing matricules; password stays `demo`.

## 2. User Management page fix
- Currently `useEffect(() => reload(), [])` runs before permission gate returns — but the real bug is the permission check happens before hook. Restructure so hooks run unconditionally, then gate render. Verify list loads for admin.

## 3. Profiles (new)
- New route `/app/profile` — every role can edit: name, email, password, avatar (data URL), phone.
- Students additionally edit: `classLevel` (Y1–M2) and `specialty` (CS/EE/DS/…).
- Role is **read-only** on the profile page.
- Profile also shows the user's uploaded & downloaded files (from course materials).
- Faculty profile additionally shows a "Mark Registration Sheet" link.

## 4. Course Materials (new logbook section)
- New route `/app/course-materials` (linked as a tab from Logbook).
- Faculty: upload documents per course (title, course code, file ≤ 20 MB, target class group). Stored as base64 in localStorage with size cap warning.
- Students: see only materials for courses their class group is enrolled in. Can download.
- Student → Faculty upload: student picks a lecturer + course, uploads file ≤ 20 MB, becomes a "submission" visible on lecturer's materials page and profile.

## 5. Marks & Results
- New route `/app/marks` (faculty only). Faculty picks course → sees roster from `academic-data` → enters marks (CA, exam, total) → "Send to students". Persists to `crms-marks`.
- `/app/results` (student) reads only their own marks, shows per-course history + trend chart (recharts already installed) with weak-area callout (courses below 10/20).

## 6. Dashboard uses real user data
- Replace mock counters in `/app/dashboard` with computed values from the current user's data: their bookings, borrowed books, submitted logbook entries, materials uploaded/downloaded, marks avg, etc. Role-specific tiles.

## 7. Reports & Analysis
- **Admin `/app/reports`**: aggregate view across every manager domain — library circulation totals, bus reservations, IT equipment checkouts, lab conflicts, plus faculty totals (materials uploaded, marks entered) and student totals. Pulls from the same localStorage keys each manager page writes to.
- **Faculty reports**: performance report per course over time (line chart of class average, distribution of pass/fail, per-student trajectory). Reachable from faculty reports tab.

## Technical Notes
- New keys: `crms-profiles`, `crms-materials`, `crms-submissions`, `crms-marks`.
- File storage: base64 in localStorage. Hard cap 20 MB per file, warn user localStorage total near 5 MB browser limit — recommend Lovable Cloud for real use.
- Extend `SessionUser` with optional `avatar`, `phone`, `classLevel`, `specialty`. Update `role-context.tsx` register/login to key by matricule.
- Sidebar: add "Profile", "Course Materials", "Marks" (faculty), keep existing entries. Update permissions map.

## What I won't do unless you confirm
- Migrate to Lovable Cloud (recommended for real file uploads, cross-device sync, real auth). Say "use Cloud" to switch.
- Email delivery of marks (currently just an in-app notification).

Approve and I'll implement in one pass.
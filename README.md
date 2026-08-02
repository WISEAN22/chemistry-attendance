# B.Sc. Chemistry 5th Semester Attendance Portal

A shared Firebase attendance website for 13 students, roll numbers **242031001–242031013**.

## Included
- Roll number + password login
- Separate dashboard for every student
- Admin dashboard for all 13 students
- Students edit only their own attendance; admin can edit everyone
- Overall attendance %, Present, Absent, Marked Classes
- Monthly navigation and monthly totals
- Subject-wise monthly attendance
- Date/day rows and subject columns
- Multiple same-subject periods on the same day are tracked separately
- Current date/day
- Starts 20 July 2026
- Shared cloud data with Firestore
- Last-updated information on admin page
- Immutable audit log entries for changes

## Subjects
1. Physical Chemistry II
2. Organic Chemistry
3. Inorganic Chemistry II
4. Minor V

## Timetable extracted from your uploaded file
Monday: Physical II, Organic, Minor V  
Tuesday: Inorganic II, Physical II, Inorganic II, Minor V  
Wednesday: Organic, Inorganic II  
Thursday: Organic, Inorganic II, Physical II, Minor V  
Friday: Physical II, Organic, Minor V

The two Inorganic Chemistry II periods on Tuesday are stored separately.

## Firebase setup

### 1. Create project
Create a Firebase project and add a **Web App**.

### 2. Authentication
Firebase Console → Authentication → Sign-in method → enable **Email/Password**.

The website still asks students for a roll number. Internally it converts:
`242031001` → `242031001@attendance.local`

### 3. Firestore
Create a Cloud Firestore database.

### 4. Paste Firebase config
Open:
`js/firebase-config.js`

Replace all `PASTE_...` values with the Firebase Web App configuration.

### 5. Deploy security rules
Install Firebase CLI:
`npm install -g firebase-tools`

Then:
`firebase login`
`firebase use --add`
`firebase deploy --only firestore:rules`

### 6. Create the 13 student accounts + admin
Firebase Console → Project settings → Service accounts → Generate new private key.

Save that JSON somewhere safe. NEVER put it in the public website folder or GitHub.

Then:
`cd setup`
`npm install`
`node create-users.mjs /full/path/to/serviceAccountKey.json`

The script creates `credentials.csv` in the project root with random passwords for:
- 13 students
- admin

Give each student only their own password. Keep the admin password private.

### 7. Test locally
Browsers block some module features when opening HTML directly as `file://`.
Run a local server from the project folder, for example:

`python -m http.server 8080`

Open `http://localhost:8080`

### 8. Deploy website
From project root:
`firebase deploy --only hosting`

Firebase will give you the public website address.

## Security
Firestore rules enforce access on the server:
- Student: read/write own attendance only
- Admin: read/write all attendance
- User roles cannot be edited from the browser
- Audit logs can be created but not modified/deleted from the browser

## Attendance behavior
Click a scheduled class:
Not marked → Present → Absent → Not marked

Future dates are disabled. Unscheduled subject/date combinations show `—` and never affect the percentage.

Only P and A records count in the percentage:
Attendance % = Present / (Present + Absent) × 100

## Important
Do not upload:
- serviceAccountKey.json
- credentials.csv

They contain secrets.

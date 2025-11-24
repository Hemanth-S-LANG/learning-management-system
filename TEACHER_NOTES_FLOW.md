# Teacher Notes Flow - How It Works

## Why Students Can't See Teacher Notes

Students can ONLY see notes from teachers who are **assigned to teach them** in that specific course.

## Required Steps for Students to See Teacher Notes:

### Step 1: Student Enrolls in Course
1. Login as **student**
2. Click "View Courses"
3. Click "Enroll" on a course (e.g., CS101)

### Step 2: Teacher Assigns Themselves to Student
1. Login as **teacher**
2. Click "Manage Courses"
3. Select the same course (e.g., CS101)
4. Find the student in the list
5. Click "Assign to Me" button
6. System automatically assigns a time slot

**⚠️ THIS STEP IS CRITICAL - Without this, students won't see teacher notes!**

### Step 3: Teacher Uploads Notes
1. Still logged in as **teacher**
2. Click "Upload Notes" button
3. Select the same course (e.g., CS101)
4. Click "+ Upload Note"
5. Fill in title and content
6. Optionally attach files
7. Click "Upload & Share"

### Step 4: Student Views Notes
1. Login as **student**
2. Click "My Notes"
3. Select the course (e.g., CS101)
4. You should now see "Notes from Your Assigned Teachers" section

## Complete Example:

```
STUDENT: John (john@student.com)
TEACHER: Alice (alice@teacher.com)
COURSE: CS101 - Introduction to Programming

✅ Step 1: John enrolls in CS101
✅ Step 2: Alice assigns herself to teach John in CS101
✅ Step 3: Alice uploads notes for CS101
✅ Step 4: John can now see Alice's notes in CS101

❌ If Step 2 is skipped: John won't see Alice's notes
```

## Why This Design?

This ensures students only see notes from their **actual assigned teachers**, not from all teachers who upload notes for that course.

## Troubleshooting:

### "No teacher notes available yet"

**Check these things:**

1. **Is the student enrolled?**
   - Student → View Courses → Check if "Enrolled" badge shows

2. **Is a teacher assigned?**
   - Student → My Timetable → Check if the course appears with a teacher

3. **Did the teacher upload notes?**
   - Teacher → Upload Notes → Select course → Check "Uploaded Notes" count

4. **Is it the same course?**
   - Make sure student enrollment, teacher assignment, and notes are all for the SAME course

## Quick Test Script:

### As Student:
```
1. Login as student
2. Go to "View Courses"
3. Enroll in "CS101"
4. Go to "My Timetable" - should be empty
5. Go to "My Notes" → Select CS101 - should show "No teacher notes"
```

### As Teacher:
```
1. Login as teacher
2. Go to "Manage Courses"
3. Select "CS101"
4. Find the student you just enrolled
5. Click "Assign to Me" - should show success message
6. Go to "Upload Notes"
7. Select "CS101"
8. Click "+ Upload Note"
9. Add title: "Week 1 - Introduction"
10. Add content: "Welcome to the course!"
11. Click "Upload & Share"
12. Should show "Uploaded Notes (1)"
```

### Back to Student:
```
1. Login as student again
2. Go to "My Timetable" - should now show CS101 with teacher
3. Go to "My Notes" → Select CS101
4. Should now see "Notes from Your Assigned Teachers (1)"
5. Should see the note "Week 1 - Introduction"
```

## Backend Logs to Check:

When student views notes, check backend console for:
```
Getting notes for student: [studentId] course: [courseId]
Enrollment found: true
Teacher assignments found: 1
Assigned teachers: ['Alice']
Teacher notes found: 1
```

If you see:
- `Enrollment found: false` → Student not enrolled
- `Teacher assignments found: 0` → Teacher not assigned
- `Teacher notes found: 0` → Teacher hasn't uploaded notes or wrong course

# Authentication & Course Management System

## How to Run

### Backend
```bash
cd backend
npm install
npm run dev
```
Make sure MongoDB is running on `mongodb://localhost:27017`

### Frontend
```bash
npm install
npm run dev
```

## Features

### Authentication
- Register as Student or Teacher
- Login with email/password
- JWT authentication
- Protected dashboard
- Role-based access control

### Student Features
- View all available courses (10 hardcoded CS courses)
- Enroll in courses
- Unenroll from courses
- View enrolled courses
- View weekly timetable with scheduled classes
- Timetable shows day, time, course, and assigned teacher

### Teacher Features
- View all available courses
- Select a course to teach
- View all students enrolled in selected course
- Assign themselves to teach specific students (automatic time slot assignment)
- System automatically finds next available time slot
- Schedule 1-hour classes from 8 AM to 6 PM (Monday-Friday)
- Prevents double-booking (each student gets unique time slots)
- Unassign from students
- Assignments are saved to database

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Courses
- `GET /api/courses/all` - Get all courses
- `GET /api/courses/my-courses` - Get enrolled courses
- `GET /api/courses/my-timetable` - Get student's timetable with assigned teachers (student only)
- `POST /api/courses/enroll` - Enroll in course (student only)
- `DELETE /api/courses/unenroll/:courseId` - Unenroll from course (student only)
- `GET /api/courses/students/:courseId` - Get enrolled students (teacher only)
- `POST /api/courses/assign` - Assign teacher to student (teacher only)
- `DELETE /api/courses/unassign/:courseId/:studentId` - Unassign teacher (teacher only)

## Frontend Routes

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Protected dashboard
- `/courses` - Student course selection page
- `/timetable` - Student timetable showing assigned teachers
- `/teacher-courses` - Teacher course management page

## Hardcoded Courses

1. CS101 - Introduction to Programming
2. CS102 - Data Structures
3. CS201 - Algorithms
4. CS202 - Database Systems
5. CS301 - Web Development
6. CS302 - Operating Systems
7. CS401 - Machine Learning
8. CS402 - Computer Networks
9. CS403 - Software Engineering
10. CS404 - Artificial Intelligence

## Usage

1. Start backend server (port 3000)
2. Start frontend dev server (port 5173)
3. Go to http://localhost:5173
4. Register as student or teacher
5. Login and explore features based on role

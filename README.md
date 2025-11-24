# 🎓 Learning Management System (LMS)

A full-stack Learning Management System built with **React**, **Node.js**, **Express**, and **MongoDB**.

## ✨ Features

### 👨‍🎓 Student Features
- **Course Enrollment** - Browse and enroll in courses with multiple sections
- **Interactive Timetable** - Auto-generated weekly schedule with breaks
- **Notes Management** - Create personal notes and view teacher-shared materials
- **Assignments & Quizzes** - Complete homework and take timed quizzes
- **AI Study Assistant** - Get personalized study suggestions based on performance
- **Profile Management** - Upload profile photo with crop/rotate tools
- **Theme Customization** - 5 beautiful themes to choose from

### 👨‍🏫 Teacher Features
- **Course Management** - Create courses with automatic section assignment
- **Student Assignment** - Assign students to courses with auto-scheduled time slots
- **Notes Sharing** - Upload and share study materials with students
- **Quiz Creation** - Create quizzes with multiple question types (MCQ, True/False, Match Column, Descriptive)
- **Assignment Tracking** - View submissions and monitor student progress
- **Profile Management** - Manage profile with photo upload

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Student/Teacher)
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### 🎨 UI/UX Features
- Modern, responsive design with Tailwind CSS
- Gradient backgrounds and smooth animations
- Theme switching (Light, Dark, Ocean Blue, Purple Dream, Nature Green)
- Loading states and error handling
- Confetti celebrations for quiz completion

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd website
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
```

4. **Configure environment variables**

Create `backend/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

5. **Seed the database** (optional - adds sample courses and teachers)
```bash
cd backend
node seed.js
```

6. **Start the backend server**
```bash
cd backend
npm start
```

7. **Start the frontend** (in a new terminal)
```bash
npm run dev
```

8. **Open your browser**
```
http://localhost:5173
```

## 👥 Sample Accounts

### Teachers (Password: `teacher123`)
- johnson@university.edu - Dr. Sarah Johnson
- smith@university.edu - Prof. Michael Smith
- davis@university.edu - Dr. Emily Davis
- wilson@university.edu - Prof. James Wilson
- brown@university.edu - Dr. Lisa Brown

### Create Your Own
- Register as Student or Teacher from the registration page

## 📚 Project Structure

```
website/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── seed.js          # Database seeder
│   └── server.js        # Express server
├── src/
│   ├── components/      # React components
│   ├── context/         # React context (Theme)
│   ├── pages/           # Page components
│   ├── utils/           # Utility functions (AI suggestions)
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
└── README.md
```

## 🎯 Key Features Explained

### Course Sections
- Multiple teachers can teach the same course
- Automatic section assignment (A, B, C, etc.)
- Students choose which section to enroll in

### AI Study Assistant
- Analyzes quiz performance
- Provides personalized study tips
- Generates 7-day study plans
- Motivational messages based on scores

### Timetable System
- Auto-generates weekly schedule
- Includes break times (20 min short break, 50 min lunch)
- Shows teacher info and course details
- Color-coded for easy reading

### Quiz System
- Multiple question types
- Time tracking
- Tab switch detection
- Automatic grading
- Detailed results with explanations

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Heroku/Railway)
- Set environment variables
- Deploy from GitHub
- Connect to MongoDB Atlas

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Courses
- `GET /api/courses/all` - Get all courses
- `GET /api/courses/my-courses` - Get enrolled courses
- `POST /api/courses/enroll` - Enroll in course
- `POST /api/courses/create` - Create course (teacher)

### Assignments
- `GET /api/assignments/student/course/:courseId` - Get assignments
- `POST /api/assignments/create` - Create assignment (teacher)
- `POST /api/assignments/submit/:assignmentId` - Submit assignment

### Notes
- `GET /api/notes/course/:courseId` - Get notes
- `POST /api/notes/create` - Create note
- `PUT /api/notes/:noteId` - Update note
- `DELETE /api/notes/:noteId` - Delete note

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created with ❤️ by [Hemanth S]

## 🙏 Acknowledgments

- React team for the amazing library
- Tailwind CSS for beautiful styling
- MongoDB for the database
- All open-source contributors

---



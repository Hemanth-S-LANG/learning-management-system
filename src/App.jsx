import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import TeacherCourses from './pages/TeacherCourses';
import Timetable from './pages/Timetable';
import Notes from './pages/Notes';
import TeacherNotes from './pages/TeacherNotes';
import TeacherAssignments from './pages/TeacherAssignments';
import StudentAssignments from './pages/StudentAssignments';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/teacher-courses" element={<TeacherCourses />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/teacher-notes" element={<TeacherNotes />} />
        <Route path="/teacher-assignments" element={<TeacherAssignments />} />
        <Route path="/student-assignments" element={<StudentAssignments />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/take-quiz/:assignmentId" element={<TakeQuiz />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
} 
    
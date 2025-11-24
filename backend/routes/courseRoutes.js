import express from 'express';
import { 
  getAllCourses, 
  getMyCourses, 
  enrollCourse, 
  unenrollCourse, 
  createCourse,
  getEnrolledStudents,
  assignTeacherToStudent,
  unassignTeacherFromStudent,
  getMyTimetable
} from '../controllers/courseController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/all', verifyToken, getAllCourses);
router.get('/my-courses', verifyToken, getMyCourses);
router.get('/my-timetable', verifyToken, requireRole('student'), getMyTimetable);
router.post('/enroll', verifyToken, requireRole('student'), enrollCourse);
router.delete('/unenroll/:courseId', verifyToken, requireRole('student'), unenrollCourse);
router.post('/create', verifyToken, requireRole('teacher'), createCourse);
router.get('/students/:courseId', verifyToken, requireRole('teacher'), getEnrolledStudents);
router.post('/assign', verifyToken, requireRole('teacher'), assignTeacherToStudent);
router.delete('/unassign/:courseId/:studentId', verifyToken, requireRole('teacher'), unassignTeacherFromStudent);

export default router;

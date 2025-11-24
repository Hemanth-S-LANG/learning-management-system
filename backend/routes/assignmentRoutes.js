import express from 'express';
import {
  createAssignment,
  getTeacherAssignments,
  getStudentAssignments,
  getAssignmentById,
  submitAssignment,
  getAssignmentSubmissions,
  deleteAssignment
} from '../controllers/assignmentController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', verifyToken, requireRole('teacher'), createAssignment);
router.get('/teacher/course/:courseId', verifyToken, requireRole('teacher'), getTeacherAssignments);
router.get('/student/course/:courseId', verifyToken, requireRole('student'), getStudentAssignments);
router.get('/get/:assignmentId', verifyToken, getAssignmentById);
router.post('/submit/:assignmentId', verifyToken, requireRole('student'), submitAssignment);
router.get('/submissions/:assignmentId', verifyToken, requireRole('teacher'), getAssignmentSubmissions);
router.delete('/:assignmentId', verifyToken, requireRole('teacher'), deleteAssignment);

export default router;

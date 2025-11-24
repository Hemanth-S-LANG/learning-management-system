import express from 'express';
import { 
  createNote, 
  getMyNotes, 
  getTeacherNotes,
  updateNote, 
  deleteNote,
  shareNote 
} from '../controllers/noteController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', verifyToken, createNote);
router.post('/teacher/create', verifyToken, requireRole('teacher'), createNote);
router.get('/course/:courseId', verifyToken, getMyNotes);
router.get('/teacher/course/:courseId', verifyToken, requireRole('teacher'), getTeacherNotes);
router.put('/:noteId', verifyToken, updateNote);
router.delete('/:noteId', verifyToken, deleteNote);
router.post('/share/:noteId', verifyToken, requireRole('teacher'), shareNote);

export default router;

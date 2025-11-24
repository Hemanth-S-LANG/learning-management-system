import express from 'express';
import { register, login, getMe, updateProfile, changePassword, getUserProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);
router.get('/user/:userId', verifyToken, getUserProfile);

export default router;

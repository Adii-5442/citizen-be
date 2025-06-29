import express from 'express';
import { register, login, getProfile, updateProfile, checkUsername, getCurrentUser, updateCurrentUser } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/check-username', checkUsername);

// Protected routes
router.get('/profile/:id', auth, getProfile);
router.patch('/profile/:id', auth, updateProfile);
router.get('/me', auth, getCurrentUser);
router.patch('/me', auth, updateCurrentUser);

export default router; 
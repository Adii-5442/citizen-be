import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile/:id', auth, getProfile);
router.patch('/profile/:id', auth, updateProfile);

export default router; 
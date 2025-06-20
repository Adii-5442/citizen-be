import express from 'express';
import { followUser, unfollowUser } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Follow/unfollow
router.post('/:id/follow', auth, followUser);
router.post('/:id/unfollow', auth, unfollowUser);

export default router; 
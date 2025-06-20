import express from 'express';
import { getProfile, updateProfile, getUserAchievements, getUserNotifications, markNotificationsRead, getUserActivity } from '../controllers/profileController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/:id', auth, getProfile);
router.patch('/:id', auth, updateProfile);
router.get('/:id/achievements', auth, getUserAchievements);
router.get('/:id/notifications', auth, getUserNotifications);
router.post('/:id/notifications/read', auth, markNotificationsRead);
router.get('/:id/activity', auth, getUserActivity);

export default router; 
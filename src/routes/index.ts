import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import profileRoutes from './profileRoutes';
import rantRoutes from './rantRoutes';
// import commentRoutes from './commentRoutes';
// import notificationRoutes from './notificationRoutes';
// import achievementRoutes from './achievementRoutes';
// import petitionRoutes from './petitionRoutes';
// import activityRoutes from './activityRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/rants', rantRoutes);
// router.use('/comments', commentRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/achievements', achievementRoutes);
// router.use('/petitions', petitionRoutes);
// router.use('/activity', activityRoutes);

export default router; 
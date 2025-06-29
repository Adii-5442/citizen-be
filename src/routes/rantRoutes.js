import express from 'express';
import {
  createRant,
  getRants,
  getRantById,
  updateRant,
  deleteRant,
  likeRant,
  dislikeRant,
  bookmarkRant,
  shareRant,
  reportRant,
  getRantComments,
  getTrendingRants,
  getHotRants,
} from '../controllers/rantController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getRants);
router.get('/trending', getTrendingRants);
router.get('/hot', getHotRants);
router.get('/:id', getRantById);
router.get('/:id/comments', getRantComments);

// Protected routes
router.post('/', auth, createRant);
router.patch('/:id', auth, updateRant);
router.delete('/:id', auth, deleteRant);

// Engagement routes
router.post('/:id/like', auth, likeRant);
router.post('/:id/dislike', auth, dislikeRant);
router.post('/:id/bookmark', auth, bookmarkRant);
router.post('/:id/share', auth, shareRant);
router.post('/:id/report', auth, reportRant);

export default router; 
import express from 'express';
import {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
  reportComment,
  getCommentReplies,
  getUserComments,
} from '../controllers/commentController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getComments);
router.get('/:id', getCommentById);
router.get('/:id/replies', getCommentReplies);
router.get('/user/:userId', getUserComments);

// Protected routes
router.post('/:rantId', auth, createComment);
router.patch('/:id', auth, updateComment);
router.delete('/:id', auth, deleteComment);

// Engagement routes
router.post('/:id/like', auth, likeComment);
router.post('/:id/dislike', auth, dislikeComment);
router.post('/:id/report', auth, reportComment);

export default router; 
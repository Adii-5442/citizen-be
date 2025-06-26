import express from 'express';
import {
  createRant,
  getRants,
  getRantById,
  updateRant,
  deleteRant,
  upvoteRant,
  addComment,
} from '../controllers/rantController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getRants);
router.get('/:id', getRantById);

// Protected routes
router.post('/', auth, createRant);
router.patch('/:id', auth, updateRant);
router.delete('/:id', auth, deleteRant);
router.post('/:id/upvote', auth, upvoteRant);
router.post('/:id/comments', auth, addComment);

export default router; 
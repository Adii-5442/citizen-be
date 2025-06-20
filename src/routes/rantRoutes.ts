import express from 'express';
import {
  createRant,
  getRants,
  getRantById,
  updateRant,
  deleteRant,
  upvoteRant,
  addComment,
  getComments,
  getTrendingRants,
  getPetitionStatus,
} from '../controllers/rantController';
import { auth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

// Public routes
router.get('/', getRants as express.RequestHandler);
router.get('/:id', getRantById as express.RequestHandler);

// Protected routes
router.post('/', auth, createRant as express.RequestHandler);
router.patch('/:id', auth, updateRant as express.RequestHandler);
router.delete('/:id', auth, deleteRant as express.RequestHandler);
router.post('/:id/upvote', auth, upvoteRant as express.RequestHandler);
router.post('/:id/comments', auth, addComment as express.RequestHandler);
router.get('/:id/comments', getComments as express.RequestHandler);
router.get('/trending', getTrendingRants as express.RequestHandler);
router.get('/:id/petition', getPetitionStatus as express.RequestHandler);

export default router; 
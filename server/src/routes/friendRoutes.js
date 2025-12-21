import express from 'express';
import {
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendsList
} from '../controllers/friendController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/search', authMiddleware, searchUsers);
router.post('/add', authMiddleware, sendFriendRequest);
router.get('/requests', authMiddleware, getFriendRequests);
router.post('/accept', authMiddleware, acceptFriendRequest);
router.post('/reject', authMiddleware, rejectFriendRequest);
router.get('/list', authMiddleware, getFriendsList);

export default router;

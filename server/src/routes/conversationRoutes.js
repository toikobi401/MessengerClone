import express from 'express';
import {
  initConversation,
  getUserConversations,
  getConversationById
} from '../controllers/conversationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.post('/init', authMiddleware, initConversation);
router.get('/', authMiddleware, getUserConversations);
router.get('/:conversationId', authMiddleware, getConversationById);

export default router;

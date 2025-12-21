import express from 'express';
import { addMessage, getMessages } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.post('/addmsg', authMiddleware, addMessage);
router.post('/getmsg', authMiddleware, getMessages);

export default router;

import express from 'express';
import { addMessage, getMessages, getMessagesByConversation, editMessage, generateSignature } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Protected routes
router.get('/generate-signature', authMiddleware, generateSignature); // Generate upload signature
router.post('/addmsg', authMiddleware, upload.single('file'), addMessage);
router.post('/getmsg', authMiddleware, getMessages); // Legacy
router.get('/:conversationId', authMiddleware, getMessagesByConversation); // New
router.put('/edit', authMiddleware, editMessage); // Edit message

export default router;

import express from 'express';
import { register, login, getAllUsers, setAvatar } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/allusers/:id', authMiddleware, getAllUsers);
router.post('/setavatar/:id', authMiddleware, setAvatar);

export default router;

import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../config/cloudinary.js';

const router = express.Router();

// Protected routes
router.get('/:id', authMiddleware, getUserProfile);
router.put('/:id', authMiddleware, uploadAvatar.single('avatar'), updateUserProfile);

export default router;

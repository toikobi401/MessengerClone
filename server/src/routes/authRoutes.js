import express from 'express';
import { 
  register, 
  login, 
  verifyRegistration, 
  verifyLogin, 
  resendOTP, 
  getAllUsers, 
  setAvatar, 
  googleCallback 
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import passport from '../config/passport.js';

const router = express.Router();

// Public routes - Registration & Login with OTP
router.post('/register', register); // Step 1: Send OTP
router.post('/verify-registration', verifyRegistration); // Step 2: Verify OTP & Create User
router.post('/login', login); // Step 1: Send 2FA OTP
router.post('/verify-login', verifyLogin); // Step 2: Verify OTP & Return JWT
router.post('/resend-otp', resendOTP); // Resend OTP

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { 
  failureRedirect: '/login',
  session: false 
}), googleCallback);

// Protected routes
router.get('/allusers/:id', authMiddleware, getAllUsers);
router.post('/setavatar/:id', authMiddleware, setAvatar);

export default router;

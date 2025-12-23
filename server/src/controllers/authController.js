import { User, EmailOtp } from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '../utils/emailService.js';
import { Op } from 'sequelize';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Generate random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Save OTP to database (hashed)
 * @param {string} email 
 * @param {string} otp - Plain text OTP
 * @param {string} purpose - 'registration' or 'login_2fa'
 */
const saveOTP = async (email, otp, purpose = 'registration') => {
  try {
    // Delete any existing OTPs for this email
    await EmailOtp.destroy({
      where: { email, purpose }
    });

    // Hash OTP
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Calculate expiration (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save to database
    await EmailOtp.create({
      email,
      otp_code: hashedOtp,
      expires_at: expiresAt,
      purpose
    });

    return true;
  } catch (error) {
    console.error('Error saving OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP from database
 * @param {string} email 
 * @param {string} otp - Plain text OTP to verify
 * @param {string} purpose 
 * @returns {Promise<boolean>}
 */
const verifyOTP = async (email, otp, purpose = 'registration') => {
  try {
    // Find the most recent OTP for this email
    const otpRecord = await EmailOtp.findOne({
      where: { email, purpose },
      order: [['created_at', 'DESC']]
    });

    if (!otpRecord) {
      return false;
    }

    // Check if OTP is expired
    if (otpRecord.isExpired()) {
      await EmailOtp.destroy({ where: { id: otpRecord.id } });
      return false;
    }

    // Verify OTP hash
    const isValid = await bcrypt.compare(otp, otpRecord.otp_code);

    if (isValid) {
      // Delete OTP after successful verification
      await EmailOtp.destroy({ where: { id: otpRecord.id } });
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

// @desc    Register new user (Step 1: Send OTP)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if username is taken
    const existingUsername = await User.findOne({
      where: { username }
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database
    await saveOTP(email, otp, 'registration');

    // Send OTP email
    await sendOTPEmail(email, otp, 'registration');

    // Return pending status
    return res.status(200).json({
      success: true,
      status: 'PENDING_OTP',
      message: 'Verification code sent to your email',
      data: {
        email,
        expiresIn: 300 // 5 minutes in seconds
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error registering user',
      error: error.message
    });
  }
};

// @desc    Verify Registration OTP (Step 2: Complete Registration)
// @route   POST /api/auth/verify-registration
// @access  Public
export const verifyRegistration = async (req, res) => {
  try {
    const { email, otp, username, password } = req.body;

    // Validate input
    if (!email || !otp || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify OTP
    const isValid = await verifyOTP(email, otp, 'registration');

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Check if user was created in the meantime (race condition)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user (password will be hashed by the model hook)
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate token
    const token = generateToken(user.id);

    // Return user without password
    return res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Verify registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error completing registration',
      error: error.message
    });
  }
};

// @desc    Login user (Step 1: Send 2FA OTP)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate OTP for 2FA
    const otp = generateOTP();

    // Save OTP to database
    await saveOTP(email, otp, 'login_2fa');

    // Send OTP email
    await sendOTPEmail(email, otp, 'login_2fa');

    // Return pending 2FA status (DO NOT return JWT yet)
    return res.status(200).json({
      success: true,
      status: 'PENDING_2FA',
      message: 'Verification code sent to your email',
      data: {
        email,
        expiresIn: 300 // 5 minutes in seconds
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Verify Login OTP (Step 2: Complete Login with 2FA)
// @route   POST /api/auth/verify-login
// @access  Public
export const verifyLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Verify OTP
    const isValid = await verifyOTP(email, otp, 'login_2fa');

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user without password
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Verify login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying login',
      error: error.message
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Email and purpose are required'
      });
    }

    if (!['registration', 'login_2fa'].includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purpose'
      });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    await saveOTP(email, otp, purpose);

    // Send OTP email
    await sendOTPEmail(email, otp, purpose);

    return res.status(200).json({
      success: true,
      message: 'Verification code resent successfully',
      data: {
        email,
        expiresIn: 300
      }
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error resending verification code',
      error: error.message
    });
  }
};

// @desc    Get all users except current user (for contacts list)
// @route   GET /api/auth/allusers/:id
// @access  Private
export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.params.id;

    // Get all users except the current user
    const users = await User.findAll({
      where: {
        id: {
          [require('sequelize').Op.ne]: currentUserId
        }
      },
      attributes: ['id', 'username', 'email', 'avatarImage', 'isAvatarImageSet'],
      order: [['username', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Set user avatar
// @route   POST /api/auth/setavatar/:id
// @access  Private
export const setAvatar = async (req, res) => {
  try {
    const userId = req.params.id;
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an avatar image'
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.avatarImage = image;
    user.isAvatarImageSet = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        isSet: user.isAvatarImageSet,
        image: user.avatarImage
      }
    });
  } catch (error) {
    console.error('Set avatar error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error setting avatar',
      error: error.message
    });
  }
};

// @desc    Google OAuth callback handler
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = (req, res) => {
  try {
    // User is authenticated via Passport
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Redirect to frontend with token
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientURL}/login-success?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientURL}/login?error=server_error`);
  }
};

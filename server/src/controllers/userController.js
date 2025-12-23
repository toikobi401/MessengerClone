import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user is accessing their own profile
    if (req.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own profile'
      });
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    // Verify user is updating their own profile
    if (req.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update username if provided
    if (username && username !== user.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ where: { username } });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }

      user.username = username;
    }

    // Update avatar if new file was uploaded via Cloudinary
    if (req.file && req.file.path) {
      user.avatarImage = req.file.path; // Cloudinary secure URL
      user.isAvatarImageSet = true;
    }

    // Update password if provided and not empty
    if (password && password.trim() !== '') {
      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Return updated user without password
    const updatedUser = user.toJSON();
    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
};

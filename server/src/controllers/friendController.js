import { User, FriendRequest } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Search users by username or email
// @route   GET /api/friends/search?query=username
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.userId;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Search users by username or email
    const users = await User.findAll({
      where: {
        id: {
          [Op.ne]: currentUserId // Exclude current user
        },
        [Op.or]: [
          {
            username: {
              [Op.like]: `%${query}%`
            }
          },
          {
            email: {
              [Op.like]: `%${query}%`
            }
          }
        ]
      },
      attributes: ['id', 'username', 'email', 'avatarImage', 'isAvatarImageSet'],
      limit: 20
    });

    // Get friendship status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        // Check if there's a friend request between current user and this user
        const friendRequest = await FriendRequest.findOne({
          where: {
            [Op.or]: [
              {
                senderId: currentUserId,
                receiverId: user.id
              },
              {
                senderId: user.id,
                receiverId: currentUserId
              }
            ]
          }
        });

        let status = 'not_friends';
        if (friendRequest) {
          if (friendRequest.status === 'accepted') {
            status = 'friends';
          } else if (friendRequest.status === 'pending') {
            // Check who sent the request
            if (friendRequest.senderId === currentUserId) {
              status = 'pending_sent';
            } else {
              status = 'pending_received';
            }
          }
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarImage: user.avatarImage,
          isAvatarImageSet: user.isAvatarImageSet,
          friendshipStatus: status
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: usersWithStatus
    });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message
    });
  }
};

// @desc    Send friend request
// @route   POST /api/friends/add
// @access  Private
export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.userId;

    // Validate input
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    // Check if trying to add self
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    // Check if receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          {
            senderId: senderId,
            receiverId: receiverId
          },
          {
            senderId: receiverId,
            receiverId: senderId
          }
        ]
      }
    });

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'You are already friends'
        });
      } else if (existingRequest.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Friend request already sent'
        });
      }
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      senderId,
      receiverId,
      status: 'pending'
    });

    // Get sender info for socket notification
    const sender = await User.findByPk(senderId, {
      attributes: ['id', 'username', 'email', 'avatarImage', 'isAvatarImageSet']
    });

    return res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      data: {
        requestId: friendRequest.id,
        sender: sender
      }
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending friend request',
      error: error.message
    });
  }
};

// @desc    Get incoming friend requests
// @route   GET /api/friends/requests
// @access  Private
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await FriendRequest.findAll({
      where: {
        receiverId: userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'avatarImage', 'isAvatarImageSet']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching friend requests',
      error: error.message
    });
  }
};

// @desc    Accept friend request
// @route   POST /api/friends/accept
// @access  Private
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.userId;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }

    // Find the friend request
    const friendRequest = await FriendRequest.findOne({
      where: {
        id: requestId,
        receiverId: userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'avatarImage', 'isAvatarImageSet']
        }
      ]
    });

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    // Update status to accepted
    friendRequest.status = 'accepted';
    await friendRequest.save();

    return res.status(200).json({
      success: true,
      message: 'Friend request accepted',
      data: {
        friend: friendRequest.sender
      }
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error accepting friend request',
      error: error.message
    });
  }
};

// @desc    Reject/Delete friend request
// @route   POST /api/friends/reject
// @access  Private
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.userId;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }

    // Find and delete the friend request
    const deleted = await FriendRequest.destroy({
      where: {
        id: requestId,
        receiverId: userId
      }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Friend request rejected'
    });
  } catch (error) {
    console.error('Reject friend request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error rejecting friend request',
      error: error.message
    });
  }
};

// @desc    Get friends list
// @route   GET /api/friends/list
// @access  Private
export const getFriendsList = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all accepted friend requests where user is sender or receiver
    const friendRequests = await FriendRequest.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ],
        status: 'accepted'
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'avatarImage', 'isAvatarImageSet']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'email', 'avatarImage', 'isAvatarImageSet']
        }
      ]
    });

    // Extract friends (the user who is not the current user)
    const friends = friendRequests.map(request => {
      if (request.senderId === userId) {
        return request.receiver;
      } else {
        return request.sender;
      }
    });

    return res.status(200).json({
      success: true,
      data: friends
    });
  } catch (error) {
    console.error('Get friends list error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching friends list',
      error: error.message
    });
  }
};

import { Message, User } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Add new message
// @route   POST /api/messages/addmsg
// @access  Private
export const addMessage = async (req, res) => {
  try {
    const { from, to, message } = req.body;

    // Validate input
    if (!from || !to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide from, to, and message'
      });
    }

    // Create message
    const newMessage = await Message.create({
      message: message,
      users: [from, to],
      senderId: from
    });

    if (newMessage) {
      return res.status(201).json({
        success: true,
        message: 'Message added successfully',
        data: newMessage
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Failed to add message'
    });
  } catch (error) {
    console.error('Add message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding message',
      error: error.message
    });
  }
};

// @desc    Get all messages between two users
// @route   POST /api/messages/getmsg
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { from, to } = req.body;

    // Validate input
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Please provide from and to user IDs'
      });
    }

    // Find all messages between these two users
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          {
            [Op.and]: [
              { senderId: from },
              {
                users: {
                  [Op.like]: `%${to}%`
                }
              }
            ]
          },
          {
            [Op.and]: [
              { senderId: to },
              {
                users: {
                  [Op.like]: `%${from}%`
                }
              }
            ]
          }
        ]
      },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatarImage']
        }
      ]
    });

    // Transform messages to simpler format
    const projectMessages = messages.map((msg) => ({
      id: msg.id,
      message: msg.message,
      fromSelf: msg.senderId === from,
      senderId: msg.senderId,
      createdAt: msg.createdAt,
      sender: msg.sender
    }));

    return res.status(200).json({
      success: true,
      data: projectMessages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

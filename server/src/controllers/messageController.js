import { Message, User, Conversation, ConversationParticipant } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Add new message (text or media)
// @route   POST /api/messages/addmsg
// @access  Private
export const addMessage = async (req, res) => {
  try {
    const { from, to, message, conversationId } = req.body;
    const uploadedFile = req.file; // Multer uploaded file

    // Determine message type and content
    let messageContent = message;
    let messageType = 'text';

    if (uploadedFile) {
      // File uploaded - use Cloudinary URL
      messageContent = uploadedFile.path; // Cloudinary secure URL
      
      // Determine type based on mimetype
      if (uploadedFile.mimetype.startsWith('image/')) {
        messageType = 'image';
      } else if (uploadedFile.mimetype.startsWith('video/')) {
        messageType = 'video';
      } else {
        messageType = 'file';
      }
    }

    // Validate input
    if (!from || !messageContent) {
      return res.status(400).json({
        success: false,
        message: 'Please provide from and message/file'
      });
    }

    // If conversationId provided, verify participant
    if (conversationId) {
      const isParticipant = await ConversationParticipant.findOne({
        where: {
          conversationId,
          userId: from
        }
      });

      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          message: 'You are not a participant of this conversation'
        });
      }
    }

    // Create message
    const newMessage = await Message.create({
      message: messageContent,
      type: messageType,
      users: to ? [from, to] : [], // Maintain backward compatibility
      senderId: from,
      conversationId: conversationId || null
    });

    // Update conversation's updatedAt to bump it to top
    if (conversationId) {
      await Conversation.update(
        { updatedAt: new Date() },
        { where: { id: conversationId } }
      );
    }

    if (newMessage) {
      return res.status(201).json({
        success: true,
        message: 'Message added successfully',
        data: {
          id: newMessage.id,
          message: newMessage.message,
          type: newMessage.type,
          senderId: newMessage.senderId,
          conversationId: newMessage.conversationId,
          createdAt: newMessage.createdAt
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Failed to add message'
    });
  } catch (error) {
    console.error('Add message error:', error);
    
    // Handle Cloudinary/Multer specific errors
    if (error.message.includes('file')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error adding message',
      error: error.message
    });
  }
};

// @desc    Get all messages by conversation ID
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessagesByConversation = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { conversationId } = req.params;

    // Verify user is participant
    const isParticipant = await ConversationParticipant.findOne({
      where: {
        conversationId,
        userId: currentUserId
      }
    });

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this conversation'
      });
    }

    // Get all messages for this conversation
    const messages = await Message.findAll({
      where: {
        conversationId
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

    // Transform messages
    const projectMessages = messages.map((msg) => ({
      id: msg.id,
      message: msg.message,
      type: msg.type || 'text',
      isEdited: msg.isEdited || false,
      fromSelf: msg.senderId === currentUserId,
      senderId: msg.senderId,
      createdAt: msg.createdAt,
      sender: msg.sender
    }));

    return res.status(200).json({
      success: true,
      data: projectMessages
    });
  } catch (error) {
    console.error('Get messages by conversation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// @desc    Get all messages between two users (Legacy - for backward compatibility)
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
      type: msg.type || 'text',
      isEdited: msg.isEdited || false,
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

// @desc    Edit existing message
// @route   PUT /api/messages/edit
// @access  Private
export const editMessage = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { messageId, newContent } = req.body;

    // Validate input
    if (!messageId || !newContent || !newContent.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide messageId and newContent'
      });
    }

    // Find the message
    const message = await Message.findOne({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // SECURITY CHECK: Only sender can edit their own message
    if (message.senderId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    // Update the message
    await message.update({
      message: newContent.trim(),
      isEdited: true
    });

    return res.status(200).json({
      success: true,
      message: 'Message edited successfully',
      data: {
        id: message.id,
        message: message.message,
        isEdited: message.isEdited,
        conversationId: message.conversationId,
        senderId: message.senderId
      }
    });
  } catch (error) {
    console.error('Edit message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error editing message',
      error: error.message
    });
  }
};

import { Conversation, ConversationParticipant, User, Message } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';

// @desc    Initialize/Get conversation between two users
// @route   POST /api/conversations/init
// @access  Private
export const initConversation = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { receiverId } = req.body;

    // Validate input
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    if (currentUserId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    // Check if conversation already exists between these two users
    const existingConversation = await sequelize.query(`
      SELECT c.id, c.type, c.createdAt, c.updatedAt
      FROM conversations c
      INNER JOIN conversation_participants cp1 ON c.id = cp1.conversationId
      INNER JOIN conversation_participants cp2 ON c.id = cp2.conversationId
      WHERE c.type = 'private'
        AND cp1.userId = :user1
        AND cp2.userId = :user2
      LIMIT 1
    `, {
      replacements: { user1: currentUserId, user2: receiverId },
      type: sequelize.QueryTypes.SELECT
    });

    if (existingConversation.length > 0) {
      // Return existing conversation
      return res.status(200).json({
        success: true,
        data: {
          conversationId: existingConversation[0].id,
          type: existingConversation[0].type,
          isNew: false
        }
      });
    }

    // Create new conversation
    const newConversation = await Conversation.create({
      type: 'private'
    });

    // Add participants
    await ConversationParticipant.bulkCreate([
      {
        conversationId: newConversation.id,
        userId: currentUserId
      },
      {
        conversationId: newConversation.id,
        userId: receiverId
      }
    ]);

    return res.status(201).json({
      success: true,
      data: {
        conversationId: newConversation.id,
        type: newConversation.type,
        isNew: true
      }
    });
  } catch (error) {
    console.error('Init conversation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error initializing conversation',
      error: error.message
    });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/conversations
// @access  Private
export const getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.userId;

    // Get all conversations with participants and last message
    const conversations = await Conversation.findAll({
      include: [
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'username', 'email', 'avatarImage', 'isAvatarImageSet'],
          through: { attributes: [] }
        },
        {
          model: Message,
          as: 'messages',
          attributes: ['id', 'message', 'senderId', 'createdAt'],
          limit: 1,
          order: [['createdAt', 'DESC']],
          required: false
        }
      ],
      where: {
        id: {
          [Op.in]: sequelize.literal(`(
            SELECT conversationId 
            FROM conversation_participants 
            WHERE userId = '${currentUserId}'
          )`)
        }
      },
      order: [['updatedAt', 'DESC']]
    });

    // Format response
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        type: conv.type,
        participant: otherParticipant,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          message: lastMessage.message,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt
        } : null,
        updatedAt: conv.updatedAt
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

// @desc    Get conversation by ID
// @route   GET /api/conversations/:conversationId
// @access  Private
export const getConversationById = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { conversationId } = req.params;

    // Check if user is participant
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

    // Get conversation with participants
    const conversation = await Conversation.findByPk(conversationId, {
      include: [
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'username', 'email', 'avatarImage', 'isAvatarImageSet'],
          through: { attributes: [] }
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);

    return res.status(200).json({
      success: true,
      data: {
        id: conversation.id,
        type: conversation.type,
        participant: otherParticipant,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
};

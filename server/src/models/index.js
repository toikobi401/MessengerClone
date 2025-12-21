import { sequelize } from '../config/database.js';
import User from './User.js';
import Message from './Message.js';
import FriendRequest from './FriendRequest.js';
import Conversation from './Conversation.js';
import ConversationParticipant from './ConversationParticipant.js';

// Define associations
User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'sentMessages',
  onDelete: 'CASCADE'
});

Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender'
});

// Friend Request associations
User.hasMany(FriendRequest, {
  foreignKey: 'senderId',
  as: 'sentRequests',
  onDelete: 'CASCADE'
});

User.hasMany(FriendRequest, {
  foreignKey: 'receiverId',
  as: 'receivedRequests',
  onDelete: 'CASCADE'
});

FriendRequest.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender'
});

FriendRequest.belongsTo(User, {
  foreignKey: 'receiverId',
  as: 'receiver'
});

// Conversation associations
Conversation.belongsToMany(User, {
  through: ConversationParticipant,
  foreignKey: 'conversationId',
  otherKey: 'userId',
  as: 'participants'
});

User.belongsToMany(Conversation, {
  through: ConversationParticipant,
  foreignKey: 'userId',
  otherKey: 'conversationId',
  as: 'conversations'
});

Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  as: 'messages',
  onDelete: 'CASCADE'
});

Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation'
});

// Sync models with database
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ All models were synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing models:', error.message);
    throw error;
  }
};

export { User, Message, FriendRequest, Conversation, ConversationParticipant, syncModels };

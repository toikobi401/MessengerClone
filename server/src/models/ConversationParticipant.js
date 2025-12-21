import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  conversationId: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'conversation_participants',
  timestamps: false,
  indexes: [
    {
      fields: ['userId']
    }
  ]
});

export default ConversationParticipant;

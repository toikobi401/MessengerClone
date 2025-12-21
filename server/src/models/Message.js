import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'video', 'file'),
    defaultValue: 'text',
    allowNull: false
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  users: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array of [senderId, receiverId]'
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: true, // Nullable for backward compatibility
    references: {
      model: 'conversations',
      key: 'id'
    }
  }
}, {
  tableName: 'messages',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      fields: ['senderId']
    },
    {
      fields: ['conversationId']
    },
    {
      fields: ['type']
    }
  ]
});

export default Message;

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
      fields: ['users'],
      type: 'FULLTEXT'
    }
  ]
});

export default Message;

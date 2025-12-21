import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const FriendRequest = sequelize.define('FriendRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  }
}, {
  tableName: 'friend_requests',
  timestamps: true,
  indexes: [
    {
      fields: ['senderId']
    },
    {
      fields: ['receiverId']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['senderId', 'receiverId'],
      name: 'unique_friend_request'
    }
  ]
});

export default FriendRequest;

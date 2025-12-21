import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('private', 'group'),
    defaultValue: 'private',
    allowNull: false
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: [{ name: 'updatedAt', order: 'DESC' }]
    }
  ]
});

export default Conversation;

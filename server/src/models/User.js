import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  googleId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true, // Nullable for Google OAuth users
    validate: {
      len: [6, 255]
    }
  },
  avatarImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: ''
  },
  isAvatarImageSet: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to return user without password
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export default User;

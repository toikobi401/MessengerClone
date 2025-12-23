import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const EmailOtp = sequelize.define('EmailOtp', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  otp_code: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Bcrypt hashed OTP code'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  purpose: {
    type: DataTypes.ENUM('registration', 'login_2fa'),
    allowNull: false,
    defaultValue: 'registration'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'email_otps',
  timestamps: false,
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['expires_at']
    }
  ]
});

// Instance method to check if OTP is expired
EmailOtp.prototype.isExpired = function() {
  return new Date() > this.expires_at;
};

// Static method to clean up expired OTPs
EmailOtp.cleanupExpired = async function() {
  return await this.destroy({
    where: {
      expires_at: {
        [sequelize.Sequelize.Op.lt]: new Date()
      }
    }
  });
};

export default EmailOtp;

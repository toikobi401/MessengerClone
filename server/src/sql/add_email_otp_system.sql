-- Migration: Add Email OTP System
-- Date: 2025-12-23
-- Purpose: Create table for storing temporary OTP codes for email verification (Registration & 2FA)

USE messenger_clone;

-- Create email_otps table
CREATE TABLE IF NOT EXISTS email_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed OTP code',
  expires_at DATETIME NOT NULL,
  purpose ENUM('registration', 'login_2fa') NOT NULL DEFAULT 'registration',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean up expired OTPs (optional scheduled task or manual cleanup)
-- DELETE FROM email_otps WHERE expires_at < NOW();

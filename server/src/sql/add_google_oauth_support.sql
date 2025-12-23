-- ============================================
-- Google OAuth Integration - Database Migration
-- Purpose: Add Google OAuth support to users table
-- ============================================

USE messenger_clone;

-- Add googleId column for Google OAuth
ALTER TABLE users
ADD COLUMN googleId VARCHAR(255) NULL UNIQUE AFTER email;

-- Make password nullable (Google users won't have password initially)
ALTER TABLE users
MODIFY COLUMN password VARCHAR(255) NULL;

-- Ensure avatarImage can store long URLs from Google
ALTER TABLE users
MODIFY COLUMN avatarImage VARCHAR(500) NULL;

-- Add index for googleId for faster lookups
CREATE INDEX idx_googleId ON users(googleId);

-- Verify the changes
DESCRIBE users;

-- Display updated schema
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_KEY,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
AND TABLE_SCHEMA = 'messenger_clone'
ORDER BY ORDINAL_POSITION;

-- ============================================
-- Edit Message Feature - Database Migration
-- Purpose: Add is_edited column to track message edits
-- ============================================

USE messenger_clone;

-- Add is_edited column to messages table
ALTER TABLE messages 
ADD COLUMN is_edited BOOLEAN DEFAULT FALSE AFTER message;

-- Verify the change
DESCRIBE messages;

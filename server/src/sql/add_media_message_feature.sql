-- ============================================
-- Media Message Feature - Database Migration
-- Purpose: Add type column to distinguish text/image/video messages
-- ============================================

USE messenger_clone;

-- Add type column to messages table
ALTER TABLE messages
ADD COLUMN type ENUM('text', 'image', 'video', 'file') DEFAULT 'text' NOT NULL AFTER message;

-- Update existing messages to have 'text' type
UPDATE messages SET type = 'text' WHERE type IS NULL;

-- Verify the change
DESCRIBE messages;

-- ============================================
-- Conversation System Schema Update
-- MySQL Migration Script
-- Purpose: Add conversation tables for persistent chat history
-- ============================================

USE messenger_clone;

-- ============================================
-- Step 1: Create conversations table
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(36) NOT NULL,
  type ENUM('private', 'group') DEFAULT 'private' NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  INDEX idx_type (type),
  INDEX idx_updated_at (updatedAt DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Step 2: Create conversation_participants table (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversationId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  joinedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (conversationId, userId),
  INDEX idx_user_id (userId),
  
  CONSTRAINT fk_cp_conversation
    FOREIGN KEY (conversationId) 
    REFERENCES conversations(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    
  CONSTRAINT fk_cp_user
    FOREIGN KEY (userId) 
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Step 3: Add conversationId to messages table
-- ============================================
-- Check if column exists, if not add it
SET @dbname = 'messenger_clone';
SET @tablename = 'messages';
SET @columnname = 'conversationId';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT ''Column already exists'' AS msg;',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN conversationId VARCHAR(36) NULL AFTER senderId;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add foreign key constraint if not exists
SET @fk_exists = (SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND CONSTRAINT_NAME = 'fk_messages_conversation'
  AND CONSTRAINT_TYPE = 'FOREIGN KEY');

SET @preparedStatement2 = (SELECT IF(
  @fk_exists > 0,
  'SELECT ''Foreign key already exists'' AS msg;',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT fk_messages_conversation FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE ON UPDATE CASCADE;')
));
PREPARE alterIfNotExists2 FROM @preparedStatement2;
EXECUTE alterIfNotExists2;
DEALLOCATE PREPARE alterIfNotExists2;

-- Add index if not exists
SET @index_exists = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @dbname
  AND TABLE_NAME = @tablename
  AND INDEX_NAME = 'idx_conversation_id');

SET @preparedStatement3 = (SELECT IF(
  @index_exists > 0,
  'SELECT ''Index already exists'' AS msg;',
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX idx_conversation_id (conversationId);')
));
PREPARE alterIfNotExists3 FROM @preparedStatement3;
EXECUTE alterIfNotExists3;
DEALLOCATE PREPARE alterIfNotExists3;

-- ============================================
-- Step 4: Migrate existing messages (OPTIONAL - for existing data)
-- ============================================
-- This step creates conversations for existing messages
-- Run this if you have existing messages that need to be migrated

DELIMITER $$

CREATE PROCEDURE migrate_existing_messages()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE msg_id VARCHAR(36);
  DECLARE user1 VARCHAR(36);
  DECLARE user2 VARCHAR(36);
  DECLARE conv_id VARCHAR(36);
  
  -- Cursor to find unique user pairs from existing messages
  DECLARE msg_cursor CURSOR FOR 
    SELECT DISTINCT
      JSON_UNQUOTE(JSON_EXTRACT(users, '$[0]')) as u1,
      JSON_UNQUOTE(JSON_EXTRACT(users, '$[1]')) as u2
    FROM messages
    WHERE conversationId IS NULL;
    
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  OPEN msg_cursor;
  
  read_loop: LOOP
    FETCH msg_cursor INTO user1, user2;
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    -- Generate new conversation ID
    SET conv_id = UUID();
    
    -- Create conversation
    INSERT INTO conversations (id, type, createdAt, updatedAt)
    VALUES (conv_id, 'private', NOW(), NOW());
    
    -- Add participants
    INSERT INTO conversation_participants (conversationId, userId)
    VALUES (conv_id, user1), (conv_id, user2);
    
    -- Update messages with this conversation ID
    UPDATE messages
    SET conversationId = conv_id
    WHERE conversationId IS NULL
      AND (
        (JSON_CONTAINS(users, JSON_QUOTE(user1), '$') AND JSON_CONTAINS(users, JSON_QUOTE(user2), '$'))
      );
      
  END LOOP;
  
  CLOSE msg_cursor;
END$$

DELIMITER ;

-- Execute migration (uncomment if needed)
-- CALL migrate_existing_messages();

-- Cleanup procedure after migration
-- DROP PROCEDURE IF EXISTS migrate_existing_messages;

-- ============================================
-- Step 5: After migration, make conversationId required
-- ============================================
-- Uncomment this after confirming all messages have conversationId
-- ALTER TABLE messages MODIFY conversationId VARCHAR(36) NOT NULL;

-- ============================================
-- Verification Queries
-- ============================================

-- Check conversations
-- SELECT * FROM conversations ORDER BY updatedAt DESC;

-- Check participants
-- SELECT 
--   c.id,
--   c.type,
--   GROUP_CONCAT(u.username) as participants,
--   c.updatedAt
-- FROM conversations c
-- JOIN conversation_participants cp ON c.id = cp.conversationId
-- JOIN users u ON cp.userId = u.id
-- GROUP BY c.id, c.type, c.updatedAt
-- ORDER BY c.updatedAt DESC;

-- Check messages with conversation info
-- SELECT 
--   m.id,
--   m.message,
--   m.conversationId,
--   u.username as sender,
--   m.createdAt
-- FROM messages m
-- JOIN users u ON m.senderId = u.id
-- ORDER BY m.createdAt DESC
-- LIMIT 20;

-- ============================================

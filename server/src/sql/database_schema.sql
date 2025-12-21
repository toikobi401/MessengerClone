-- ============================================
-- Messenger Clone - Database Schema
-- MySQL Database Setup Script
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS messenger_clone
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE messenger_clone;

-- ============================================
-- Drop tables if they exist (for clean setup)
-- ============================================
DROP TABLE IF EXISTS friend_requests;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;

-- ============================================
-- Table: users
-- Stores user account information
-- ============================================
CREATE TABLE users (
  id VARCHAR(36) NOT NULL,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatarImage VARCHAR(500) DEFAULT '',
  isAvatarImageSet TINYINT(1) DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  UNIQUE KEY unique_username (username),
  UNIQUE KEY unique_email (email),
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: messages
-- Stores chat messages between users
-- ============================================
CREATE TABLE messages (
  id VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  users JSON NOT NULL COMMENT 'Array of [senderId, receiverId]',
  senderId VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  INDEX idx_senderId (senderId),
  FULLTEXT INDEX idx_users_fulltext (users),
  
  CONSTRAINT fk_messages_sender
    FOREIGN KEY (senderId) 
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: friend_requests
-- Stores friend request relationships
-- ============================================
CREATE TABLE friend_requests (
  id VARCHAR(36) NOT NULL,
  senderId VARCHAR(36) NOT NULL,
  receiverId VARCHAR(36) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending' NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  INDEX idx_senderId (senderId),
  INDEX idx_receiverId (receiverId),
  INDEX idx_status (status),
  UNIQUE KEY unique_friend_request (senderId, receiverId),
  
  CONSTRAINT fk_friend_requests_sender
    FOREIGN KEY (senderId) 
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    
  CONSTRAINT fk_friend_requests_receiver
    FOREIGN KEY (receiverId) 
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert sample users (passwords are hashed with bcrypt for 'password123')
-- Note: These are example hashes. In production, generate new hashes via your app
INSERT INTO users (id, username, email, password, avatarImage, isAvatarImageSet, createdAt, updatedAt) VALUES
(UUID(), 'john_doe', 'john@example.com', '$2a$10$rVzJKhY7XvPqY8xLZLxQ7.yBqQqKxVx7H3YvV4qXqY7XvPqY8xLZL', '', 0, NOW(), NOW()),
(UUID(), 'jane_smith', 'jane@example.com', '$2a$10$rVzJKhY7XvPqY8xLZLxQ7.yBqQqKxVx7H3YvV4qXqY7XvPqY8xLZL', '', 0, NOW(), NOW());

-- ============================================
-- Verification Queries
-- ============================================

-- View all tables
SHOW TABLES;

-- View users table structure
DESCRIBE users;

-- View messages table structure
DESCRIBE messages;

-- Count users
SELECT COUNT(*) AS total_users FROM users;

-- Count messages
SELECT COUNT(*) AS total_messages FROM messages;

-- ============================================
-- Useful Queries for Development
-- ============================================

-- Get all users
-- SELECT id, username, email, avatarImage, isAvatarImageSet, createdAt FROM users;

-- Get messages between two users
-- SELECT m.*, u.username as sender_name 
-- FROM messages m
-- JOIN users u ON m.senderId = u.id
-- WHERE JSON_CONTAINS(m.users, JSON_ARRAY('user-id-1', 'user-id-2'), '$')
-- ORDER BY m.createdAt ASC;

-- Get message count for each user
-- SELECT u.username, COUNT(m.id) as message_count
-- FROM users u
-- LEFT JOIN messages m ON u.id = m.senderId
-- GROUP BY u.id, u.username;

-- ============================================
-- Maintenance Queries
-- ============================================

-- Clear all messages
-- TRUNCATE TABLE messages;

-- Clear all users (will also clear messages due to CASCADE)
-- TRUNCATE TABLE users;

-- Reset database
-- DROP DATABASE messenger_clone;
-- CREATE DATABASE messenger_clone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

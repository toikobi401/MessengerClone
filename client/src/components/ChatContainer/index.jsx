import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Loader2, ImagePlus } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import useChatStore from '../../store/chatStore';
import { messageAPI } from '../../services/api';
import { conversationAPI } from '../../services/conversationApi';
import { getSocket } from '../../utils/socket';
import MessageBubble from '../MessageBubble';
import styles from './styles.module.css';
import { formatMessageTime } from './animations';

const ChatContainer = () => {
  const { 
    currentUser, 
    selectedChat, 
    currentConversationId,
    setConversationId,
    messages, 
    setMessages, 
    addMessage, 
    updateMessage,
    onlineUsers 
  } = useChatStore();
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = getSocket();

  // Initialize conversation and fetch messages when chat is selected
  useEffect(() => {
    const initChatAndFetchMessages = async () => {
      if (!currentUser || !selectedChat) return;

      setIsLoading(true);
      try {
        // Step 1: Initialize or get conversation
        const convResponse = await conversationAPI.initConversation(selectedChat.id);
        if (convResponse.success) {
          const conversationId = convResponse.data.conversationId;
          setConversationId(conversationId);

          // Step 2: Fetch messages for this conversation
          const msgResponse = await conversationAPI.getMessages(conversationId);
          if (msgResponse.success) {
            setMessages(msgResponse.data);
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        
        // Fallback to old API if new one fails
        try {
          const response = await messageAPI.getMessages(currentUser.id, selectedChat.id);
          if (response.success) {
            setMessages(response.data);
          }
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initChatAndFetchMessages();
  }, [selectedChat, currentUser, setMessages, setConversationId]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceive = (data) => {
      const { from, message, type = 'text' } = data;
      
      // Only add message if it's from the currently selected chat
      if (from === selectedChat?.id) {
        addMessage({
          message,
          type,
          fromSelf: false,
          senderId: from,
          createdAt: new Date().toISOString()
        });
      }
    };

    const handleMessageUpdate = (data) => {
      const { messageId, content, isEdited } = data;
      updateMessage(messageId, content);
    };

    socket.on('msg-recieve', handleMessageReceive);
    socket.on('msg-updated', handleMessageUpdate);

    return () => {
      socket.off('msg-recieve', handleMessageReceive);
      socket.off('msg-updated', handleMessageUpdate);
    };
  }, [socket, selectedChat, addMessage, updateMessage]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEmojiClick = (emojiData) => {
    setInputMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Only image and video files are allowed');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Check if we have either a message or a file
    if ((!inputMessage.trim() && !selectedFile) || !currentUser || !selectedChat || !currentConversationId || isSending) {
      return;
    }

    const messageText = inputMessage.trim();
    setInputMessage('');
    setShowEmojiPicker(false);
    setIsSending(true);

    try {
      let response;
      let messageType = 'text';
      let messageContent = messageText;

      if (selectedFile) {
        // Send file using FormData
        const formData = new FormData();
        formData.append('from', currentUser.id);
        formData.append('to', selectedChat.id);
        formData.append('conversationId', currentConversationId);
        formData.append('file', selectedFile);
        
        if (messageText) {
          formData.append('message', messageText);
        }

        response = await conversationAPI.sendMessage(formData, true); // true = isFormData
        
        if (response.success) {
          messageContent = response.data.message; // Cloudinary URL
          messageType = response.data.type;
        }

        handleRemoveFile();
      } else {
        // Send text message
        response = await conversationAPI.sendMessage({
          from: currentUser.id,
          to: selectedChat.id,
          message: messageText,
          conversationId: currentConversationId
        });
      }

      if (response.success) {
        // Add message to local state
        addMessage({
          message: messageContent,
          type: messageType,
          fromSelf: true,
          senderId: currentUser.id,
          createdAt: new Date().toISOString()
        });

        // Send message via socket with conversationId
        socket.emit('send-msg', {
          to: selectedChat.id,
          from: currentUser.id,
          msg: messageContent,
          type: messageType,
          conversationId: currentConversationId
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (!selectedFile) {
        setInputMessage(messageText); // Restore message on error
      }
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    if (!newContent.trim() || !socket) return;

    try {
      const response = await messageAPI.editMessage(messageId, newContent);
      
      if (response.success) {
        updateMessage(messageId, newContent);
        
        socket.emit('edit-msg', {
          messageId,
          content: newContent,
          conversationId: currentConversationId,
          isEdited: true,
          to: selectedChat.id
        });
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const isUserOnline = onlineUsers.includes(selectedChat?.id);

  return (
    <div className={styles.container}>
      {/* Chat Header */}
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          {selectedChat.avatarImage && selectedChat.isAvatarImageSet ? (
            <img
              src={selectedChat.avatarImage}
              alt={selectedChat.username}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {selectedChat.username.charAt(0).toUpperCase()}
            </div>
          )}
          {isUserOnline && <span className={styles.onlineBadge} />}
        </div>
        <div>
          <h2 className={styles.username}>{selectedChat.username}</h2>
          <p className={styles.status}>
            {isUserOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader2 className={styles.spinner} />
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyContainer}>
            <p className={styles.emptyText}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMyMessage = msg.senderId === currentUser.id;
            
            return (
              <MessageBubble
                key={msg.id || index}
                message={msg}
                isMyMessage={isMyMessage}
                friendAvatar={selectedChat.avatarImage}
                friendUsername={selectedChat.username}
                onEditMessage={handleEditMessage}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        {/* File Preview */}
        {filePreview && (
          <div className={styles.filePreview}>
            {selectedFile?.type.startsWith('image/') ? (
              <img src={filePreview} alt="Preview" className={styles.previewImage} />
            ) : (
              <video src={filePreview} className={styles.previewVideo} />
            )}
            <button
              type="button"
              onClick={handleRemoveFile}
              className={styles.removeFileBtn}
            >
              ✕
            </button>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className={styles.emojiPickerWrapper}>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              width={350}
              height={400}
            />
          </div>
        )}

        <form onSubmit={handleSendMessage} className={styles.inputForm}>
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            style={{ display: 'none' }}
          />

          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={styles.imageBtn}
            disabled={isSending}
            title="Upload Image/Video"
          >
            <ImagePlus className={styles.imageIcon} />
          </button>

          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={styles.emojiBtn}
            disabled={isSending}
          >
            <Smile className={styles.emojiIcon} />
          </button>

          {/* Message Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className={styles.messageInput}
            disabled={isSending}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputMessage.trim() && !selectedFile) || isSending}
            className={styles.sendBtn}
          >
            {isSending ? (
              <Loader2 className={styles.sendSpinner} />
            ) : (
              <Send className={styles.sendIcon} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;

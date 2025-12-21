import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Loader2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import useChatStore from '../store/chatStore';
import { messageAPI } from '../services/api';
import { getSocket } from '../utils/socket';

const ChatContainer = () => {
  const { currentUser, selectedChat, messages, setMessages, addMessage, onlineUsers } = useChatStore();
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = getSocket();

  // Fetch messages when chat is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser || !selectedChat) return;

      setIsLoading(true);
      try {
        const response = await messageAPI.getMessages(currentUser.id, selectedChat.id);
        if (response.success) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat, currentUser, setMessages]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceive = (data) => {
      const { from, message } = data;
      
      // Only add message if it's from the currently selected chat
      if (from === selectedChat?.id) {
        addMessage({
          message,
          fromSelf: false,
          senderId: from,
          createdAt: new Date().toISOString()
        });
      }
    };

    socket.on('msg-recieve', handleMessageReceive);

    return () => {
      socket.off('msg-recieve', handleMessageReceive);
    };
  }, [socket, selectedChat, addMessage]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEmojiClick = (emojiData) => {
    setInputMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !currentUser || !selectedChat || isSending) {
      return;
    }

    const messageText = inputMessage.trim();
    setInputMessage('');
    setShowEmojiPicker(false);
    setIsSending(true);

    try {
      // Save message to database
      const response = await messageAPI.addMessage({
        from: currentUser.id,
        to: selectedChat.id,
        message: messageText
      });

      if (response.success) {
        // Add message to local state
        addMessage({
          message: messageText,
          fromSelf: true,
          senderId: currentUser.id,
          createdAt: new Date().toISOString()
        });

        // Send message via socket
        socket.emit('send-msg', {
          to: selectedChat.id,
          from: currentUser.id,
          msg: messageText
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setInputMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const isUserOnline = onlineUsers.includes(selectedChat?.id);

  return (
    <div className="h-full flex flex-col bg-secondary">
      {/* Chat Header */}
      <div className="bg-tertiary border-b border-white/10 p-4 flex items-center gap-4">
        <div className="relative">
          {selectedChat.avatarImage && selectedChat.isAvatarImageSet ? (
            <img
              src={selectedChat.avatarImage}
              alt={selectedChat.username}
              className="avatar"
            />
          ) : (
            <div className="avatar bg-primary/30 flex items-center justify-center text-lg font-semibold">
              {selectedChat.username.charAt(0).toUpperCase()}
            </div>
          )}
          {isUserOnline && <span className="badge-online" />}
        </div>
        <div>
          <h2 className="font-semibold text-white text-lg">{selectedChat.username}</h2>
          <p className="text-sm text-gray-400">
            {isUserOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.fromSelf ? 'justify-end animate-slide-in-right' : 'justify-start animate-slide-in-left'}`}
            >
              <div className={msg.fromSelf ? 'message-sent' : 'message-received'}>
                <p className="text-sm">{msg.message}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-tertiary border-t border-white/10 p-4">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-24 right-8">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              width={350}
              height={400}
            />
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 hover:bg-primary/20 rounded-full transition-colors"
            disabled={isSending}
          >
            <Smile className="w-6 h-6 text-primary" />
          </button>

          {/* Message Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-field"
            disabled={isSending}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="p-3 bg-primary hover:bg-accent rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSending ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Send className="w-6 h-6 text-white" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;

import { Server } from 'socket.io';

let io;

// Store online users
global.onlineUsers = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Handle user joining
    socket.on('add-user', (userId) => {
      global.onlineUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} is now online`);
      
      // Broadcast online users to all clients
      io.emit('online-users', Array.from(global.onlineUsers.keys()));
    });

    // Handle sending message
    socket.on('send-msg', (data) => {
      const { to, from, msg, type = 'text' } = data; // Support media type
      const sendUserSocket = global.onlineUsers.get(to);
      
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit('msg-recieve', {
          from,
          message: msg,
          type // Include message type for media messages
        });
        console.log(`📨 Message (${type}) sent from ${from} to ${to}`);
      } else {
        console.log(`❌ User ${to} is offline`);
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { to, from, isTyping } = data;
      const receiverSocket = global.onlineUsers.get(to);
      
      if (receiverSocket) {
        socket.to(receiverSocket).emit('user-typing', {
          from,
          isTyping
        });
      }
    });

    // Handle friend request sent
    socket.on('friend-request-sent', (data) => {
      const { receiverId, sender } = data;
      const receiverSocket = global.onlineUsers.get(receiverId);
      
      if (receiverSocket) {
        socket.to(receiverSocket).emit('new-friend-request', {
          sender
        });
        console.log(`👥 Friend request sent from ${sender.username} to ${receiverId}`);
      }
    });

    // Handle friend request accepted
    socket.on('friend-request-accepted', (data) => {
      const { senderId, acceptor } = data;
      const senderSocket = global.onlineUsers.get(senderId);
      
      if (senderSocket) {
        socket.to(senderSocket).emit('request-accepted', {
          friend: acceptor
        });
        console.log(`✅ ${acceptor.username} accepted friend request from ${senderId}`);
      }
    });

    // Handle message edit
    socket.on('edit-msg', (data) => {
      const { messageId, content, conversationId, isEdited, to } = data;
      const receiverSocket = global.onlineUsers.get(to);
      
      if (receiverSocket) {
        socket.to(receiverSocket).emit('msg-updated', {
          messageId,
          content,
          isEdited,
          conversationId
        });
        console.log(`✏️ Message ${messageId} edited in conversation ${conversationId}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      
      // Remove user from online users
      for (const [userId, socketId] of global.onlineUsers.entries()) {
        if (socketId === socket.id) {
          global.onlineUsers.delete(userId);
          console.log(`👋 User ${userId} went offline`);
          
          // Broadcast updated online users list
          io.emit('online-users', Array.from(global.onlineUsers.keys()));
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

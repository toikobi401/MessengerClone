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
      const { to, from, msg } = data;
      const sendUserSocket = global.onlineUsers.get(to);
      
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit('msg-recieve', {
          from,
          message: msg
        });
        console.log(`📨 Message sent from ${from} to ${to}`);
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

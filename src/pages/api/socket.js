import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle message sending from dashboard screens
      socket.on('send-message', (data) => {
        // Generate a unique messageId on the server to ensure all clients get the same ID
        const messageId = `${data.roomId}-${Date.now()}`;
        const messageData = {
          ...data,
          messageId: messageId
        };
        // Broadcast to all clients (especially catering screen)
        io.emit('message-sent', messageData);
      });

      // Handle message seen action from catering screen
      socket.on('message-seen', (data) => {
        // Broadcast to all clients (especially dashboard screens)
        io.emit('message-seen', data);
      });

      // Handle message resolved action from catering screen
      socket.on('message-resolved', (data) => {
        // Broadcast to all clients (especially dashboard screens)
        io.emit('message-resolved', data);
      });

      // Handle message cancelled action from dashboard screen
      socket.on('cancel-message', (data) => {
        // Broadcast to all clients (especially catering screen)
        io.emit('message-cancelled', data);
      });

      // Handle reset action
      socket.on('reset-system', () => {
        io.emit('system-reset');
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  res.end();
};

export default SocketHandler; 
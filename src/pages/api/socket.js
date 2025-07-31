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

      // Handle room actions from top buttons (2x2 grid) - do nothing for now
      socket.on('room-action', (data) => {
        console.log('Room action triggered (no effect):', data);
        // Broadcast to all clients but no functionality yet
        io.emit('room-action-response', data);
      });

      // Handle room state changes from bottom buttons (1x4 grid) - change display
      socket.on('room-state-change', (data) => {
        console.log('Room state change triggered:', data);
        // Broadcast to all clients (changes Display page)
        io.emit('room-state-change', data);
      });

      // Handle reset action
      socket.on('reset-system', () => {
        console.log('System reset triggered');
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
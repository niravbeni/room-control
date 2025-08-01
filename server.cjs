const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
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

    // Handle custom message events
    socket.on('custom-message', (data) => {
      console.log('Custom message triggered:', data);
      // Broadcast custom message to all clients
      io.emit('custom-message', data);
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

  // Start the server
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 
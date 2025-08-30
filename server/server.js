import express from 'express';
import { Server } from 'socket.io';
import connectDB from './db.js';
import { NoteController } from './controllers/noteController.js';
import { createNoteRoutes } from './routes/noteRoutes.js';
import { setupNoteSocket } from './websockets/noteSocket.js';

const app = express();
app.use(express.json());

// Setup database
await connectDB();
console.log('Database connection established');

// Initialize controller
const noteController = new NoteController();

// Setup routes
app.use(createNoteRoutes(noteController));

// Start Express server (Dave's way)
const PORT = process.env.PORT || 5030;
const expressServer = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

// Setup Socket.IO on same server (Dave's way)
const io = new Server(expressServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL 
      : "http://localhost:5173"
  }
});

// Setup Socket.IO events
setupNoteSocket(io, noteController);

// Clean up expired notes every day
setInterval(async () => {
  try {
    await noteController.cleanupExpiredNotes();
    console.log('🧹 Expired notes cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up expired notes:', error);
  }
}, 24 * 60 * 60 * 1000);

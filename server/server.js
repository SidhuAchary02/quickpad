import { configDotenv } from 'dotenv';
configDotenv();

import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import { NoteController } from './controllers/noteController.js';
import { createNoteRoutes } from './routes/noteRoutes.js';
import { createPasswordRoutes } from './routes/passwordRoutes.js';
import { setupNoteSocket } from './websockets/noteSocket.js';
import connectDB from './db.js';

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Setup database
await connectDB();
console.log('Database connection established');

// Initialize controller
const noteController = new NoteController();

// Setup routes
app.use('/api/auth', authRoutes);
app.use(createPasswordRoutes(noteController));
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
      : "http://localhost:5173",
    credentials: true
  },
});

// Setup Socket.IO events
setupNoteSocket(io, noteController);

// Clean up expired notes every hour
setInterval(async () => {
  try {
    await noteController.cleanupExpiredNotes();
    console.log('🧹 Expired notes cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up expired notes:', error);
  }
}, 60 * 60 * 1000);

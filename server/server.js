import { configDotenv } from 'dotenv';
configDotenv();

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import with correct paths and .js extensions
import { setupDatabase } from './db.js';
import { NoteController } from './controllers/noteController.js';
import { createNoteRoutes } from './routes/noteRoutes.js';
import { setupNoteSocket } from './websockets/noteSocket.js';

const app = express();
app.use(cors());
app.use(express.json());

// Setup database
const db = await setupDatabase();
const noteController = new NoteController(db);

// Setup routes
app.use(createNoteRoutes(noteController));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend/dist/index.html'));
  });
}

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server });
setupNoteSocket(wss, noteController);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  
  // Clean up expired notes every hour
  setInterval(async () => {
    await noteController.cleanupExpiredNotes();
    console.log('Expired notes cleaned up');
  }, 60 * 60 * 1000);
});
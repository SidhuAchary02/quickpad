import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws'; // Correct import
import http from 'http';
import { configDotenv } from 'dotenv';
configDotenv();

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server }); // Use WebSocketServer instead

let document = ""; // Store the document content

wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Send the current document state to the new client
    ws.send(JSON.stringify({ type: 'init', data: document }));

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.type === 'update') {
                document = parsedMessage.data;
                // Broadcast the update to all connected clients
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'update', data: document }));
                    }
                });
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
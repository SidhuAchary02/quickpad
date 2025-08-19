// src/websockets/noteSocket.js
export function setupNoteSocket(wss, noteController) {
  // Store active connections per note
  const noteConnections = new Map();

  wss.on('connection', async (ws, req) => {
    // Extract note ID from URL
    const urlParts = req.url.split('/');
    const noteId = urlParts[urlParts.length - 1];
    
    if (!noteId) {
      ws.close(1008, 'Note ID required');
      return;
    }
    
    console.log(`New client connected for note: ${noteId}`);
    
    try {
      // Check if note exists, if not create it
      let note = await noteController.getNoteById(noteId);
      if (!note) {
        console.log(`Note ${noteId} not found, creating new note`);
        try {
          note = await noteController.createNoteWithId(noteId, '');
        } catch (error) {
          // If creation fails, try to get the note again (might have been created by another connection)
          console.log(`Failed to create note ${noteId}, trying to retrieve again`);
          note = await noteController.getNoteById(noteId);
          if (!note) {
            console.error(`Failed to create or retrieve note: ${noteId}`);
            ws.close(1011, 'Failed to create note');
            return;
          }
        }
      }
      
      // Initialize connections map for this note if it doesn't exist
      if (!noteConnections.has(noteId)) {
        noteConnections.set(noteId, {
          content: note.content,
          password_hash: note.password_hash,
          clients: new Set()
        });
      }
      
      const noteState = noteConnections.get(noteId);
      noteState.clients.add(ws);
      
      // Send current document state
      ws.send(JSON.stringify({ 
        type: 'init', 
        data: noteState.content,
        hasPassword: !!noteState.password_hash
      }));
      
      ws.on('message', async (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          
          if (parsedMessage.type === 'auth') {
            // Handle authentication for protected notes
            if (noteState.password_hash) {
              const passwordMatch = await noteController.verifyPassword(noteId, parsedMessage.password);
              if (passwordMatch) {
                ws.authenticated = true;
                ws.send(JSON.stringify({ type: 'auth_success' }));
              } else {
                ws.send(JSON.stringify({ type: 'auth_failed' }));
              }
            }
            return;
          }
          
          // Only allow updates if authenticated or note isn't protected
          if (noteState.password_hash && !ws.authenticated) {
            ws.send(JSON.stringify({ type: 'auth_required' }));
            return;
          }
          
          if (parsedMessage.type === 'update') {
            // Update note content
            noteState.content = parsedMessage.data;
            
            // Update database
            await noteController.updateNoteContent(noteId, noteState.content);
            
            // Broadcast to all authenticated clients
            noteState.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN && 
                  (client.authenticated || !noteState.password_hash)) {
                client.send(JSON.stringify({ type: 'update', data: noteState.content }));
              }
            });
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log(`Client disconnected from note: ${noteId}`);
        if (noteState) {
          noteState.clients.delete(ws);
          
          // Clean up if no clients left
          if (noteState.clients.size === 0) {
            noteConnections.delete(noteId);
          }
        }
      });
    } catch (error) {
      console.error('Error in WebSocket connection:', error);
      ws.close(1011, 'Internal server error');
    }
  });
}
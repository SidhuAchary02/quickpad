// websockets/noteSocket.js
export function setupNoteSocket(io, noteController) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join note room
    socket.on('join-note', async (noteId) => {
      try {
        // Check if note exists, create if not
        let note = await noteController.getNoteById(noteId);
        if (!note) {
          console.log(`Creating new note: ${noteId}`);
          note = await noteController.createNoteWithId(noteId, '');
        }

        // Join the note room
        socket.join(noteId);
        socket.noteId = noteId;

        // Send current content
        socket.emit('note-content', {
          content: note.content,
          hasPassword: !!note.password_hash
        });

        console.log(`User ${socket.id} joined note: ${noteId}`);
      } catch (error) {
        console.error('Error joining note:', error);
        socket.emit('error', 'Failed to join note');
      }
    });

    // Handle authentication
    socket.on('auth', async (data) => {
      const { noteId, password } = data;
      
      try {
        const isValid = await noteController.verifyPassword(noteId, password);
        if (isValid) {
          socket.authenticated = true;
          socket.emit('auth-success');
        } else {
          socket.emit('auth-failed');
        }
      } catch (error) {
        socket.emit('auth-failed');
      }
    });

    // Handle content updates
    socket.on('update-content', async (data) => {
      const { noteId, content } = data;
      
      try {
        // Check if note is protected and user is authenticated
        const note = await noteController.getNoteById(noteId);
        if (note.password_hash && !socket.authenticated) {
          socket.emit('auth-required');
          return;
        }

        // Update in database
        await noteController.updateNoteContent(noteId, content);

        // Broadcast to all users in the room
        socket.to(noteId).emit('content-updated', { content });
        
      } catch (error) {
        console.error('Error updating content:', error);
        socket.emit('error', 'Failed to update content');
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      if (socket.noteId) {
        socket.leave(socket.noteId);
      }
    });
  });
}

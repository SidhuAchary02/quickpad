// src/routes/noteRoutes.js
import { Router } from 'express';

export function createNoteRoutes(noteController) {
  const router = Router();

  // Create a new note
  router.post('/api/notes', async (req, res) => {
    try {
      const { content, password } = req.body;
      const note = await noteController.createNote(content, password);
      res.json({ 
        id: note.id, 
        url: `/${note.id}`, 
        expires_at: note.expires_at 
      });
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({ error: 'Failed to create note' });
    }
  });

  // Get note metadata
  router.get('/api/notes/:id/meta', async (req, res) => {
    try {
      const { id } = req.params;
      const note = await noteController.getNoteById(id);
      
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      res.json({ 
        id, 
        hasPassword: !!note.password_hash,
        expires_at: note.expires_at
      });
    } catch (error) {
      console.error('Error fetching note meta:', error);
      res.status(500).json({ error: 'Failed to fetch note' });
    }
  });

  // Access note content (with password if protected)
  router.post('/api/notes/:id/access', async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      
      const note = await noteController.getNoteById(id);
      
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      if (note.password_hash) {
        if (!password) {
          return res.status(401).json({ error: 'Password required' });
        }
        
        const passwordMatch = await noteController.verifyPassword(id, password);
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid password' });
        }
      }
      
      res.json({ content: note.content });
    } catch (error) {
      console.error('Error accessing note:', error);
      res.status(500).json({ error: 'Failed to access note' });
    }
  });

  return router;
}
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

export function createPasswordRoutes(noteController) {
  const router = express.Router();

  // Set password for note
  router.post('/api/notes/:id/password', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      const userId = req.user.userId;

      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      await noteController.setNotePassword(id, password, userId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error setting password:', error);
      res.status(error.message.includes('owner') ? 403 : 500).json({ 
        error: error.message || 'Failed to set password' 
      });
    }
  });

  // Remove password from note
  router.delete('/api/notes/:id/password', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await noteController.removeNotePassword(id, userId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing password:', error);
      res.status(error.message.includes('owner') ? 403 : 500).json({ 
        error: error.message || 'Failed to remove password' 
      });
    }
  });

  return router;
}

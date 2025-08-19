// controllers/noteController.js
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class NoteController {
  constructor(db) {
    this.db = db;
  }

  // Create a new note with a specific ID
  async createNoteWithId(id, content, password = null) {
    const password_hash = password ? await bcrypt.hash(password, 10) : null;
    
    // Set expiration to 30 days from now
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 30);
    
    try {
      await this.db.run(
        'INSERT INTO notes (id, content, password_hash, expires_at) VALUES (?, ?, ?, ?)',
        [id, content, password_hash, expires_at.toISOString()]
      );
      
      // Return the full note object
      return this.getNoteById(id);
    } catch (error) {
      // If there's a unique constraint violation (duplicate ID), return null
      if (error.code === 'SQLITE_CONSTRAINT') {
        return null;
      }
      throw error;
    }
  }

  // Get note by ID
  async getNoteById(id) {
    return await this.db.get('SELECT * FROM notes WHERE id = ?', [id]);
  }

  // Check if note exists
  async noteExists(id) {
    const note = await this.db.get('SELECT id FROM notes WHERE id = ?', [id]);
    return !!note;
  }

  // Update note content
  async updateNoteContent(id, content) {
    await this.db.run(
      'UPDATE notes SET content = ? WHERE id = ?',
      [content, id]
    );
  }

  // Verify password for protected note
  async verifyPassword(id, password) {
    const note = await this.getNoteById(id);
    if (!note || !note.password_hash) return false;
    
    return await bcrypt.compare(password, note.password_hash);
  }

  // Clean up expired notes
  async cleanupExpiredNotes() {
    const now = new Date().toISOString();
    await this.db.run('DELETE FROM notes WHERE expires_at < ?', [now]);
  }
}
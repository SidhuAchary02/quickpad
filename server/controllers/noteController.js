// controllers/noteController.js
import bcrypt from "bcrypt";
import { Note } from "../models/noteModel.js";

export class NoteController {
  // No constructor needed with Mongoose!

  // Create a new note with a specific ID
  async createNoteWithId(id, content, password = null) {
    const password_hash = password ? await bcrypt.hash(password, 10) : null;

    // Set expiration to 30 days from now
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 30);

    try {
      const note = new Note({
        id,
        content,
        password_hash,
        expires_at,
      });

      await note.save();
      return note;
    } catch (error) {
      // If duplicate ID, return null
      if (error.code === 11000) {
        return null;
      }
      throw error;
    }
  }

  // Add this method to NoteController
  async createNote(content = "", password = null) {
    // Generate random ID (like notepad.pw does)
    const id = Math.random().toString(36).substring(2, 15);
    return await this.createNoteWithId(id, content, password);
  }

  // Get note by ID
  async getNoteById(id) {
    return await Note.findOne({ id });
  }

  // Check if note exists
  async noteExists(id) {
    const note = await Note.findOne({ id }).select("id");
    return !!note;
  }

  // Update note content
  async updateNoteContent(id, content) {
    await Note.updateOne({ id }, { content });
  }

  // Verify password for protected note
  async verifyPassword(id, password) {
    const note = await this.getNoteById(id);
    if (!note || !note.password_hash) return false;

    return await bcrypt.compare(password, note.password_hash);
  }

  // Clean up expired notes
  async cleanupExpiredNotes() {
    const now = new Date();
    await Note.deleteMany({ expires_at: { $lt: now } });
  }
}

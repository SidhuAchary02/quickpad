// controllers/noteController.js
import bcrypt from "bcrypt";
import { Note } from "../models/noteModel.js";

export class NoteController {
  // Create a new note with a specific ID (ONLY keep this version)
  async createNoteWithId(id, content, password = null, userId = null) {
    const password_hash = password ? await bcrypt.hash(password, 10) : null;
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 30);

    console.log(`🔧 Creating note ${id} with owner: ${userId}`); // Add debug

    try {
      const note = new Note({
        id,
        content,
        password_hash,
        expires_at,
        owner: userId || null, // This line sets ownership
      });

      await note.save();
      console.log(`✅ Note created with owner: ${note.owner}`); // Add debug
      return note;
    } catch (error) {
      if (error.code === 11000) {
        return null;
      }
      throw error;
    }
  }

  // Create note with random ID
  async createNote(content = "", password = null, userId = null) {
    const id = Math.random().toString(36).substring(2, 15);
    return await this.createNoteWithId(id, content, password, userId);
  }

  // ... rest of your methods stay the same
  async getNoteById(id) {
    return await Note.findOne({ id });
  }

  async noteExists(id) {
    const note = await Note.findOne({ id }).select("id");
    return !!note;
  }

  async updateNoteContent(id, content) {
    await Note.updateOne({ id }, { content });
  }

  async verifyPassword(id, password) {
    const note = await this.getNoteById(id);
    if (!note || !note.password_hash) return false;
    return await bcrypt.compare(password, note.password_hash);
  }

  async cleanupExpiredNotes() {
    const now = new Date();
    await Note.deleteMany({ expires_at: { $lt: now } });
  }

  async setNotePassword(noteId, password, userId) {
    try {
      const note = await Note.findOne({ id: noteId });
      if (!note) {
        throw new Error("Note not found");
      }

      if (!note.owner || note.owner.toString() !== userId) {
        throw new Error("Only note owner can set password");
      }

      const password_hash = await bcrypt.hash(password, 10);
      await Note.updateOne({ id: noteId }, { password_hash });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async removeNotePassword(noteId, userId) {
    try {
      const note = await Note.findOne({ id: noteId });
      if (!note) {
        throw new Error("Note not found");
      }

      if (!note.owner || note.owner.toString() !== userId) {
        throw new Error("Only note owner can remove password");
      }

      await Note.updateOne({ id: noteId }, { $unset: { password_hash: "" } });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async checkNoteOwnership(noteId, userId) {
    if (!userId) return false;
    const note = await Note.findOne({ id: noteId });
    return note && note.owner && note.owner.toString() === userId;
  }
}
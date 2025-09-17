// controllers/noteController.js
import bcrypt from "bcrypt";
import { Note } from "../models/noteModel.js";

// Complete working controller
export class NoteController {
  async createNoteWithId(id, content, password = null, userId = null) {
    const password_hash = password ? await bcrypt.hash(password, 10) : null;
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 30);

    console.log(`🔧 Creating note ${id} with owner: ${userId}`);

    try {
      // CRITICAL: Check if note already exists BEFORE creating
      const existingNote = await Note.findOne({ url: id });
      console.log("🔧 Pre-creation check for URL:", id);
      console.log("🔧 Existing note found:", existingNote ? "YES" : "NO");

      if (existingNote) {
        console.log("🔧 Existing note details:", {
          id: existingNote._id,
          url: existingNote.url,
          owner: existingNote.owner,
        });
        throw new Error("URL already exists");
      }

      const note = new Note({
        url: id,
        content,
        password_hash,
        expires_at,
        owner: userId || null,
      });

      console.log("🔧 About to save note with URL:", note.url);
      await note.save();
      console.log(`✅ Note created successfully with _id: ${note._id}`);
      return note;
    } catch (error) {
      console.error("🔧 Error details:", {
        name: error.name,
        code: error.code,
        message: error.message,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue,
      });

      if (error.code === 11000) {
        console.log(`❌ Duplicate key error for ${id}`);
        console.log(
          "❌ Duplicate key details:",
          error.keyPattern,
          error.keyValue
        );
        throw new Error("URL already exists");
      }
      throw error;
    }
  }

  async createNote(content = "", password = null, userId = null) {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    const id = timestamp + randomPart;

    return await this.createNoteWithId(id, content, password, userId);
  }

  async getNoteById(id) {
    console.log("🔧 getNoteById searching for:", id);
    const note = await Note.findOne({ url: id });
    console.log("🔧 getNoteById result:", note ? "FOUND" : "NOT FOUND");
    return note;
  }

  async noteExists(id) {
    const note = await Note.findOne({ url: id }).select("url");
    return !!note;
  }

  async updateNoteContent(id, content) {
    console.log("🔧 Updating content for note:", id);
    const result = await Note.updateOne(
      {
        url: id,
      },
      { content },
      { new: true }
    );
    console.log(
      "🔧 Update result:",
      result.modifiedCount > 0 ? "SUCCESS" : "FAILED"
    );
    return result;
  }

  async verifyPassword(id, password) {
    console.log("🔧 Verifying password for note:", id);
    const note = await this.getNoteById(id);
    if (!note || !note.password_hash) {
      console.log("🔧 Password verification: NO PASSWORD SET");
      return false;
    }
    const isValid = await bcrypt.compare(password, note.password_hash);
    console.log(
      "🔧 Password verification result:",
      isValid ? "VALID" : "INVALID"
    );
    return isValid;
  }

  async setNotePassword(noteId, password, userId) {
    console.log("🔧 setNotePassword Debug:");
    console.log("- noteId:", noteId);
    console.log("- userId:", userId, typeof userId);

    const note = await Note.findOne({ url: noteId });
    if (!note) throw new Error("Note not found");

    console.log("- note.owner:", note.owner, typeof note.owner);
    console.log(
      "- note.owner.toString():",
      note.owner ? note.owner.toString() : "null"
    );
    console.log(
      "- Comparison result:",
      note.owner ? note.owner.toString() === userId : false
    );

    if (!note.owner || note.owner.toString() !== userId) {
      throw new Error("Only note owner can set password");
    }

    const password_hash = await bcrypt.hash(password, 10);
    await Note.updateOne({ url: noteId }, { password_hash });
    return { success: true };
  }

  async removeNotePassword(noteId, userId) {
    const note = await Note.findOne({ url: noteId });
    if (!note) throw new Error("Note not found");
    if (!note.owner || note.owner.toString() !== userId) {
      throw new Error("Only note owner can remove password");
    }
    await Note.updateOne({ url: noteId }, { $unset: { password_hash: "" } });
    return { success: true };
  }

  async checkNoteOwnership(noteId, userId) {
    if (!userId) return false;
    const note = await Note.findOne({ url: noteId });
    return note && note.owner && note.owner.toString() === userId;
  }
}

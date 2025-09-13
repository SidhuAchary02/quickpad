// routes/noteRoutes.js
import { Router } from "express";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { Note } from "../models/noteModel.js";

export function createNoteRoutes(noteController) {
  const router = Router();

  // Create a new note
  router.post("/api/notes", optionalAuth, async (req, res) => {
    try {
      const { content, password } = req.body;
      const userId = req.user?.id || null;
      const note = await noteController.createNote(content, password, userId);
      res.json({
        id: note.url,
        url: `/${note.url}`,
        expires_at: note.expires_at,
      });
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  // Get note metadata
  router.get("/api/notes/:id/meta", async (req, res) => {
    try {
      const { id } = req.params;
      const note = await noteController.getNoteById(id);

      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      res.json({
        id: note.url,
        hasPassword: !!note.password_hash,
        expires_at: note.expires_at,
      });
    } catch (error) {
      console.error("Error fetching note meta:", error);
      res.status(500).json({ error: "Failed to fetch note" });
    }
  });

  // Access note content (with password if protected)
  router.post("/api/notes/:id/access", async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;

      const note = await noteController.getNoteById(id);

      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      if (note.password_hash) {
        if (!password) {
          return res.status(401).json({ error: "Password required" });
        }

        const passwordMatch = await noteController.verifyPassword(id, password);
        if (!passwordMatch) {
          return res.status(401).json({ error: "Invalid password" });
        }
      }

      res.json({ content: note.content });
    } catch (error) {
      console.error("Error accessing note:", error);
      res.status(500).json({ error: "Failed to access note" });
    }
  });

  // Add this route to your notes routes
  router.get("/api/notes/check-url/:url", async (req, res) => {
    try {
      const { url } = req.params;

      const urlRegex = /^[a-zA-Z0-9_-]+$/;
      if (!urlRegex.test(url) || url.length < 3) {
        return res.json({ available: false, error: "Invalid URL format" });
      }

      // Check using 'url' field
      const existingNote = await Note.findOne({ url: url });

      res.json({
        available: !existingNote,
        url: url,
      });
    } catch (error) {
      console.error("URL check error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.post(
    "/api/notes/:id/change-url",
    authenticateToken,
    async (req, res) => {
      try {
        const { id } = req.params; // This is the current URL
        const { newUrl } = req.body;
        const userId = req.user.id;

        console.log("🔧 Change URL Debug:");
        console.log("- Current URL:", id);
        console.log("- New URL:", newUrl);
        console.log("- User ID from token:", userId);

        // Validate new URL format
        const urlRegex = /^[a-zA-Z0-9_-]+$/;
        if (!urlRegex.test(newUrl) || newUrl.length < 3) {
          return res.status(400).json({ error: "Invalid URL format" });
        }

        // Check if new URL is available
        const existingNote = await Note.findOne({ url: newUrl });
        if (existingNote) {
          return res.status(400).json({ error: "URL already taken" });
        }

        // Find current note by URL (not _id)
        const currentNote = await Note.findOne({ url: id });
        if (!currentNote) {
          return res.status(404).json({ error: "Note not found" });
        }

        // Verify ownership
        if (currentNote.owner && currentNote.owner.toString() !== userId) {
          return res
            .status(403)
            .json({ error: "Not authorized to change this URL" });
        }

        // Update the URL field (keep same _id)
        currentNote.url = newUrl;
        currentNote.updatedAt = new Date();
        await currentNote.save();

        res.json({
          message: "URL changed successfully",
          newUrl: newUrl,
        });
      } catch (error) {
        console.error("URL change error:", error);
        res.status(500).json({ error: "Server error" });
      }
    }
  );
  return router;
}

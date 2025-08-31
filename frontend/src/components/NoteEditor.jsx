// src/components/NoteEditor.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "./context/AuthContext";

function NoteEditor() {
  const { id } = useParams();
  const [document, setDocument] = useState("");
  const [socket, setSocket] = useState(null);
  const [password, setPassword] = useState("");
  const [noteAuthenticated, setNoteAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Auth context - ADD loading from auth context
  const { user, getToken, isAuthenticated: userLoggedIn, loading: authLoading } = useAuth();

  const textareaRef = useRef(null);
  const isMountedRef = useRef(true);

  // Make authenticated API requests
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = getToken();
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  };

  useEffect(() => {
    // Check AUTH loading, not local loading
    if (authLoading) {
      console.log("⏳ Auth still loading, waiting...");
      return;
    }

    if (!user || !user.id) {
    console.log("⏳ No user or user ID, waiting...");
    return;
  }

    console.log("🔧 Auth loaded, user:", user);
    const newSocket = io("http://localhost:5030");

    newSocket.on("connect", () => {
      if (!isMountedRef.current) return;
      console.log("Socket.IO connected:", newSocket.id);
      setSocket(newSocket);

      console.log("🔧 Emitting join-note with userId:", user?.id);

      // Join the note room with auth info
      newSocket.emit("join-note", {
        noteId: id,
        userId: user.id,
      });
    });

    newSocket.on("note-content", (data) => {
      if (!isMountedRef.current) return;
      setDocument(data.content);
      setHasPassword(data.hasPassword);
      setIsOwner(data.isOwner || false);
      setIsLoading(false); // Set LOCAL loading to false when content received

      if (!data.hasPassword) {
        setNoteAuthenticated(true);
      }
    });

    newSocket.on("content-updated", (data) => {
      if (!isMountedRef.current) return;
      setDocument(data.content);
    });

    newSocket.on("auth-success", () => {
      if (!isMountedRef.current) return;
      setNoteAuthenticated(true);
      setError("");
    });

    newSocket.on("auth-failed", () => {
      if (!isMountedRef.current) return;
      setError("Invalid password");
    });

    newSocket.on("auth-required", () => {
      if (!isMountedRef.current) return;
      setHasPassword(true);
      setNoteAuthenticated(false);
    });

    newSocket.on("note-settings-updated", (data) => {
      if (!isMountedRef.current) return;
      setHasPassword(data.hasPassword);
      if (!data.hasPassword) {
        setNoteAuthenticated(true);
      }
    });

    newSocket.on("error", (errorMessage) => {
      if (!isMountedRef.current) return;
      console.error("Socket error:", errorMessage);
      setError(errorMessage);
      setIsLoading(false); // Stop loading on error
    });

    newSocket.on("disconnect", () => {
      if (!isMountedRef.current) return;
      console.log("Socket.IO disconnected");
      setSocket(null);
    });

    newSocket.on("connect_error", (error) => {
      if (!isMountedRef.current) return;
      console.error("Connection error:", error);
      setError("Connection failed");
      setIsLoading(false); // Stop loading on connection error
    });

    return () => {
      isMountedRef.current = false;
      newSocket.disconnect();
    };
  }, [id, user?.id, authLoading]); // Use authLoading in dependencies

  const authenticate = () => {
    if (socket) {
      socket.emit("auth", { noteId: id, password });
    }
  };

  const handleChange = (e) => {
    const newDocument = e.target.value;
    setDocument(newDocument);

    if (saveTimeout) clearTimeout(saveTimeout);

    const timeout = setTimeout(() => {
      if (socket && (noteAuthenticated || !hasPassword)) {
        socket.emit("update-content", { noteId: id, content: newDocument });
        setIsSaving(true);
        setTimeout(() => {
          if (isMountedRef.current) setIsSaving(false);
        }, 1000);
      }
    }, 1000);

    setSaveTimeout(timeout);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("URL copied to clipboard!");
  };

  // Add password protection
  const addPassword = async (newPassword) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/notes/${id}/password`,
        {
          method: "POST",
          body: JSON.stringify({ password: newPassword }),
        }
      );

      if (response.ok) {
        setHasPassword(true);
        setShowPasswordModal(false);
        // Notify other users via socket
        if (socket) {
          socket.emit("password-changed", { noteId: id, hasPassword: true });
        }
        alert("Password added successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add password");
      }
    } catch (error) {
      alert("Failed to add password");
    }
  };

  // Remove password protection
  const removePassword = async () => {
    if (!confirm("Remove password protection from this note?")) return;

    try {
      const response = await makeAuthenticatedRequest(
        `/api/notes/${id}/password`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setHasPassword(false);
        setNoteAuthenticated(true);
        // Notify other users via socket
        if (socket) {
          socket.emit("password-changed", { noteId: id, hasPassword: false });
        }
        alert("Password removed successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to remove password");
      }
    } catch (error) {
      alert("Failed to remove password");
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [saveTimeout]);

    // Show auth loading state
  if (authLoading) {
    return (
      <div className="text-center p-12 text-lg text-gray-700">
        Loading authentication...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center p-12 text-lg text-gray-700">Loading...</div>
    );
  }

  if (error) {
    return <div className="text-center p-12 text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-[800px] mx-auto p-5">
      <div className="flex items-center justify-between mb-5 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-semibold">Note: {id}</h1>
        <div className="flex items-center gap-4">
          {isSaving && <span className="text-green-600 italic">Saving...</span>}

          {/* Password Icon - Only show for owners */}
          {userLoggedIn && isOwner && (
            <div className="flex items-center gap-2">
              {hasPassword ? (
                <button
                  onClick={removePassword}
                  className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                  title="Remove password protection"
                >
                  🔒 Remove Password
                </button>
              ) : (
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                  title="Add password protection"
                >
                  🔓 Add Password
                </button>
              )}
            </div>
          )}

          <button
            onClick={copyUrl}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Copy URL
          </button>
        </div>
      </div>

      {/* User status indicator */}
      {userLoggedIn && (
        <div className="mb-3 text-sm text-gray-600 flex items-center gap-2">
          <span>
            Logged in as: <span className="font-semibold">{user.username}</span>
          </span>
          {isOwner && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              Owner
            </span>
          )}
          {hasPassword && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
              🔒 Protected
            </span>
          )}
        </div>
      )}

      {hasPassword && !noteAuthenticated ? (
        <div className="max-w-md mx-auto p-8 bg-neutral-50 rounded-lg text-center">
          <p className="mb-5 flex items-center justify-center gap-2">
            🔒 This note is password protected
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full p-3 mb-5 border border-gray-300 rounded text-base"
            onKeyPress={(e) => e.key === "Enter" && authenticate()}
          />
          <button
            onClick={authenticate}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded text-base"
          >
            Unlock Note
          </button>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={document}
          onChange={handleChange}
          rows="20"
          cols="80"
          placeholder="Start typing..."
          className="w-full min-h-[500px] p-4 border border-gray-300 rounded text-base leading-relaxed resize-y"
          autoFocus
        />
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <PasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSubmit={addPassword}
        />
      )}
    </div>
  );
}

// Password Modal Component
function PasswordModal({ onClose, onSubmit }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Set Password Protection</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-3 border border-gray-300 rounded"
            required
            minLength="6"
            autoFocus
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            required
            minLength="6"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              Set Password
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NoteEditor;

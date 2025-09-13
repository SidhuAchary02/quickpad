// src/components/NoteEditor.jsx
import React, { useState, useEffect, useRef, use } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy, Clipboard } from "lucide-react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import ChangeUrlModal from "./ChangeUrlModal";

function NoteEditor() {
  const navigate = useNavigate();

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
  const [showChangeUrlModal, setShowChangeUrlModal] = useState(false);

  const [isOwner, setIsOwner] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auth context - ADD loading from auth context
  const {
    user,
    getToken,
    isAuthenticated: userLoggedIn,
    loading: authLoading,
  } = useAuth();

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
    // Only reconnect if we have a socket and user state has changed
    if (socket && !authLoading) {
      console.log(
        "🔄 User state changed, rejoining note with userId:",
        user?.id
      );

      // Re-emit join-note with updated user info
      socket.emit("join-note", {
        noteId: id,
        userId: user?.id || null,
      });
    }
  }, [user?.id]); // Watch specifically for user ID changes

  useEffect(() => {
    // Check AUTH loading, not local loading
    if (authLoading) {
      console.log("⏳ Auth still loading, waiting...");
      return;
    }

    console.log("🔧 Auth loaded, user:", user?.id || "anonymous");
    const newSocket = io("http://localhost:5030");

    newSocket.on("connect", () => {
      if (!isMountedRef.current) return;
      console.log("Socket.IO connected:", newSocket.id);
      setSocket(newSocket);

      console.log("🔧 Emitting join-note with userId:", user?.id);

      // Join the note room with auth info
      newSocket.emit("join-note", {
        noteId: id,
        userId: user?.id || null,
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
  }, [id, authLoading]); // Use authLoading in dependencies

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
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  // Add this function for handling URL change
  const handleUrlChanged = (newUrl) => {
    console.log("URL changed to:", newUrl);
    // Navigate to the new URL
    navigate(`/${newUrl}`, { replace: true });
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

  if (authLoading) {
    return (
      <div className="text-center p-12 text-lg text-gray-700">Loading...</div>
    );
  }

  if (error) {
    return <div className="text-center p-12 text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-[800px] mx-auto p-5 text-[#404040] text-center">
      <div className="flex items-center justify-between mb-5 border-b border-gray-300 pb-4">
        <div className="flex item-center gap-2">
          <h1 className="text-xl font-semibold">Note: {id}</h1>
          <button
            className="border border-[#cececf] rounded-md p-1 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={copyUrl}
          >
            {copied ? (
              <Clipboard className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && <span className="text-gray-600 italic">Saving...</span>}

          {/* Password Icon - Only show for owners */}
          {userLoggedIn && isOwner && (
            <div className="flex items-center gap-1">
              {hasPassword ? (
                <button
                  onClick={removePassword}
                  className="bg-white border border-[#cececf] font-semibold text-[#404040] hover:bg-gray-50 px-3 py-2 rounded-lg text-sm cursor-pointer"
                  title="Remove password protection"
                >
                  Remove Password
                </button>
              ) : (
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-white border border-[#cececf] font-semibold text-[#404040] hover:bg-gray-50 px-3 py-2 rounded-lg text-sm cursor-pointer"
                  title="Add password protection"
                >
                  Add Password
                </button>
              )}
            </div>
          )}

          {/* Change URL Button - Only show for owners */}
          {userLoggedIn && isOwner && (
            <button
              onClick={() => setShowChangeUrlModal(true)}
              className="bg-white border border-[#cececf] font-semibold text-[#404040] hover:bg-gray-50 px-3 py-2 rounded-lg text-sm cursor-pointer"
              title="Change note URL"
            >
              Change URL
            </button>
          )}
        </div>
      </div>

      {/* User status indicator */}
      {userLoggedIn && (
        <div
          className="mb-3 text-sm flex items-center gap-2"
          style={{ color: "#404040" }}
        >
          {isOwner && (
            <span
              className="bg-gray-100 px-2 py-1 rounded-full text-xs"
              style={{ color: "#404040" }}
            >
              Owner
            </span>
          )}
          {hasPassword && (
            <span
              className="bg-gray-100 px-2 py-1 rounded-full text-xs"
              style={{ color: "#404040" }}
            >
              Protected
            </span>
          )}
        </div>
      )}

      {hasPassword && !noteAuthenticated ? (
        <div className="max-w-md mx-auto p-8 bg-white border border-gray-300 rounded-lg text-center">
          <p
            className="mb-5 flex items-center justify-center gap-2"
            style={{ color: "#404040" }}
          >
            This note is password protected
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full p-3 mb-5 border border-gray-300 rounded text-base"
            style={{ color: "#404040" }}
            onKeyPress={(e) => e.key === "Enter" && authenticate()}
            required
          />
          <button
            onClick={authenticate}
            disabled={!password.trim()}
            className={`px-5 py-2.5 rounded text-base transition-colors ${
              !password.trim()
                ? "bg-[#404040] text-gray-200 cursor-not-allowed"
                : "bg-[#2b2b2b] text-white"
            }`}
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
          className="w-full min-h-[500px] p-4 border border-[#cececf] rounded-lg shadow-md text-base leading-relaxed resize-y outline-none  focus:ring-[#cececf]"
          style={{ color: "#404040" }}
        />
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <PasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSubmit={addPassword}
        />
      )}

      {/* Change URL Modal */}
      {showChangeUrlModal && (
        <ChangeUrlModal
          isOpen={showChangeUrlModal}
          onClose={() => setShowChangeUrlModal(false)}
          currentUrl={id}
          onUrlChanged={handleUrlChanged}
        />
      )}
    </div>
  );
}

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
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-[#404040]">
          Set Password Protection
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-3 border border-gray-300 rounded text-[#404040] placeholder-gray-500 focus:outline-none focus:border-gray-400"
            required
            minLength="6"
            autoFocus
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded text-[#404040] placeholder-gray-500 focus:outline-none focus:border-gray-400"
            required
            minLength="6"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-[#404040] hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
            >
              Set Password
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white hover:bg-gray-50 text-[#404040] border border-gray-300 py-2 px-4 rounded transition-colors"
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

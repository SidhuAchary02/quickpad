// src/components/NoteEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './NoteEditor.css';
import { io } from 'socket.io-client';

function NoteEditor() {
  const { id } = useParams();
  const [document, setDocument] = useState("");
  const [socket, setSocket] = useState(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState(null);
  
  const textareaRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:5030'); // Fixed port

    // Handle successful connection
    newSocket.on('connect', () => {
      if (!isMountedRef.current) return;
      console.log('Socket.IO connected:', newSocket.id);
      setSocket(newSocket);
      
      // Join the note room
      newSocket.emit('join-note', id);
    });

    // Handle initial note content
    newSocket.on('note-content', (data) => {
      if (!isMountedRef.current) return;
      setDocument(data.content);
      setHasPassword(data.hasPassword);
      setIsLoading(false);
      
      // If note is not password protected, set as authenticated
      if (!data.hasPassword) {
        setIsAuthenticated(true);
      }
    });

    // Handle real-time content updates from other users
    newSocket.on('content-updated', (data) => {
      if (!isMountedRef.current) return;
      setDocument(data.content);
    });

    // Handle authentication responses
    newSocket.on('auth-success', () => {
      if (!isMountedRef.current) return;
      setIsAuthenticated(true);
      setError('');
    });

    newSocket.on('auth-failed', () => {
      if (!isMountedRef.current) return;
      setError('Invalid password');
    });

    newSocket.on('auth-required', () => {
      if (!isMountedRef.current) return;
      setHasPassword(true);
      setIsAuthenticated(false);
    });

    // Handle errors
    newSocket.on('error', (errorMessage) => {
      if (!isMountedRef.current) return;
      console.error('Socket error:', errorMessage);
      setError(errorMessage);
    });

    // Handle disconnection
    newSocket.on('disconnect', () => {
      if (!isMountedRef.current) return;
      console.log('Socket.IO disconnected');
      setSocket(null);
    });

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      if (!isMountedRef.current) return;
      console.error('Connection error:', error);
      setError('Connection failed');
      setIsLoading(false);
    });

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      newSocket.disconnect();
    };
  }, [id]);

  const authenticate = () => {
    if (socket) {
      socket.emit('auth', { noteId: id, password });
    }
  };

  const handleChange = (e) => {
    const newDocument = e.target.value;
    setDocument(newDocument);
    
    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Set a new timeout to save after 1 second of inactivity
    const timeout = setTimeout(() => {
      if (socket && (isAuthenticated || !hasPassword)) {
        socket.emit('update-content', { noteId: id, content: newDocument });
        setIsSaving(true);
        
        // Show saving indicator briefly
        setTimeout(() => {
          if (isMountedRef.current) {
            setIsSaving(false);
          }
        }, 1000);
      }
    }, 1000);
    
    setSaveTimeout(timeout);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('URL copied to clipboard!');
  };

  // Cleanup any pending timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="note-editor">
      <div className="editor-header">
        <h1>Note: {id}</h1>
        <div className="editor-actions">
          {isSaving && <span className="saving-indicator">Saving...</span>}
          <button onClick={copyUrl} className="copy-btn">Copy URL</button>
        </div>
      </div>
      
      {hasPassword && !isAuthenticated ? (
        <div className="auth-form">
          <p>This note is password protected</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="password-input"
          />
          <button onClick={authenticate} className="auth-btn">
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
          className="note-content"
          autoFocus
        />
      )}
    </div>
  );
}

export default NoteEditor;

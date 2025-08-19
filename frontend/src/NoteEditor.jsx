// src/components/NoteEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './NoteEditor.css';

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
  const isMountedRef = useRef(true); // Track if component is mounted

  useEffect(() => {
    // Connect to WebSocket for this note
    const newSocket = new WebSocket(`ws://localhost:5030/ws/${id}`);
    
    // Handle successful connection
    const handleOpen = () => {
      if (!isMountedRef.current) return;
      console.log('WebSocket connection established');
      setSocket(newSocket);
    };
    
    // Handle incoming messages
    const handleMessage = (event) => {
      if (!isMountedRef.current) return;
      
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'init') {
          setDocument(message.data);
          setHasPassword(message.hasPassword);
          setIsLoading(false);
          
          // If note is not password protected, set as authenticated
          if (!message.hasPassword) {
            setIsAuthenticated(true);
          }
        } else if (message.type === 'update') {
          setDocument(message.data);
        } else if (message.type === 'auth_required') {
          setHasPassword(true);
          setIsLoading(false);
        } else if (message.type === 'auth_success') {
          setIsAuthenticated(true);
        } else if (message.type === 'auth_failed') {
          setError('Invalid password');
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    // Handle connection close
    const handleClose = () => {
      if (!isMountedRef.current) return;
      console.log('WebSocket connection closed');
      setSocket(null);
    };
    
    // Handle connection errors
    const handleError = (error) => {
      if (!isMountedRef.current) return;
      console.error('WebSocket error:', error);
      setError('Connection error');
      setIsLoading(false);
    };
    
    // Register event handlers
    newSocket.onopen = handleOpen;
    newSocket.onmessage = handleMessage;
    newSocket.onclose = handleClose;
    newSocket.onerror = handleError;
    
    // Cleanup function
    return () => {
      isMountedRef.current = false; // Mark as unmounted
      
      // Remove event handlers to prevent memory leaks
      newSocket.onopen = null;
      newSocket.onmessage = null;
      newSocket.onclose = null;
      newSocket.onerror = null;
      
      // Close the WebSocket connection
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [id]); // Only re-run when the ID changes

  const authenticate = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'auth', password }));
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
      if (socket && socket.readyState === WebSocket.OPEN && 
          (isAuthenticated || !hasPassword)) {
        socket.send(JSON.stringify({ type: 'update', data: newDocument }));
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
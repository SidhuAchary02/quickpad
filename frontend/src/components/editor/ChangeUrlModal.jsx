import React, { useState } from 'react';
// import './ChangeUrlModal.css';

const ChangeUrlModal = ({ isOpen, onClose, currentUrl, onUrlChanged }) => {
  const [newUrl, setNewUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [error, setError] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  // Check URL availability on input change
  const checkUrlAvailability = async (url) => {
    if (!url || url.length < 3) {
      setIsAvailable(null);
      setError('URL must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(url)) {
      setIsAvailable(false);
      setError('URL can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    if (url === currentUrl) {
      setIsAvailable(false);
      setError('This is your current URL');
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      const response = await fetch(`/api/notes/check-url/${url}`);
      const data = await response.json();
      
      if (data.available) {
        setIsAvailable(true);
        setError('');
      } else {
        setIsAvailable(false);
        setError(data.error || 'URL is already taken');
      }
    } catch (error) {
      setIsAvailable(false);
      setError('Error checking URL availability');
    } finally {
      setIsChecking(false);
    }
  };

  // Handle input change with debounce
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setNewUrl(url);
    
    // Clear previous timeout
    if (window.urlCheckTimeout) {
      clearTimeout(window.urlCheckTimeout);
    }
    
    // Set new timeout for checking
    window.urlCheckTimeout = setTimeout(() => {
      checkUrlAvailability(url);
    }, 500);
  };

  // Handle URL change submission
  const handleChangeUrl = async () => {
    if (!isAvailable || !newUrl) return;

    setIsChanging(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/${currentUrl}/change-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newUrl })
      });

      if (response.ok) {
        const data = await response.json();
        onUrlChanged(data.newUrl);
        onClose();
        // Navigate to new URL
        window.history.pushState({}, '', `/${data.newUrl}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to change URL');
      }
    } catch (error) {
      setError('Error changing URL');
    } finally {
      setIsChanging(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setNewUrl('');
    setIsAvailable(null);
    setError('');
    setIsChecking(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Change Note URL</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="current-url">
            <label>Current URL:</label>
            <span>/{currentUrl}</span>
          </div>
          
          <div className="new-url-input">
            <label>New URL:</label>
            <div className="url-input-container">
              <span className="url-prefix">/</span>
              <input
                type="text"
                value={newUrl}
                onChange={handleUrlChange}
                placeholder="Enter new URL"
                className={`url-input ${isAvailable === true ? 'available' : isAvailable === false ? 'unavailable' : ''}`}
              />
              {isChecking && <div className="checking-spinner">⏳</div>}
              {isAvailable === true && <div className="available-icon">✅</div>}
              {isAvailable === false && <div className="unavailable-icon">❌</div>}
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
        
        <div className="modal-footer">
          <button className="cancel-btn" onClick={handleClose}>Cancel</button>
          <button 
            className="change-btn"
            onClick={handleChangeUrl}
            disabled={!isAvailable || isChanging}
          >
            {isChanging ? 'Changing...' : 'Change URL'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeUrlModal;

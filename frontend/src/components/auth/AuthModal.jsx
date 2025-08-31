import { useState } from 'react';
import { Login } from './Login';
import { Signup } from './Signup';
import './Auth.css';

export function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [showLogin, setShowLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {showLogin ? (
          <Login 
            onLoginSuccess={onLoginSuccess}
            switchToSignup={() => setShowLogin(false)}
          />
        ) : (
          <Signup 
            onLoginSuccess={onLoginSuccess}
            switchToLogin={() => setShowLogin(true)}
          />
        )}
      </div>
    </div>
  );
}

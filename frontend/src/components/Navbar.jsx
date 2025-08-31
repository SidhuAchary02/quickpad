import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { AuthModal } from "./auth/AuthModal";

function Navbar() {
  const { user, logout, login, isAuthenticated, loading } = useAuth(); // ← Add login here
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLoginSuccess = (userData, token) => {
    console.log('🔧 Navbar: Login success, calling context login');
    login(userData, token); // ← Call the AuthContext login function
    setShowAuthModal(false);
  };

  if (loading) {
    return (
      <nav style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <h1>Notepad Clone</h1>
        <div>Loading...</div>
      </nav>
    );
  }

  return (
    <nav
      style={{
        padding: "1rem",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1>Notepad Clone</h1>
      <div>
        {isAuthenticated ? (
          <div>
            <span>Welcome, {user.username}!</span>
            <button onClick={logout} style={{ marginLeft: "1rem" }}>
              Logout
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)}>Login</button>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </nav>
  );
}

export default Navbar;

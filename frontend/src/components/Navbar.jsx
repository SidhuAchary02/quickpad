import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { AuthModal } from "./auth/AuthModal";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { user, logout, login, isAuthenticated, loading } = useAuth(); // ← Add login here
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = (userData, token) => {
    console.log("🔧 Navbar: Login success, calling context login");
    login(userData, token); // ← Call the AuthContext login function
    setShowAuthModal(false);
  };

  if (loading) {
    return (
      <nav style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <h1>quickpad</h1>
        <div>Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto sticky top-0 bg-white/80 backdrop-blur-sm z-[1001]">
      <a href="/" className="text-xl font-bold text-[#404040] cursor-pointer">
        quickpad
      </a>

      <div className="flex gap-2">
        {/* <button
          onClick={() =>
            window.open("https://github.com/SidhuAchary02/quickpad", "_blank")
          }
          className="text-[#404040] font-semibold border border-[#cececf] hover:bg-gray-50 bg-transparent px-4 py-1 rounded-lg transition-colors cursor-pointer"
        >
          Star me ⭐
        </button> */}
        {isAuthenticated ? (
          <div>
            <span className="text-[#404040] font-semibold underline">
              Welcome, {user.username}!
            </span>

            <button
              className="text-[#404040] font-semibold border border-[#cececf] hover:bg-gray-50 bg-transparent px-4 py-1 rounded-lg transition-colors ml-4 cursor-pointer"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            className="text-[#404040] font-semibold border border-[#cececf] hover:bg-gray-50 bg-transparent px-4 py-1 rounded-lg transition-colors cursor-pointer"
            onClick={() => setShowAuthModal(true)}
          >
            Login
          </button>
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

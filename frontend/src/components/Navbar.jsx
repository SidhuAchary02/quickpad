import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { AuthModal } from "./auth/AuthModal";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

function Navbar() {
  const { user, logout, login, isAuthenticated, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = (userData, token) => {
    console.log("🔧 Navbar: Login success, calling context login");
    login(userData, token);
    setShowAuthModal(false);
  };

  if (loading) {
    return (
      <nav className="p-4 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <h1 className="text-gray-900 dark:text-white">quickpad</h1>
        <div className="text-gray-600 dark:text-zinc-400">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-[1001] border-b border-gray-200/20 dark:border-zinc-700/20">
      <a href="/" className="text-xl font-bold text-[#404040] dark:text-white cursor-pointer">
        quickpad
      </a>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-[#404040] dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-[#404040] dark:text-white font-semibold underline">
              Welcome, {user.username}!
            </span>
            <button
              className="text-[#404040] dark:text-white font-semibold border border-[#cececf] dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 bg-transparent px-4 py-1 rounded-lg transition-colors cursor-pointer"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            className="text-[#404040] dark:text-white font-semibold border border-[#cececf] dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 bg-transparent px-4 py-1 rounded-lg transition-colors cursor-pointer"
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

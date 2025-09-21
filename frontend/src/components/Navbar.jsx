import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { AuthModal } from "./auth/AuthModal";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Settings } from "lucide-react";

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

  const handleSetting = () => {
    navigate("/user/settings");
  };

  console.log('userData', user)

  if (loading) {
    return (
      <nav className="p-4 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <h1 className="text-gray-900 dark:text-white">quickpad</h1>
        <div className="text-gray-600 dark:text-zinc-400">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-[1001] border-b border-gray-200 dark:border-zinc-800">
      <a
        href="/"
        className="flex items-center gap-1 text-xl font-bold text-[#404040] dark:text-white cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-zap"
        >
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
        </svg>
        quickpad
      </a>

      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <div className="flex items-center">
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

        <button
          onClick={handleSetting}
          className="px-1.5 py-1.5 text-[#404040] dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 border border-[#cececf] dark:border-zinc-600 rounded-lg transition-colors cursor-pointer"
          title="user dashboard"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="px-1.5 py-1.5 text-[#404040] dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 border border-[#cececf] dark:border-zinc-600 rounded-lg transition-colors cursor-pointer"
          title="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
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

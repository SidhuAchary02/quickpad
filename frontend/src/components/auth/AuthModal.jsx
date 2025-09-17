import { useState } from "react";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { X } from "lucide-react";

export function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [showLogin, setShowLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 top-80 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg relative w-full max-w-[500px] max-h-screen overflow-y-auto shadow-2xl border border-[#cececf] dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-transparent border-none text-2xl cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 z-[1001] w-8 h-8 flex items-center justify-center"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
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

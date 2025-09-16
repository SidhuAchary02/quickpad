// src/components/Home.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Github, Sparkles, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { API_BASE_URL } from "../config/api";
import { useTheme } from "./context/ThemeContext";

export default function Page() {
  const { getToken } = useAuth();
  const { isDark } = useTheme();
  const [customUrl, setCustomUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  // URL availability states
  const [availability, setAvailability] = useState({
    status: null, // null, 'checking', 'available', 'taken', 'invalid'
    message: "",
  });

  // URL validation regex
  const urlRegex = /^[a-zA-Z0-9_-]+$/;

  // Debounced URL availability check
  const checkUrlAvailability = useCallback(
    debounce(async (url) => {
      if (!url || url.length < 3) {
        setAvailability({ status: null, message: "" });
        return;
      }

      if (!urlRegex.test(url)) {
        setAvailability({
          status: "invalid",
          message: "Only letters, numbers, hyphens and underscores allowed",
        });
        return;
      }

      setAvailability({
        status: "checking",
        message: "Checking availability...",
      });

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/notes/check-url/${url}`
        );
        if (response.data.available) {
          setAvailability({
            status: "available",
            message: `${url} is available!`,
          });
        } else {
          setAvailability({
            status: "taken",
            message: `${url} is already taken`,
          });
        }
      } catch (error) {
        setAvailability({
          status: "invalid",
          message: "Error checking URL availability",
        });
      }
    }, 500),
    []
  );

  // Effect to trigger availability check
  useEffect(() => {
    checkUrlAvailability(customUrl);
  }, [customUrl, checkUrlAvailability]);

  // Simple debounce utility
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const createNoteWithCustomUrl = async () => {
    // Don't create if URL is taken or invalid
    if (availability.status === "taken" || availability.status === "invalid") {
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const token = getToken();

      const response = await axios.post(
        `${API_BASE_URL}/api/notes/custom`,
        {
          content: "",
          password: null,
          customUrl: customUrl.trim() || null,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );

      const data = response.data;
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating note:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to create note. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (
      e.key === "Enter" &&
      !isCreating &&
      availability.status !== "taken" &&
      availability.status !== "invalid"
    ) {
      createNoteWithCustomUrl();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCustomUrl(value);
    setError("");
  };

  // Get input border color based on availability
  const getInputBorderColor = () => {
    if (!customUrl) return "border-gray-300 dark:border-zinc-600";
    switch (availability.status) {
      case "available":
        return "border-green-500 focus:border-green-600 dark:border-green-400 dark:focus:border-green-500";
      case "taken":
        return "border-red-500 focus:border-red-600 dark:border-red-400 dark:focus:border-red-500";
      case "invalid":
        return "border-red-500 focus:border-red-600 dark:border-red-400 dark:focus:border-red-500";
      case "checking":
        return "border-blue-500 focus:border-blue-600 dark:border-blue-400 dark:focus:border-blue-500";
      default:
        return "border-gray-300 dark:border-zinc-600";
    }
  };

  // Get button state
  const isButtonDisabled =
    isCreating ||
    availability.status === "taken" ||
    availability.status === "invalid" ||
    availability.status === "checking";

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 max-w-[800px] mx-auto text-center text-[#404040] dark:text-white transition-colors">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 text-center">
        {/* Star Button */}
        <div className="relative">
          <div className="absolute -top-4 left-58 transform rotate-12">
            <img
              src={isDark ? "/icons/light-curved-arrow.png" : "/icons/dark-curved-arrow.png"}
              alt="Arrow pointing to button"
              className="w-12 h-12 opacity-70"
            />
          </div>
          <div className="mb-2">
            <button
              onClick={() =>
                window.open(
                  "https://github.com/SidhuAchary02/quickpad",
                  "_blank"
                )
              }
              className="
                relative flex mx-auto gap-1 items-center text-[#404040] dark:text-white font-semibold 
                border border-gray-300 dark:border-zinc-600 bg-transparent px-5 py-1 
                rounded-full transition-all duration-300 cursor-pointer
                before:content-[''] before:absolute before:inset-0 before:rounded-full
                before:bg-gradient-to-r before:from-blue-400 before:via-purple-500 before:to-pink-500
                dark:before:from-blue-300 dark:before:via-purple-400 dark:before:to-pink-400
                before:opacity-0 before:blur-lg before:transition-all before:duration-300
                hover:before:opacity-30
                after:content-[''] after:absolute after:inset-[1px] after:rounded-full
                after:bg-white dark:after:bg-zinc-900 after:z-[1]
                shadow-lg shadow-blue-500/25 dark:shadow-blue-400/25
              "
            >
              <span className="relative z-[2] flex items-center gap-1 font-bold hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-300 ease-in-out">
                star me on github <Sparkles className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-6 text-balance text-[#404040] dark:text-white">
            Simple, secure, anonymous note-taking.
          </h1>

          {/* Enhanced URL Input Section */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-center gap-0 max-w-md mx-auto py-2">
              <div className="flex items-center bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-l-md px-3 py-1">
                <span className="text-[#404040] dark:text-white font-semibold">
                  quickpad.com/
                </span>
              </div>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="mynotes"
                  value={customUrl}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className={`w-full text-[#404040] dark:text-white bg-white dark:bg-zinc-800 border-t border-b px-2 py-1 outline-none transition-all ${getInputBorderColor()} ${
                    availability.status === "available"
                      ? "focus:ring-green-500 dark:focus:ring-green-400"
                      : availability.status === "taken" ||
                        availability.status === "invalid"
                      ? "focus:ring-red-500 dark:focus:ring-red-400"
                      : "focus:ring-blue-500 dark:focus:ring-blue-400"
                  }`}
                  disabled={isCreating}
                />

                {/* Status Indicator */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {customUrl && (
                    <>
                      {availability.status === "checking" && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-blue-400" />
                      )}
                      {availability.status === "available" && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 mr-1"></div>
                        </div>
                      )}
                      {(availability.status === "taken" ||
                        availability.status === "invalid") && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 mr-1"></div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={createNoteWithCustomUrl}
                disabled={isButtonDisabled}
                className={`rounded-r-lg border px-2 py-1.5 text-sm font-medium transition-all ${
                  isButtonDisabled
                    ? "bg-gray-400 dark:bg-zinc-600 text-gray-200 dark:text-zinc-400 border-gray-400 dark:border-zinc-600 cursor-not-allowed"
                    : "bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-white hover:shadow-lg"
                }`}
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>creating...</span>
                  </div>
                ) : (
                  "create note"
                )}
              </button>
            </div>

            {/* General Error Message */}
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded px-3 py-2">
                {error}
              </div>
            )}

            {/* Helper Text */}
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {!customUrl
                ? "Leave empty for random URL • 3+ characters, letters, numbers, - and _ allowed"
                : customUrl.length < 3
                ? "URL must be at least 3 characters long"
                : ""}
            </p>
          </div>
        </div>

        {/* Quickstart Section */}
        <div>
          <h2 className="text-2xl text-[#404040] dark:text-white font-semibold mb-5 underline">
            Quickstart
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="px-6 py-3 border border-[#cececf] dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800">
              <h3 className="text-xl font-bold mb-2 text-[#404040] dark:text-white">Step 1</h3>
              <p className="text-sm text-[#404040] dark:text-zinc-300">
                Create your own notepad at quickpad.com/yournotes
              </p>
            </div>

            <div className="px-6 py-3 border border-[#cececf] dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800">
              <h3 className="text-xl font-bold mb-2 text-[#404040] dark:text-white">Step 2</h3>
              <p className="text-sm text-[#404040] dark:text-zinc-300">
                (Optional) Set a password and start writing notes
              </p>
            </div>

            <div className="px-6 py-3 border border-[#cececf] dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800">
              <h3 className="text-xl font-bold mb-2 text-[#404040] dark:text-white">Step 3</h3>
              <p className="text-sm text-[#404040] dark:text-zinc-300">
                Save and close the tab once you are done!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="border-t border-gray-200 dark:border-zinc-700 py-6 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="mb-1 text-[#404040] dark:text-zinc-300">
            Built by{" "}
            <a
              href="https://github.com/SidhuAchary02"
              target="_blank"
              className="font-semibold hover:underline text-[#404040] dark:text-white"
            >
              @SidhuAchary02
            </a>
          </p>

          <p className="text-[#404040] dark:text-zinc-300">
            quickpad is open-source on{" "}
            <a
              href="https://github.com/SidhuAchary02/quickpad"
              target="_blank"
              className="font-medium hover:underline text-[#404040] dark:text-white"
            >
              Github
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

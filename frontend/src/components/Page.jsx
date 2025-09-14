// src/components/Home.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Github, Sparkles, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { API_BASE_URL } from "../config/api";

export default function Page() {
  const { getToken } = useAuth();
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
    if (!customUrl) return "border-gray-300";
    switch (availability.status) {
      case "available":
        return "border-green-500 focus:border-green-600";
      case "taken":
        return "border-red-500 focus:border-red-600";
      case "invalid":
        return "border-red-500 focus:border-red-600";
      case "checking":
        return "border-blue-500 focus:border-blue-600";
      default:
        return "border-gray-300";
    }
  };

  // Get button state
  const isButtonDisabled =
    isCreating ||
    availability.status === "taken" ||
    availability.status === "invalid" ||
    availability.status === "checking";

  return (
    <div className="min-h-screen bg-white max-w-[800px] mx-auto text-cente text-[#404040]">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 text-center">
        {/* Star Button */}

        <div className="relative">
          <div className="absolute -top-4 left-58 transform rotate-12">
            <img
              src="/icons/curved-arrow.png"
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
            relative flex mx-auto gap-1 items-center text-[#404040] font-semibold 
            border border-gray-300 bg-transparent px-5 py-1 
            rounded-full transition-all duration-300 cursor-pointer
            before:content-[''] before:absolute before:inset-0 before:rounded-full
            before:bg-gradient-to-r before:from-blue-400 before:via-purple-500 before:to-pink-500
            before:opacity-0 before:blur-lg before:transition-all before:duration-300
            hover:before:opacity-30
            after:content-[''] after:absolute after:inset-[1px] after:rounded-full
            after:bg-white after:z-[1]
            shadow-lg shadow-blue-500/25
          "
            >
              <span className="relative z-[2] flex items-center gap-1 font-bold hover:text-pink-500 transition-colors duration-300 ease-in-out">
                star me on github <Sparkles className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-6 text-balance">
            Simple, secure, anonymous note-taking.
          </h1>

          {/* Enhanced URL Input Section */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-center gap-0 max-w-md mx-auto py-2">
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-l-md px-3 py-1">
                <span className="text-[#404040] font-semibold">
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
                  className={`w-full text-[#404040] border-t border-b px-2 py-1 outline-none transition-all ${getInputBorderColor()} ${
                    availability.status === "available"
                      ? "focus:ring-green-500"
                      : availability.status === "taken" ||
                        availability.status === "invalid"
                      ? "focus:ring-red-500"
                      : "focus:ring-blue-500"
                  }`}
                  disabled={isCreating}
                />

                {/* Status Indicator */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {customUrl && (
                    <>
                      {availability.status === "checking" && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                      {availability.status === "available" && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                          {/* <Check className="w-4 h-4 text-green-500" /> */}
                        </div>
                      )}
                      {(availability.status === "taken" ||
                        availability.status === "invalid") && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                          {/* <X className="w-4 h-4 text-red-500" /> */}
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
                    ? "bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-800 text-white border-gray-900 hover:shadow-lg"
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

            {/* Status Message
            {customUrl && availability.message && (
              <div
                className={`text-xs px-3 py-2 rounded-lg transition-all ${
                  availability.status === "available"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : availability.status === "checking"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {availability.message}
              </div>
            )} */}

            {/* General Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            )}

            {/* Helper Text */}
            <p className="text-sm text-gray-500">
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
          <h2 className="text-2xl text-[#404040] font-semibold mb-5 underline">
            Quickstart
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="px-6 py-3 border border-[#cececf] rounded-lg bg-white">
              <h3 className="text-xl font-bold mb-2">Step 1</h3>
              <p className="text-sm">
                Create your own notepad at quickpad.com/yournotes
              </p>
            </div>

            <div className="px-6 py-3 border border-[#cececf] rounded-lg bg-white">
              <h3 className="text-xl font-bold mb-2">Step 2</h3>
              <p className="text-sm">
                (Optional) Set a password and start writing notes
              </p>
            </div>

            <div className="px-6 py-3 border border-[#cececf] rounded-lg bg-white">
              <h3 className="text-xl font-bold mb-2">Step 3</h3>
              <p className="text-sm">
                Save and close the tab once you are done!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="border-t border-gray-200 py-6 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="mb-1" style={{ color: "#404040" }}>
            Built by{" "}
            <a
              href="https://github.com/SidhuAchary02"
              target="_blank"
              className="font-semibold hover:underline"
              style={{ color: "#404040" }}
            >
              @SidhuAchary02
            </a>
          </p>
          <p style={{ color: "#404040" }}>
            quickpad is open-source on{" "}
            <a
              href="https://github.com/SidhuAchary02/quickpad"
              target="_blank"
              className="font-medium hover:underline"
              style={{ color: "#404040" }}
            >
              Github
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

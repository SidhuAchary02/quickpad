import { useState } from "react";
import { X } from "lucide-react";

const ChangeUrlModal = ({ isOpen, onClose, currentUrl, onUrlChanged }) => {
  const [newUrl, setNewUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [error, setError] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  // Check URL availability on input change
  const checkUrlAvailability = async (url) => {
    if (!url || url.length < 3) {
      setIsAvailable(null);
      setError("URL must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(url)) {
      setIsAvailable(false);
      setError(
        "URL can only contain letters, numbers, hyphens, and underscores"
      );
      return;
    }

    if (url === currentUrl) {
      setIsAvailable(false);
      setError("This is your current URL");
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      const response = await fetch(`/api/notes/check-url/${url}`);
      const data = await response.json();

      if (data.available) {
        setIsAvailable(true);
        setError("");
      } else {
        setIsAvailable(false);
        setError(data.error || "URL is already taken");
      }
    } catch (error) {
      setIsAvailable(false);
      setError("Error checking URL availability");
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
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notes/${currentUrl}/change-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        onUrlChanged(data.newUrl);
        onClose();
        // Navigate to new URL
        window.history.pushState({}, "", `/${data.newUrl}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to change URL");
      }
    } catch (error) {
      setError("Error changing URL");
    } finally {
      setIsChanging(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setNewUrl("");
    setIsAvailable(null);
    setError("");
    setIsChecking(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h3 className="text-lg font-semibold" style={{ color: "#404040" }}>
            Change Note URL
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700 text-xl font-bold w-6 h-6 flex items-center justify-center cursor-pointer"
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#404040" }}
            >
              Current URL:
            </label>
            <span className="text-[#404040] bg-gray-100 border border-gray-100 py-1 px-2 rounded-full">
              /{currentUrl}
            </span>
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#404040" }}
            >
              New URL:
            </label>
            <div className="flex items-center border border-gray-300 rounded-md">
              <span className="px-3 py-2 text-gray-600 bg-gray-50 border-r border-gray-300">
                /
              </span>
              <input
                type="text"
                value={newUrl}
                onChange={handleUrlChange}
                placeholder="Enter new URL"
                className={`flex-1 px-3 py-2 outline-none rounded-r-md ${
                  isAvailable === true
                    ? "border-green-300 bg-green-50"
                    : isAvailable === false
                    ? "border-red-300 bg-red-50"
                    : ""
                }`}
                style={{ color: "#404040" }}
              />
              <div className="px-2">
                {isChecking && <span className="text-gray-500">⏳</span>}
                {isAvailable === true && (
                  <div className="text-green-600 rounded-full w-2 h-2 bg-green-600"></div>
                )}
                {isAvailable === false && (
                  <div className="text-red-600 rounded-full w-2 h-2 bg-red-600"></div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-300">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-semibold cursor-pointer"
            style={{ color: "#404040" }}
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors font-semibold ${
              !isAvailable || isChanging
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-700 cursor-pointer"
            }`}
            onClick={handleChangeUrl}
            disabled={!isAvailable || isChanging}
          >
            {isChanging ? "Changing..." : "Change URL"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeUrlModal;

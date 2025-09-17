import { useState, useEffect } from "react";
import { UsersRound } from "lucide-react";

const ActiveUsers = ({ socket, noteId }) => {
  const [activeCount, setActiveCount] = useState(1);

  useEffect(() => {
    if (!socket || !noteId) return;

    // Listen for active user updates
    const handleActiveUsersUpdate = (data) => {
      if (data.noteId === noteId) {
        setActiveCount(data.activeCount);
      }
    };

    socket.on("active-users-update", handleActiveUsersUpdate);

    // Cleanup
    return () => {
      socket.off("active-users-update", handleActiveUsersUpdate);
    };
  }, [socket, noteId]);

  // Only show if more than 1 user
  if (activeCount <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-400 dark:border-green-800 rounded-full text-sm"
    title="Number of active users editing this note">
      <UsersRound className="w-4 h-4 text-green-600 dark:text-green-400" />
      <span className="text-green-700 dark:text-green-300 font-medium">
        {activeCount} {activeCount === 1 ? "user" : "users"}
      </span>
    </div>
  );
};

export default ActiveUsers;

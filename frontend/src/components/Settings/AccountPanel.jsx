import axios from "axios";
import { useState, useEffect } from "react";
import {
  FileChartColumnIncreasing,
  FileDown,
  IdCard,
  LogOut,
  RefreshCcw,
  Trash,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../context/AuthContext";

const AccountPanel = () => {
  // State management
  const [noteData, setNoteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getToken, logout } = useAuth();
  const isAuthenticated = Boolean(getToken());


  // Simple date formatting - much better for account panels!
  const formatSimpleDate = (dateString) => {
    if (!dateString) return "Never updated";

    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid date";
    
    const time = date.toLocaleTimeString("en-GB", { 
      hour12: false,
      timeZone: "Asia/Kolkata" 
    }); // 12:09:33 format
    
    const dateFormatted = date.toLocaleDateString("en-GB", {
      timeZone: "Asia/Kolkata"
    }); // 21/08/2025 format

    return `${time} on ${dateFormatted} (IST)`;
  };

  // Fetch user notes
  const fetchUserNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching user notes...');
      
      const response = await axios.get(`${API_BASE_URL}/api/user-note`, {
        headers: {
          "Authorization": `Bearer ${getToken()}`,
          "Content-Type": "application/json"
        },
      });

      console.log('📄 API Response:', response.data);

      if (response.data.success) {
        // Process the fetched notes
        const processedNotes = response.data.notes.map(note => ({
          ...note,
          // Use created_at as fallback since your data doesn't have lastUpdated
          lastUpdated: note.lastUpdated || note.created_at || null
        }));
        
        setNoteData(processedNotes);
        console.log("✅ Fetched user notes:", processedNotes);
      } else {
        setError("Failed to fetch notes");
        console.error("❌ Error fetching user notes:", response.data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching notes:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        logout();
      } else if (error.response?.status === 404) {
        setError('API endpoint not found. Please check your backend server.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch notes');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = (e) => {
    e.preventDefault();
    fetchUserNotes();
  };

  // Handle delete note
  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      console.log('🗑️ Deleting note:', noteId);
      
      const response = await axios.delete(`${API_BASE_URL}/api/notes/delete/${noteId}`, {
        headers: {
          "Authorization": `Bearer ${getToken()}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.data.success) {
        setNoteData(prev => prev.filter(note => note.id !== noteId));
        alert('Note deleted successfully');
        console.log('✅ Note deleted successfully');
      }
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      alert(error.response?.data?.message || 'Failed to delete note');
    }
  };

  // Handle reset password
  const handleResetPassword = async (noteId) => {
    if (!confirm('Are you sure you want to reset password for this note?')) return;
    
    try {
      console.log('🔄 Resetting password for note:', noteId);
      
      const response = await axios.put(`${API_BASE_URL}/api/notes/reset-password/${noteId}`, {}, {
        headers: {
          "Authorization": `Bearer ${getToken()}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.data.success) {
        setNoteData(prev => prev.map(note => 
          note.id === noteId 
            ? { ...note, password: 'No' }
            : note
        ));
        alert('Password reset successfully');
        console.log('✅ Password reset successfully');
      }
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      alert(error.response?.data?.message || 'Failed to reset password');
    }
  };

  // Handle download note
  const handleDownloadNote = (noteUrl) => {
    const fullUrl = `${window.location.origin}/note/${noteUrl}`;
    window.open(fullUrl, '_blank');
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated) fetchUserNotes();
    else {
      setNoteData([]);
      setLoading(false);
      // setError('You are not logged in.');
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Panel */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700">
            <div className="flex items-center space-x-2">
              <IdCard className="w-6 h-6 text-zinc-800 dark:text-white" />
              <h1 className="text-xl font-bold text-[#404040] dark:text-white">
                Account<span className="font-normal">Panel</span>
              </h1>
            </div>

            {isAuthenticated ? (
            <div className="flex items-center text-sm">
              <button 
                className="flex px-2 py-1 rounded-md items-center text-[#404040] dark:text-gray-200 space-x-1 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button 
                className="flex px-2 py-1 rounded-md items-center text-[#404040] dark:text-gray-200 space-x-1 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
            ) : (
              <div></div>
            )}
          </div>

          {/* Content Area */}
          {isAuthenticated ? (

          <div className="p-6">
            {/* Section Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-1 mb-2">
                <FileChartColumnIncreasing className="w-5 h-5 text-zinc-800 dark:text-gray-300" />
                <h2 className="text-lg font-medium text-[#404040] dark:text-gray-300">
                  Note Tracking
                </h2>
              </div>
              <p className="text-sm text-[#404040] dark:text-gray-400">
                Track notes you created
              </p>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-800 dark:border-white"></div>
                <p className="mt-2 text-sm text-[#404040] dark:text-gray-400">Loading your notes...</p>
              </div>
            ) : (
              /* Data Table */
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-zinc-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Password
                      </th>
                      {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                    {noteData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-sm text-[#404040] dark:text-gray-400 font-semibold">
                          No notes found. Create some notes to see them here!
                        </td>
                      </tr>
                    ) : (
                      noteData.map((note) => (
                        <tr key={note.id} className="hover:bg-gray-50 hover:dark:bg-zinc-800 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <a href={`/${note.url}`} target="_blank" className="text-sm text-[#404040] dark:text-gray-300 font-mono hover:underline cursor-pointer">
                                {note.url}
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-[#404040] dark:text-gray-300">
                            {formatSimpleDate(note.lastUpdated)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-[#404040] dark:text-gray-300">
                            {note.views}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-[#404040] dark:text-gray-300">
                            {note.password}
                          </td>
                          {/* <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleResetPassword(note.id)}
                                disabled={note.password === 'No'}
                                className="inline-flex items-center px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-medium text-[#404040] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <RefreshCcw className="w-3 h-3 mr-1" />
                                Reset Pass
                              </button>
                              <button 
                                onClick={() => handleDeleteNote(note.id)}
                                className="inline-flex items-center px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-medium text-[#404040] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                              >
                                <Trash className="w-3 h-3 mr-1" />
                                Delete
                              </button>
                              <button 
                                onClick={() => handleDownloadNote(note.url)}
                                className="inline-flex items-center px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-medium text-[#404040] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                              >
                                <FileDown className="w-3 h-3 mr-1" />
                                Download
                              </button>
                            </div>
                          </td> */}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          ): (
            <div className="p-6 text-center font-bold">
              <p className="text-sm text-[#404040] dark:text-gray-200">logged in!</p>
              <p className="text-sm text-[#404040] dark:text-gray-300">to track notes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPanel;

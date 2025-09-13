import { Github, Zap } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import axios from "axios";

export default function Page() {
  const { getToken } = useAuth();
  const createNote = async () => {
    try {
      const token = getToken();

      const response = await axios.post(
        "/api/notes",
        { content: "", password: null },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );
      const data = await response.data;
      window.location.href = data.url;
    } catch (error) {}
  };
  return (
    <div className="max-w-[800px] mx-auto text-center">
      <div className="min-h-screen bg-white text-[#404040]">
        {/* Header */}
        {/* <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">quickpad</h1>
      </header> */}

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-12 text-center">
          {/* Star Button */}
          {/* <div className="mb-7">
          <button
            onClick={() =>
              window.open("https://github.com/SidhuAchary02/quickpad", "_blank")
            }
            className="text-[#404040] font-semibold border border-gray-300 hover:bg-gray-50 bg-transparent px-4 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Star me on Github ⭐
          </button>
        </div> */}

          <div className="mb-2">
            <button
              onClick={createNote}
              className="
            relative flex mx-auto gap-1 items-center text-[#404040] font-semibold 
            border border-gray-100 bg-transparent px-5 py-1 
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
              <span className="relative z-[2] flex items-center gap-1">
                quickly start <Zap className="w-4 h-4" />
              </span>
            </button>
          </div>

          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold mb-6 text-balance">
              Simple, secure, anonymous note-taking.
            </h1>
            {/* <p className="text-lg mb-12" style={{ color: "#404040" }}>
            Spend time jotting ideas, not filling forms.
          </p> */}

            {/* URL Input Section */}
            <div className="flex items-center justify-center gap-0 max-w-md mx-auto py-2">
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-l-md px-3 py-1">
                <span className="text-[#404040] font-semibold">
                  quickpad.com/
                </span>
              </div>
              <input
                type="text"
                placeholder="mynotes"
                className="text-[#404040] border-t border-b border-gray-300 px-2 py-1 flex-1 outline-none"
              />
              <button className="rounded-r-lg bg-gray-900 hover:bg-gray-800 text-white border border-gray-900 px-2 py-1 transition-colors">
                new note
              </button>
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
                  Create your own notepad at quicknotes.com/notes
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
      </div>
    </div>
  );
}

// src/components/Home.jsx
import axios from "axios";

import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const createNote = async () => {
    try {
      const response = await axios.post("/api/notes", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "", password: null }),
      });
      const data = await response.data;
      navigate(`/${data.id}`);
    } catch (error) {}
  };
  return (
    <div className="max-w-[800px] mx-auto py-10 px-5 text-center">
      <div>
        <h1 className="text-5xl mb-3 text-neutral-800">Online Notepad</h1>
        <p className="text-lg text-gray-600 mb-10">
          Simple, secure, anonymous note-taking
        </p>

        <div>
          <h2 className="text-black text-pretty">
            Type any URL like{" "}
            <span className="font-bold text-blue-500">/your-note-id</span> to
            create a note
          </h2>{" "}
            <button
              className="py-1 px-3 border border-black cursor-pointer rounded-lg
              bg-black text-white hover:bg-gray-800"
              onClick={createNote}
            >
              Create New Note
            </button>
          <div className="flex items-center justify-center text-sm">
            <span>this will create a new note with random url</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10 mt-10">
          <div className="bg-neutral-50 p-5 rounded-lg shadow-sm">
            <h3 className="text-green-600 font-semibold mb-1">
              No Registration
            </h3>
            <p className="text-gray-700">
              Create and share notes instantly without signing up
            </p>
          </div>
          <div className="bg-neutral-50 p-5 rounded-lg shadow-sm">
            <h3 className="text-green-600 font-semibold mb-1">
              Real-time Editing
            </h3>
            <p className="text-gray-700">
              See changes as they happen with live collaboration
            </p>
          </div>
          <div className="bg-neutral-50 p-5 rounded-lg shadow-sm">
            <h3 className="text-green-600 font-semibold mb-1">
              Password Protection
            </h3>
            <p className="text-gray-700">
              Secure your notes with optional password protection
            </p>
          </div>
          <div className="bg-neutral-50 p-5 rounded-lg shadow-sm">
            <h3 className="text-green-600 font-semibold mb-1">
              Auto-expiration
            </h3>
            <p className="text-gray-700">
              Notes automatically expire after 30 days for privacy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

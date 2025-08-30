// src/components/Home.jsx
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Online Notepad</h1>
        <p className="tagline">Simple, secure, anonymous note-taking</p>

        <div>
          <h2 className="text-black">
            Type any URL like{" "}
            <span className="font-bold text-blue-500 ">/your-note-id</span> to
            create a note
          </h2>
        </div>

        <div className="features">
          <div className="feature">
            <h3>No Registration</h3>
            <p>Create and share notes instantly without signing up</p>
          </div>
          <div className="feature">
            <h3>Real-time Editing</h3>
            <p>See changes as they happen with live collaboration</p>
          </div>
          <div className="feature">
            <h3>Password Protection</h3>
            <p>Secure your notes with optional password protection</p>
          </div>
          <div className="feature">
            <h3>Auto-expiration</h3>
            <p>Notes automatically expire after 30 days for privacy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

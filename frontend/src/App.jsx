// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import NoteEditor from "./components/editor/NoteEditor";
import { AuthProvider } from "./components/context/AuthContext";
import { ThemeProvider } from "./components/context/ThemeContext";
import Navbar from './components/Navbar'
import Page from "./components/Page";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-white dark:bg-zinc-900 transition-colors">
            <Navbar />
            <Routes>
              <Route path="/" element={<Page />} />
              <Route path="/:id" element={<NoteEditor />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

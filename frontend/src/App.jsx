// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import NoteEditor from "./components/NoteEditor";
import { AuthProvider } from "./components/context/AuthContext";
import Navbar from './components/Navbar'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:id" element={<NoteEditor />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

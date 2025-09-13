// src/components/Home.jsx
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import Page from "./Page";

function Home() {
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
      <Page />
    </div>
  );
}

export default Home;

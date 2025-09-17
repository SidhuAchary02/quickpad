import { useState } from "react"
import { API_BASE_URL } from "../../config/api"

export function Login({ onLoginSuccess, switchToSignup }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to log in")
      } else {
        onLoginSuccess(data.user, data.token)
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center text-[#404040] dark:text-white"
    >
      <div className="w-full max-w-md">
        <form className="bg-white dark:bg-zinc-900 border border-[#cececf] dark:border-zinc-700 rounded-lg p-8 space-y-6 shadow-md" onSubmit={handleLogin}>
          <h2 className="text-center text-2xl font-semibold mb-8 text-[#404040] dark:text-white">
            Welcome Back
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-[#dc2626]">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 text-[#404040] dark:text-white border border-gray-300 dark:border-zinc-500 rounded-lg outline-none hover:border-gray-400 focus:border-gray-500 transition-colors"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-[#404040] dark:text-white border border-gray-300 dark:border-zinc-500 rounded-lg outline-none hover:border-gray-400 focus:border-gray-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-[#404040] hover:bg-[#2b2b2b] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
            {"Don't have an account? "}
            <button
              type="button"
              onClick={switchToSignup}
              className="text-[#404040] dark:text-white underline bg-transparent border-none cursor-pointer transition-colors font-semibold"
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

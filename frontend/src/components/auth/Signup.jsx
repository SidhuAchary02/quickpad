import { useState } from "react"

export function Signup({ onLoginSuccess, switchToLogin }) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to sign up")
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
    <div className="flex justify-center items-center min-h-screen">
      <form className="bg-white p-8 rounded-lg border border-gray-300 w-full max-w-[400px]" onSubmit={handleSignup}>
        <h2 className="text-center mb-6 text-[#404040] text-2xl font-semibold">Create Account</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200 mb-4">{error}</div>}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength="3"
            maxLength="20"
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-base text-[#404040] box-border focus:outline-none focus:border-gray-400"
          />
        </div>

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-base text-[#404040] box-border focus:outline-none focus:border-gray-400"
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            className="w-full py-2 px-3 border border-[#cececf] rounded-lg text-base text-[#404040] box-border focus:outline-none focus:border-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-[#404040] text-white border-none rounded-lg text-base mb-4 hover:bg-[#2b2b2b] disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold cursor-pointer"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-center text-[#404040]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={switchToLogin}
            className="bg-transparent border-none text-[#404040] cursor-pointer underline hover:text-gray-600"
          >
            Log In
          </button>
        </p>
      </form>
    </div>
  )
}

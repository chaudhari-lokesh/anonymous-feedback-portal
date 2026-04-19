import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getApiBase } from "../api";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email?.trim() || !password) {
      setMessage("Email and password required");
      return;
    }
    if (!email.includes("@")) {
      setMessage("Please enter a valid email");
      return;
    }

    setSubmitting(true);
    axios
      .post(`${getApiBase()}/login`, { email, password })
      .then((res) => {
        const userData = { ...res.data.user, token: res.data.token };
        setUser?.(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", res.data.token);
        setMessage("");
        navigate("/dashboard");
      })
      .catch((err) => {
        if (!err.response && err.message) {
          setMessage(
            "Cannot reach API. Set VITE_API_URL to your Render backend URL and redeploy the frontend."
          );
        } else {
          setMessage(err.response?.data?.message || "Login failed");
        }
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Login"}
          </button>
        </form>

        {message && <p className="text-center text-sm text-red-600 mt-4">{message}</p>}

        <p className="mt-6 text-center text-sm text-gray-500">
          No account?{" "}
          <button type="button" onClick={() => navigate("/register")} className="text-indigo-600 hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;

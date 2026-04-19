import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getApiBase } from "../api";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name?.trim() || !email?.trim() || !password) {
      setMessage("All fields are required");
      return;
    }
    if (!email.includes("@")) {
      setMessage("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    axios
      .post(`${getApiBase()}/register`, { name, email, password })
      .then(() => {
        setMessage("Account created. Redirecting…");
        setTimeout(() => navigate("/login"), 1500);
      })
      .catch((err) => {
        const apiErr = err.response?.data?.error;
        if (!err.response && err.message) {
          setMessage(
            "Cannot reach API. Set VITE_API_URL to your Render backend URL and redeploy the frontend."
          );
        } else {
          setMessage(apiErr || "Signup failed");
        }
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign up</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>

        {message && (
          <p className={`text-center text-sm mt-4 ${message.includes("Redirecting") ? "text-green-700" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Already registered?{" "}
          <button type="button" onClick={() => navigate("/login")} className="text-indigo-600 hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;

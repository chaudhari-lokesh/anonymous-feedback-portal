/** Backend base URL (no trailing slash). */
export function getApiBase() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  if (import.meta.env.PROD) {
    return "https://anonymous-feedback-portal.onrender.com";
  }

  return "http://localhost:3001";
}

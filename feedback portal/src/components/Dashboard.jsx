import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getApiBase } from "../api";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}

export default function Dashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(null);

  const [likes, setLikes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fb_likes") || "{}");
    } catch {
      return {};
    }
  });

  const [marked, setMarked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fb_marked") || "{}");
    } catch {
      return {};
    }
  });

  const likesRef = useRef(likes);
  const markedRef = useRef(marked);
  useEffect(() => {
    likesRef.current = likes;
  }, [likes]);
  useEffect(() => {
    markedRef.current = marked;
  }, [marked]);

  const processingRef = useRef(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${getApiBase()}/feedbacks`);
      setFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed loading feedbacks:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setMounted(true), 50);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("fb_likes", JSON.stringify(likes));
    } catch {
      /* ignore */
    }
  }, [likes]);

  useEffect(() => {
    try {
      localStorage.setItem("fb_marked", JSON.stringify(marked));
    } catch {
      /* ignore */
    }
  }, [marked]);

  const filtered = feedbacks.filter((f) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      String(f.topic || "")
        .toLowerCase()
        .includes(q) ||
      String(f.message || "")
        .toLowerCase()
        .includes(q) ||
      String(f.category || "")
        .toLowerCase()
        .includes(q)
    );
  });

  const toggleLike = (id) => {
    if (processingRef.current.has(id)) return;
    processingRef.current.add(id);
    setTimeout(() => processingRef.current.delete(id), 800);

    const already = !!markedRef.current[id];
    const nextMarked = { ...markedRef.current, [id]: !already };
    const prevCount = Number(likesRef.current[id] || 0);
    const nextCount = already ? Math.max(0, prevCount - 1) : prevCount + 1;
    const nextLikes = { ...likesRef.current, [id]: nextCount };

    markedRef.current = nextMarked;
    likesRef.current = nextLikes;
    setMarked(nextMarked);
    setLikes(nextLikes);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Feedback</h1>
            <p className="text-sm text-gray-500 mt-1">Open a card for the full message.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="button"
              onClick={load}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {loading && (
            <>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow animate-pulse"
                  style={{ minHeight: 140 }}
                />
              ))}
            </>
          )}

          {!loading && filtered.length === 0 && (
            <div className="p-6 bg-white rounded-lg text-gray-500 shadow">Nothing to show yet.</div>
          )}

          {!loading &&
            filtered.map((f, idx) => {
              const idShort = `#${String(f._id).slice(-6)}`;
              const likeCount = likes[f._id] || 0;
              const delay = `${idx * 60}ms`;
              return (
                <article
                  key={f._id}
                  onClick={() => setSelected(f)}
                  className={
                    "bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transform transition-all duration-300 " +
                    (mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")
                  }
                  style={{ transitionDelay: delay, cursor: "pointer" }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">
                    <div className="w-full lg:w-52 mb-4 lg:mb-0">
                      <div className="w-full flex items-center justify-between gap-3">
                        <div className="text-xs text-gray-700 font-medium truncate">{idShort}</div>
                        <div className="text-xs text-gray-400 truncate text-right">{formatDate(f.createdAt)}</div>
                      </div>

                      <div className="mt-2">
                        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                          {f.category || f.topic || "General"}
                        </span>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        Priority:{" "}
                        <strong
                          className={`px-2 py-0.5 rounded ${
                            f.priority === "High"
                              ? "bg-red-50 text-red-600"
                              : f.priority === "Medium"
                                ? "bg-yellow-50 text-yellow-600"
                                : "bg-green-50 text-green-600"
                          }`}
                        >
                          {f.priority || "Low"}
                        </strong>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-5">{f.message}</div>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(f._id);
                          }}
                          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 9l-3-5-4 6v7h12V9zM21 12h-6" />
                          </svg>
                          <span>{likeCount || "Helpful"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} aria-hidden />
          <div className="relative z-[60] max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6 mx-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-800">{selected.topic || "Feedback"}</h3>
                <div className="text-xs text-gray-400 mt-1">{formatDate(selected.createdAt)}</div>
                <div className="mt-4 text-gray-700 whitespace-pre-wrap">{selected.message}</div>
                {selected.image && (
                  <div className="mt-4">
                    <img
                      src={`/uploads/${selected.image}`}
                      alt=""
                      className="max-h-72 w-full object-contain rounded-md border"
                    />
                  </div>
                )}
                <div className="mt-6 flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => toggleLike(selected._id)}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
                  >
                    {likes[selected._id] ? `Helpful (${likes[selected._id]})` : "Mark helpful"}
                  </button>
                  <button type="button" onClick={() => setSelected(null)} className="px-3 py-2 text-sm text-gray-600">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

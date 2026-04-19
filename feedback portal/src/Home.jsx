import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getApiBase } from "./api";

export default function Home() {
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Low");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Please select an image file");
    if (file.size > 5 * 1024 * 1024) return alert("Max image size 5MB");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return alert("Please enter your feedback.");
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("category", category);
      form.append("priority", priority);
      form.append("message", message);
      if (image) form.append("image", image);

     await axios.post(`${getApiBase()}/feedback`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCategory("");
      setPriority("Low");
      setMessage("");
      handleRemoveImage();
      alert("Feedback submitted — thank you!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className={`space-y-6 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"} transition-all duration-600`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 3v5c0 5-3.5 9.7-7 12-3.5-2.3-7-7-7-12V5l7-3z"/></svg>
              </div>
              <span className="text-sm text-gray-500">Anonymous & Confidential</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              Share feedback safely — make a difference
            </h1>

            <p className="text-gray-600 max-w-xl">
              Submit anonymous feedback about your experience. Your privacy is respected — no personal data is collected. Quick to submit, easy to review.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-white font-semibold shadow hover:shadow-lg transition bg-gradient-to-r from-indigo-600 to-cyan-500"
                type="button"
              >
                Submit Feedback
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
              </button>

              <a
                href="#learn"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg text-indigo-700 font-medium border border-indigo-100 hover:bg-indigo-50 transition"
              >
                Learn more
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">✓</div>
                <div className="text-sm text-gray-700">100% anonymous</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">⚡</div>
                <div className="text-sm text-gray-700">Fast review</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">🔒</div>
                <div className="text-sm text-gray-700">Privacy first</div>
              </div>
            </div>
          </div>

          {/* Illustration / visual */}
          <div className={`hidden lg:flex justify-center ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} transition-all duration-700`}>
            <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 shadow-xl transform hover:rotate-1 transition">
              <div className="h-48 rounded-md bg-white border border-indigo-100 flex items-center justify-center">
                <img src="/branding/Syncfusion-feedback-portal.svg" alt="feedback" className="h-45 object-contain rounded-2xl w-full max-w-md " />
              </div>
              <div className="mt-4 text-sm text-gray-600">Your anonymous words can lead to improvements.</div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section id="learn" className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Left column - Contact / CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <h2 className="text-xl font-semibold text-gray-800">Quick actions</h2>
                <p className="text-sm text-gray-500 mt-2">Use the form to submit feedback. View results on the dashboard.</p>

                <ul className="mt-6 space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">1</div>
                    <div>
                      <div className="font-medium text-gray-700">Write your feedback</div>
                      <div className="text-xs text-gray-500">Be specific and constructive.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">2</div>
                     <div>
                      <div className="font-medium text-gray-700">Select your category</div>
                      <div className="text-xs text-gray-500">Select category as you need.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">3 </div>
                    <div>
                      <div className="font-medium text-gray-700">Select priority lavel</div>
                      <div className="text-xs text-gray-500">Action will taken as your priority lavel.</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* FORM CARD */}
            <div className="lg:col-span-2">
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className={`bg-white border rounded-2xl p-6 shadow-sm transition transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                aria-label="Anonymous feedback form"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 rounded-full bg-indigo-50 text-indigo-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 3v5c0 5-3.5 9.7-7 12-3.5-2.3-7-7-7-12V5l7-3z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Anonymous Feedback Form</h3>
                    <p className="text-sm text-gray-500">Your feedback is completely anonymous. No personal information is collected.</p>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <label className="text-sm text-gray-700">Feedback Category (Optional)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Select a category</option>
                    <option>Academic</option>
                    <option>Facilities</option>
                    <option>Administration</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="mt-4">
                  <label className="text-sm text-gray-700 block mb-2">Priority Level (Optional)</label>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-700">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="priority" value="Low" checked={priority === "Low"} onChange={() => setPriority("Low")} />
                      <span>Low - General feedback or suggestion</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="priority" value="Medium" checked={priority === "Medium"} onChange={() => setPriority("Medium")} />
                      <span>Medium - Important but not urgent</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="priority" value="High" checked={priority === "High"} onChange={() => setPriority("High")} />
                      <span>High - Urgent attention needed</span>
                    </label>
                  </div>
                </div>

                {/* Message */}
                <div className="mt-4">
                  <label className="text-sm text-gray-700 block mb-2">Your Feedback *</label>
                  <textarea
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    maxLength={2000}
                    required
                    placeholder="Share your thoughts, experiences, suggestions, or concerns..."
                    className="w-full border rounded-lg px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <div className="text-xs text-gray-400 mt-2">{message.length}/2000 characters</div>
                </div>

               
                {/* privacy + submit */}
                <div className="mt-6 grid gap-4">
                  <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-700 flex items-start gap-3">
                    <div className="pt-0.5">
                      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 3v5c0 5-3.5 9.7-7 12-3.5-2.3-7-7-7-12V5l7-3z"/></svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Privacy Guarantee</div>
                      <div className="text-xs text-gray-500 mt-1">This form collects no personal identifiers. Images should not include personal data.</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-1/2 inline-flex items-center justify-center gap-3 px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-transform transform hover:-translate-y-0.5 disabled:opacity-60"
                      style={{ background: "linear-gradient(90deg,#4f46e5,#06b6d4)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
                      <span>{submitting ? "Submitting..." : "Submit Feedback"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER / small note */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-500">
        <div className="text-center">Built with privacy in mind • No personal data is collected</div>
      </footer>
    </main>
  );
}
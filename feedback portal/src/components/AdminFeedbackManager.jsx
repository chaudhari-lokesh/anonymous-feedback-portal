import React, { useEffect, useState } from "react";
import axios from "axios";
import { getApiBase } from "../api";

const StatusBadge = ({ status }) => {
  const colors = {
    "Pending": "bg-red-100 text-red-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
    "Resolved": "bg-green-100 text-green-800"
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    "High": "bg-red-50 text-red-700 border border-red-200",
    "Medium": "bg-yellow-50 text-yellow-700 border border-yellow-200",
    "Low": "bg-blue-50 text-blue-700 border border-blue-200"
  };
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${colors[priority] || "bg-gray-100"}`}>
      {priority}
    </span>
  );
};

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString() + " " + dt.toLocaleTimeString();
};

export default function AdminFeedbackManager({ onUpdate }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [editingNotes, setEditingNotes] = useState("");
  
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    search: ""
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status !== "all") params.status = filters.status;
      if (filters.priority !== "all") params.priority = filters.priority;
      if (filters.category !== "all") params.category = filters.category;
      
      const res = await axios.get(`${getApiBase()}/admin/feedbacks`, { 
        params,
        headers: getAuthHeader()
      });
      setFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed loading feedbacks:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [filters.status, filters.priority, filters.category]);

  const handleStatusUpdate = async (feedbackId, newStatus) => {
    try {
      const payload = { status: newStatus };
      if (editingNotes.trim() !== "") {
        payload.adminNotes = editingNotes.trim();
      }
      await axios.put(`${getApiBase()}/admin/feedbacks/${feedbackId}`, payload, {
        headers: getAuthHeader()
      });
      setEditingStatus(null);
      setEditingNotes("");
      loadFeedbacks();
      onUpdate?.();
    } catch (err) {
      console.error("Failed updating feedback:", err);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await axios.delete(`${getApiBase()}/admin/feedbacks/${feedbackId}`, {
          headers: getAuthHeader()
        });
        loadFeedbacks();
        onUpdate?.();
        setSelectedFeedback(null);
      } catch (err) {
        console.error("Failed deleting feedback:", err);
      }
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get(`${getApiBase()}/admin/export`, {
        responseType: 'blob',
        headers: getAuthHeader()
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'feedbacks.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Failed exporting feedbacks:", err);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (!filters.search) return true;
    const q = filters.search.toLowerCase();
    return (
      (f.topic || "").toLowerCase().includes(q) ||
      (f.message || "").toLowerCase().includes(q) ||
      (f.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Side - Feedback List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Feedbacks</h2>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                Export CSV
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="Academic">Academic</option>
                <option value="Facilities">Facilities</option>
                <option value="Behavior">Behavior</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Feedbacks List */}
          <div className="divide-y max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No feedbacks found</div>
            ) : (
              filteredFeedbacks.map((fb) => (
                <div
                  key={fb._id}
                  onClick={() => setSelectedFeedback(fb)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedFeedback?._id === fb._id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{fb.topic || "Untitled"}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{fb.message}</p>
                      <div className="flex gap-2 mt-2">
                        <StatusBadge status={fb.status || "Pending"} />
                        <PriorityBadge priority={fb.priority || "Low"} />
                        {fb.category && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{fb.category}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Detail Panel */}
      {selectedFeedback && (
        <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-900">Details</h3>
            <button
              onClick={() => setSelectedFeedback(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Feedback Details */}
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Topic</p>
              <p className="text-gray-900 font-medium">{selectedFeedback.topic || "N/A"}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Message</p>
              <p className="text-gray-700 text-sm">{selectedFeedback.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Priority</p>
                <PriorityBadge priority={selectedFeedback.priority} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Category</p>
                <p className="text-gray-900 text-sm">{selectedFeedback.category || "N/A"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Date</p>
              <p className="text-gray-900 text-sm">{formatDate(selectedFeedback.createdAt)}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Current Status</p>
              <StatusBadge status={selectedFeedback.status} />
            </div>
          </div>

          <hr className="my-4" />

          {/* Update Status */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase">Update Status</p>
            <select
              value={editingStatus || selectedFeedback.status}
              onChange={(e) => setEditingStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Admin Notes */}
            <textarea
              placeholder="Add notes..."
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
            />

            {selectedFeedback.adminNotes && (
              <div className="text-xs bg-gray-100 p-2 rounded">
                <p className="font-semibold text-gray-700">Previous Notes:</p>
                <p className="text-gray-600">{selectedFeedback.adminNotes}</p>
              </div>
            )}

            <button
              onClick={() => handleStatusUpdate(selectedFeedback._id, editingStatus || selectedFeedback.status)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              Save Changes
            </button>

            <button
              onClick={() => handleDeleteFeedback(selectedFeedback._id)}
              className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm"
            >
              Delete Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

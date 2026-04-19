import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminFeedbackManager from "./AdminFeedbackManager";
import { getApiBase } from "../api";

const STAT_STYLES = {
  blue: { card: "bg-blue-50 border-blue-500", value: "text-blue-700" },
  red: { card: "bg-red-50 border-red-500", value: "text-red-700" },
  yellow: { card: "bg-yellow-50 border-yellow-500", value: "text-yellow-800" },
  green: { card: "bg-green-50 border-green-500", value: "text-green-700" },
  orange: { card: "bg-orange-50 border-orange-500", value: "text-orange-700" },
};

const StatCard = ({ title, value, color = "blue" }) => {
  const s = STAT_STYLES[color] || STAT_STYLES.blue;
  return (
    <div className={`${s.card} p-4 rounded-lg border-l-4`}>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className={`text-3xl font-bold ${s.value}`}>{value}</p>
    </div>
  );
};

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
    byCategory: [],
  });
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadStats = async () => {
    try {
      const res = await axios.get(`${getApiBase()}/admin/stats`, {
        headers: getAuthHeader()
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed loading stats:", err);
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
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome, <span className="font-semibold">{user?.name}</span> ({user?.role?.toUpperCase()})
          </p>
        </div>

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard title="Total Feedbacks" value={stats.total} color="blue" />
            <StatCard title="Pending" value={stats.pending} color="red" />
            <StatCard title="In Progress" value={stats.inProgress} color="yellow" />
            <StatCard title="Resolved" value={stats.resolved} color="green" />
            <StatCard title="High Priority" value={stats.highPriority} color="orange" />
          </div>
        )}

        {!loading && stats.byCategory.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">By Category</h2>
            <div className="space-y-3">
              {stats.byCategory.map((cat) => (
                <div key={cat._id} className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{cat._id || "Uncategorized"}</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 rounded-full flex-1" style={{ width: "200px", height: "8px" }}>
                      <div 
                        className="bg-blue-500 h-full rounded-full" 
                        style={{ width: `${(cat.count / stats.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-blue-600 font-semibold min-w-12">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AdminFeedbackManager onUpdate={loadStats} />
      </div>
    </div>
  );
}

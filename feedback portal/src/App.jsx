import { useState, useEffect } from 'react'
import Signup from './components/Signup'
import Login from './components/Login';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Homepage from './Home';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'

const ADMIN_ROLES = ["teacher", "hod", "principal"];

function AdminRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!ADMIN_ROLES.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/home" element={<Homepage />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/admin"
          element={
            <AdminRoute user={user}>
              <AdminDashboard user={user} />
            </AdminRoute>
          }
        />
        <Route path="/" element={<Homepage />} />
      </Routes>

      <Footer user={user} />
    </BrowserRouter>
  )
}

export default App

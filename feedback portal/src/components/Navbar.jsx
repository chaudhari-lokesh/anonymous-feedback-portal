import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center">
        <div className="flex items-center z-20">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight text-gray-900"
          >
            Anonymous Feedback Portal for <span className="italic text-black">Students</span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3 z-20">
         
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-gray-700">
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm hover:bg-gray-50"
              >
                Sign Out
              </button>
              {["teacher", "hod", "principal"].includes(user.role) && (
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="ml-2 px-4 py-1.5 bg-violet-700 text-white rounded-md text-sm hover:bg-violet-800"
                >
                  Admin
                </button>
              )}
              <button
                onClick={() => navigate("/dashboard")}
                className="ml-2 px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Dashboard
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Signup
              </Link>
              <Link
                to="/login"
                className="px-4 py-1.5 border border-gray-200 rounded-md text-sm hover:bg-gray-50 ml-2"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

    </header>
  );
};

export default Navbar;
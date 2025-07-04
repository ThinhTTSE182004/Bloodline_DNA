import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserShield,
  FaHome,
  FaCogs,
  FaUsers,
  FaSignOutAlt,
  FaDna,
  FaColumns,
  FaBars,
} from "react-icons/fa";

const AdminNavbar = ({ onSidebarToggle }) => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const sessionToken = sessionStorage.getItem("token");
    const localToken = localStorage.getItem("token");
    
    // Check if user should be logged out (sessionStorage token missing but localStorage token exists)
    if (localToken && !sessionToken) {
      // Auto logout - clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      navigate("/");
      return;
    }
    
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        const userData = JSON.parse(jsonPayload);
        setUserName(userData.name || "Admin");
      } catch {
        setUserName("Admin");
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/");
    window.dispatchEvent(new Event("userLogout"));
  };

  return (
    <nav className="bg-white shadow-md rounded-b-lg font-sans fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Left side: Hamburger + Logo */}
          <div className="flex items-center space-x-4">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-blue-600 focus:outline-none text-2xl"
              onClick={onSidebarToggle}
              aria-label="Open sidebar"
            >
              <FaBars />
            </button>
  
            <Link to="/admin" className="flex-shrink-0 flex items-center">
              <FaDna className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-black">
                DNA Admin
              </span>
            </Link>
          </div>
  
          {/* Right side: Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-black font-medium hover:text-blue-600 transition-colors duration-300 flex items-center"
            >
              <FaHome className="mr-1" />
              Home
            </Link>
            <Link
              to="/admin"
              className="text-black font-medium hover:text-blue-600 transition-colors duration-300 flex items-center"
            >
              <FaColumns className="mr-1" />
              Admin Page
            </Link>
            <Link
              to="/services"
              className="text-black font-medium hover:text-blue-600 transition-colors duration-300 flex items-center"
            >
              <FaCogs className="mr-1" />
              Services
            </Link>
            <Link
              to="/admin/users"
              className="text-black font-medium hover:text-blue-600 transition-colors duration-300 flex items-center"
            >
              <FaUsers className="mr-1" />
              User Management
            </Link>
            <span className="text-black font-medium">Hi, {userName}!</span>
            <button
              onClick={handleLogout}
              className="text-red-600 font-medium hover:text-red-800 transition-colors duration-300 flex items-center"
            >
              <FaSignOutAlt className="mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );  
};

export default AdminNavbar;

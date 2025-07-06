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
  FaTimes,
} from "react-icons/fa";

const AdminNavbar = ({ onSidebarToggle }) => {
  const [userName, setUserName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    navigate("/");
    window.dispatchEvent(new Event("userLogout"));
  };

  return (
    <nav className="bg-white shadow-md rounded-b-lg font-sans fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Left side: Hamburger + Logo */}
          <div className="flex items-center">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-blue-600 focus:outline-none text-2xl mr-4"
              onClick={onSidebarToggle}
              aria-label="Open sidebar"
            >
              <FaBars />
            </button>
  
            <Link to="/admin" className="flex-shrink-0 flex items-center">
              <FaDna className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-black hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                DNA Admin
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              Home
            </Link>
            <Link
              to="/admin"
              className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/services"
              className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              Services
            </Link>
            <Link
              to="/admin/staff-management"
              className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              Staff
            </Link>
            
            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer focus:outline-none"
              >
                Hi, {userName}!
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    onClick={() => setShowDropdown(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    onClick={() => setShowDropdown(false)}
                  >
                    View Customer Site
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-blue-600 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/admin"
              className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/services"
              className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/admin/staff-management"
              className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Staff
            </Link>
            
            {/* Mobile User Menu */}
            <div className="mt-4">
              <button
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200 focus:outline-none"
              >
                Hi, {userName}!
              </button>
              {showDropdown && (
                <div className="px-3 py-1 space-y-1">
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => {
                      setShowDropdown(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => {
                      setShowDropdown(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    View Customer Site
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;

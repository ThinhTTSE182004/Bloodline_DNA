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
  FaBell,
} from "react-icons/fa";
import signalRService from '../../services/signalRService';

// Toast notification component
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed top-6 right-6 z-[9999] bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
      <FaBell className="mr-2" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">×</button>
    </div>
  );
}

const AdminNavbar = ({ onSidebarToggle }) => {
  const [userName, setUserName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);
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

  useEffect(() => {
    const userRole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    console.log('[AdminNavbar] userRole:', userRole);
    if (userRole === "Admin") {
      console.log('[AdminNavbar] Calling joinAdminGroup');
      signalRService.joinAdminGroup && signalRService.joinAdminGroup();
    }
    const handleNewOrder = (data) => {
      console.log('[AdminNavbar] Received NewOrder:', data);
      setNotifications(prev => {
        const newList = [...prev, data];
        console.log('[AdminNavbar] setNotifications, before:', prev, 'after:', newList);
        return newList;
      });
      setUnreadCount(prev => {
        const newCount = prev + 1;
        console.log('[AdminNavbar] setUnreadCount, before:', prev, 'after:', newCount);
        return newCount;
      });
      setToast({ message: `Đơn hàng mới từ ${data.customerName} (${data.customerPhone})!` });
      console.log('[AdminNavbar] setToast:', data.customerName, data.customerPhone);
    };
    console.log('[AdminNavbar] Registering event: NewOrder', handleNewOrder);
    signalRService.on('NewOrder', handleNewOrder);
    return () => {
      console.log('[AdminNavbar] Unregistering event: NewOrder', handleNewOrder);
      signalRService.off('NewOrder', handleNewOrder);
    };
  }, []);

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
              <img src="/img/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
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
            
            {/* Notification Bell & Dropdown (desktop only) */}
            <div className="relative">
              <button
                className="relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-blue-600 transition-colors duration-300 focus:outline-none"
                onClick={() => {
                  setShowNotifications((prev) => {
                    if (!prev) setUnreadCount(0);
                    return !prev;
                  });
                }}
                aria-label="Notifications"
              >
                <FaBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center z-10">
                    {unreadCount}
                  </span>
                )}
              </button>
              {/* Dropdown notification */}
              <div
                className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50"
                style={{ minWidth: '320px', display: showNotifications ? 'block' : 'none' }}
              >
                <div className="py-2 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-gray-400 text-center">No new notifications</div>
                  ) : (
                    notifications.slice().reverse().map((noti, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 mb-1 bg-blue-50 rounded-lg shadow-sm border border-blue-100 flex flex-col gap-1 cursor-pointer hover:bg-blue-100 transition"
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/admin/all-orders');
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-blue-700 font-semibold">{noti.message}</span>
                        </div>
                        <div className="text-xs text-gray-700">Order ID: <span className="font-mono">{noti.orderId}</span></div>
                        <div className="text-xs text-gray-700">Khách: <span>{noti.customerName} ({noti.customerPhone})</span></div>
                        <div className="text-xs text-gray-700">Tổng tiền: <span className="font-semibold">{noti.totalAmount}₫</span></div>
                        <div className="text-xs text-gray-700">Thời gian: <span>{new Date(noti.createdAt).toLocaleString()}</span></div>
                        <div className="text-xs text-gray-700">Trạng thái: <span>{noti.paymentStatus}</span></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
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

      {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}
    </nav>
  );
};

export default AdminNavbar;

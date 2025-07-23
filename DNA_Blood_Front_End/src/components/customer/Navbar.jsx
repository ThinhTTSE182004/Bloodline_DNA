import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';
// import { FaDna } from "react-icons/fa6";
import { useCart } from '../../context/CartContext';
import signalRService from '../../services/signalRService';

// Thêm hàm tự decode JWT lấy userId
function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  } catch (e) {
    console.error('Invalid token:', e);
    return null;
  }
}

export default function Navbar() {
  // Hook ở đầu thân component
  const [unreadCount, setUnreadCount] = useState(() => Number(localStorage.getItem('unreadCount')) || 0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const location = useLocation();

  // Khi render, đồng bộ unreadCount với localStorage nếu lệch
  useEffect(() => {
    const storedUnread = Number(localStorage.getItem('unreadCount')) || 0;
    if (unreadCount === 0 && storedUnread > 0) {
      setUnreadCount(storedUnread);
      console.log('[Navbar] Sync unreadCount from localStorage:', storedUnread);
    }
  }, [unreadCount]);

  // Định nghĩa callback nhận notification
  const handlePaymentSuccess = useCallback((data) => {
  setNotifications(prev => {
    const newList = [...prev, data];
    console.log('[Navbar] handlePaymentSuccess, notifications before:', prev, 'after:', newList);
    return newList;
  });
  setUnreadCount(prev => {
    const newCount = prev + 1;
    localStorage.setItem('unreadCount', newCount);
    console.log('[Navbar] handlePaymentSuccess, unreadCount before:', prev, 'after:', newCount);
    return newCount;
  });
  console.log('[Navbar] Received PaymentSuccess:', data);
}, []);

// Thêm callback cho notification result
const handleResultNotification = useCallback((orderId, message) => {
  setNotifications(prev => {
    const newList = [...prev, { orderId, message, type: 'result' }];
    return newList;
  });
  setUnreadCount(prev => {
    const newCount = prev + 1;
    localStorage.setItem('unreadCount', newCount);
    return newCount;
  });
}, []);

useEffect(() => {
  signalRService.on('PaymentSuccess', handlePaymentSuccess);
  signalRService.on('ReceiveResultNotification', handleResultNotification);
  return () => {
    signalRService.off('PaymentSuccess', handlePaymentSuccess);
    signalRService.off('ReceiveResultNotification', handleResultNotification);
  };
}, [handlePaymentSuccess, handleResultNotification]);

  // Kiểm tra trạng thái đăng nhập ban đầu và lắng nghe login/logout
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUserName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
      const storedUserRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
      setIsLoggedIn(!!token);
      setUserName(storedUserName || '');
      setUserRole(storedUserRole || null);
      // Dùng hàm tự decode JWT lấy userId
      const userId = getUserIdFromToken(token);
      console.log('[Navbar] userId from token:', userId);
      if (token && userId) {
        signalRService.joinUserGroup(userId);
        console.log('[Navbar] Join SignalR group:', userId);
      }
      console.log('[Navbar] checkLoginStatus, token:', token);
    };

    const handleLogin = (event) => {
      const { userName, userRole } = event.detail;
      setIsLoggedIn(true);
      setUserName(userName);
      setUserRole(userRole);
      console.log('[Navbar] userLogin event, userName:', userName, 'userRole:', userRole);
    };

    const handleLogoutEvent = () => {
      setIsLoggedIn(false);
      setUserName('');
      setUserRole(null);
      console.log('[Navbar] userLogout event');
    };

    checkLoginStatus();
    window.addEventListener('userLogin', handleLogin);
    window.addEventListener('userLogout', handleLogoutEvent);

    return () => {
      window.removeEventListener('userLogin', handleLogin);
      window.removeEventListener('userLogout', handleLogoutEvent);
    };
  }, []);

  // Khi logout mới thực sự ngắt kết nối và unregister callback
  const handleLogout = async () => {
    console.log('[Navbar] Logging out, stopping SignalR connection');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserName('');
    setUserRole(null);
    setShowDropdown(false);
    // Ngắt kết nối SignalR (không unregister callback nữa)
    try {
      // signalRService.off('PaymentSuccess', handlePaymentSuccess); // Bỏ dòng này
      await signalRService.stopConnection();
    } catch (e) {
      console.error('Error stopping SignalR:', e);
    }
    // Bắn event userLogout để các component khác biết
    window.dispatchEvent(new CustomEvent('userLogout'));
    navigate('/login');
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      setShowNotifications(false);
    }
  };

  const isHomePage = location.pathname === '/';

  const handleShowNotifications = () => {
    setShowNotifications((prev) => {
      if (!prev) {
        setUnreadCount(0);
        localStorage.setItem('unreadCount', 0);
        console.log('[Navbar] Open dropdown, reset unreadCount to 0');
      }
      return !prev;
    });
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Log mỗi lần render để kiểm tra unreadCount
  console.log('[Navbar] Render, unreadCount:', unreadCount, 'notifications:', notifications);

  return (
    <nav className="bg-white shadow-md rounded-b-lg font-sans fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src="/img/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
              <span className="ml-2 text-xl font-semibold text-black hover:text-blue-600 transition-colors duration-200 cursor-pointer">DNA Testing</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isHomePage ? (
              <>
                <a
                  href="#home"
                  onClick={(e) => handleNavClick(e, 'home')}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  Home
                </a>
                <a
                  href="#features"
                  onClick={(e) => handleNavClick(e, 'features')}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  Features
                </a>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  Services
                </a>
                <a
                  href="#testimonials"
                  onClick={(e) => handleNavClick(e, 'testimonials')}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  Feedback
                </a>
                <a
                  href="#faq"
                  onClick={(e) => handleNavClick(e, 'faq')}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  FAQ
                </a>
                <a
                  href="#blog"
                  onClick={(e) => handleNavClick(e, 'blog')}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  Blog
                </a>
              </>
            ) : (
              <>
                <Link to="/" className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                  Home
                </Link>
                <Link to="/services" className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                  Services
                </Link>
                <Link to="/blog" className="text-black font-medium hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                  Blog
                </Link>
              </>
            )}
            {/* Notification Bell & Dropdown (desktop only) */}
            <div className="relative inline-block" ref={notificationRef}>
              <button
                className="relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-blue-600 transition-colors duration-300 focus:outline-none"
                onClick={() => {
                  setShowNotifications((prev) => {
                    if (!prev) {
                      setUnreadCount(0);
                      localStorage.setItem('unreadCount', 0);
                      console.log('[Navbar] Open dropdown, reset unreadCount to 0');
                    }
                    return !prev;
                  });
                }}
                aria-label="Notifications"
              >
                <FaBell className="w-5 h-5" />
                {/* Log ngay trước JSX badge */}
                {console.log('[Navbar] JSX badge, unreadCount:', unreadCount)}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center z-10">
                    {unreadCount}
                  </span>
                )}
              </button>
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
                        className="px-4 py-3 mb-1 bg-blue-50 rounded-lg shadow-sm border border-blue-100 flex flex-col gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-blue-700 font-semibold">{noti.message}</span>
                        </div>
                        {noti.orderId && (
                          <div className="text-xs text-gray-700">Order ID: <span className="font-mono">{noti.orderId}</span></div>
                        )}
                        {noti.amount && (
                          <div className="text-xs text-gray-700">Amount: <span className="font-semibold">{noti.amount}₫</span></div>
                        )}
                        {noti.paymentDate && (
                          <div className="text-xs text-gray-700">Payment Time: <span>{new Date(noti.paymentDate).toLocaleString()}</span></div>
                        )}
                        {noti.status && (
                          <div className="text-xs text-gray-700">Status: <span>{noti.status}</span></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            {isLoggedIn && (
              <Link to="/cart" className="relative inline-flex items-center justify-center w-10 h-10 text-gray-700 hover:text-blue-600 transition-colors duration-300">
                <FaShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            {isLoggedIn ? (
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
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      onClick={() => setShowDropdown(false)}
                    >
                      User Profile
                    </Link>
                    <Link
                      to="/account-setting"
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      onClick={() => setShowDropdown(false)}
                    >
                      Account Setting
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      Logout
                    </button>
                    {userRole === 'Admin' && (
                      <a
                        href="/admin"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        Admin Page
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 hover:text-blue-100 transition-colors duration-200 cursor-pointer"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-500 hover:text-cyan-100 transition-colors duration-200 cursor-pointer"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setShowNotifications(false)}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-blue-600 focus:outline-none"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showNotifications && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isHomePage ? (
              <>
                <a
                  href="#home"
                  onClick={(e) => handleNavClick(e, 'home')}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
                >
                  Home
                </a>
                <a
                  href="#features"
                  onClick={(e) => handleNavClick(e, 'features')}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
                >
                  Features
                </a>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
                >
                  Services
                </a>
                <a
                  href="#testimonials"
                  onClick={(e) => handleNavClick(e, 'testimonials')}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
                >
                  Feedback
                </a>
                <a
                  href="#faq"
                  onClick={(e) => handleNavClick(e, 'faq')}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
                >
                  FAQ
                </a>
                <a
                  href="#blog"
                  onClick={(e) => handleNavClick(e, 'blog')}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
                >
                  Blog
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
                >
                  Home
                </Link>
                <Link
                  to="/services"
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
                >
                  Services
                </Link>
                <Link
                  to="/blog"
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200"
                >
                  Blog
                </Link>
              </>
            )}
            {/* Notification Bell & Dropdown */}
            <div className="relative inline-block" ref={notificationRef}>
              <button
                className="relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-blue-600 transition-colors duration-300 focus:outline-none"
                onClick={() => {
                  setShowNotifications((prev) => {
                    if (!prev) {
                      setUnreadCount(0);
                      localStorage.setItem('unreadCount', 0);
                      console.log('[Navbar] Open dropdown, reset unreadCount to 0');
                    }
                    return !prev;
                  });
                }}
                aria-label="Notifications"
              >
                <FaBell className="w-5 h-5" />
                {/* Log ngay trước JSX badge */}
                {console.log('[Navbar] JSX badge, unreadCount:', unreadCount)}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center z-10">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div
                className={`absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 transition-all duration-300 ease-out
                  ${showNotifications ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                style={{ minWidth: '320px' }}
              >
                <div className="py-2 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-gray-400 text-center">No new notifications</div>
                  ) : (
                    notifications.slice().reverse().map((noti, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 mb-1 bg-blue-50 rounded-lg shadow-sm border border-blue-100 flex flex-col gap-1 animate-fade-in"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-blue-700 font-semibold"><FaBell className="inline mr-1" /> {noti.message}</span>
                        </div>
                        {noti.orderId && (
                          <div className="text-xs text-gray-700">Order ID: <span className="font-mono">{noti.orderId}</span></div>
                        )}
                        {noti.amount && (
                          <div className="text-xs text-gray-700">Amount: <span className="font-semibold">{noti.amount}₫</span></div>
                        )}
                        {noti.paymentDate && (
                          <div className="text-xs text-gray-700">Payment Time: <span>{new Date(noti.paymentDate).toLocaleString()}</span></div>
                        )}
                        {noti.status && (
                          <div className="text-xs text-gray-700">Status: <span>{noti.status}</span></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            {isLoggedIn && (
              <Link
                to="/cart"
                className="w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200 flex items-center"
              >
                <FaShoppingCart className="w-5 h-5 mr-2" />
                Cart
                {cartCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            {isLoggedIn ? (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                    setShowNotifications(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-200 focus:outline-none"
                >
                  Hi, {userName}!
                </button>
                {showDropdown && (
                  <div className="px-3 py-1 space-y-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setShowDropdown(false);
                        setShowNotifications(false);
                      }}
                    >
                      User Profile
                    </Link>
                    <Link
                      to="/account-setting"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setShowDropdown(false);
                        setShowNotifications(false);
                      }}
                    >
                      Account Setting
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowNotifications(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Logout
                    </button>
                    {userRole === 'Admin' && (
                      <a
                        href="/admin"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Admin Page
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <Link
                  to="/login"
                  className="block w-full text-left bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 mb-2"
                  onClick={() => setShowNotifications(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-left bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-500 transition-colors duration-200"
                  onClick={() => setShowNotifications(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

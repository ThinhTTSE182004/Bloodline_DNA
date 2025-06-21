import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { FaDna } from "react-icons/fa6";
import { useCart } from '../context/CartContext';
import signalRService from '../services/signalRService';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập ban đầu
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const storedUserName = localStorage.getItem('userName');
      const storedUserRole = localStorage.getItem('userRole');
      setIsLoggedIn(!!token);
      setUserName(storedUserName || '');
      setUserRole(storedUserRole || '');
    };

    // Lắng nghe sự kiện đăng nhập
    const handleLogin = (event) => {
      const { userName, userRole } = event.detail;
      setIsLoggedIn(true);
      setUserName(userName);
      setUserRole(userRole);
    };

    // Lắng nghe sự kiện logout
    const handleLogoutEvent = () => {
      setIsLoggedIn(false);
      setUserName('');
      setUserRole('');
    };

    // Kiểm tra trạng thái ban đầu
    checkLoginStatus();

    // Thêm event listener
    window.addEventListener('userLogin', handleLogin);
    window.addEventListener('userLogout', handleLogoutEvent);

    // Cleanup
    return () => {
      window.removeEventListener('userLogin', handleLogin);
      window.removeEventListener('userLogout', handleLogoutEvent);
    };
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserName('');
    setUserRole('');
    setShowDropdown(false);
    // Ngắt kết nối SignalR
    try {
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
      setIsOpen(false);
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <nav className="bg-white shadow-md rounded-b-lg font-sans fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <FaDna className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-black">DNA Testing</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isHomePage ? (
              <>
                <a
                  href="#home"
                  onClick={(e) => handleNavClick(e, 'home')}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Home
                </a>
                <a
                  href="#features"
                  onClick={(e) => handleNavClick(e, 'features')}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Features
                </a>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Services
                </a>
                <a
                  href="#testimonials"
                  onClick={(e) => handleNavClick(e, 'testimonials')}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Feedback
                </a>
                <a
                  href="#faq"
                  onClick={(e) => handleNavClick(e, 'faq')}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  FAQ
                </a>
                <a
                  href="#blog"
                  onClick={(e) => handleNavClick(e, 'blog')}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Blog
                </a>
              </>
            ) : (
              <>
                <Link to="/" className="text-black font-medium hover:text-blue-600 transition-colors duration-300">
                  Home
                </Link>
                <Link to="/services" className="text-black font-medium hover:text-blue-600 transition-colors duration-300">
                  Services
                </Link>
                <Link to="/blog" className="text-black font-medium hover:text-blue-600 transition-colors duration-300">
                  Blog
                </Link>
              </>
            )}
            <Link to="/cart" className="relative inline-flex items-center justify-center w-10 h-10 text-gray-700 hover:text-blue-600 transition-colors duration-300">
              <FaShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-black font-medium hover:text-blue-600 transition-colors duration-300 focus:outline-none"
                >
                  Hi, {userName}!
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      User Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Account Setting
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-500 transition-colors duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isHomePage ? (
              <>
                <a
                  href="#home"
                  onClick={(e) => handleNavClick(e, 'home')}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Home
                </a>
                <a
                  href="#features"
                  onClick={(e) => handleNavClick(e, 'features')}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Features
                </a>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Services
                </a>
                <a
                  href="#testimonials"
                  onClick={(e) => handleNavClick(e, 'testimonials')}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Feedback
                </a>
                <a
                  href="#faq"
                  onClick={(e) => handleNavClick(e, 'faq')}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  FAQ
                </a>
                <a
                  href="#blog"
                  onClick={(e) => handleNavClick(e, 'blog')}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Blog
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Home
                </Link>
                <Link
                  to="/services"
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Services
                </Link>
                <Link
                  to="/blog"
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300"
                >
                  Blog
                </Link>
              </>
            )}
            <Link
              to="/cart"
              className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300 flex items-center"
            >
              <FaShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {cartCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            {isLoggedIn ? (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300 focus:outline-none"
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
                        setIsOpen(false);
                      }}
                    >
                      User Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setShowDropdown(false);
                        setIsOpen(false);
                      }}
                    >
                      Account Setting
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <Link
                  to="/login"
                  className="block w-full text-left bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 mb-2"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-left bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-500 transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
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
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { FaDna } from "react-icons/fa6";
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserName = localStorage.getItem('userName');
    setIsLoggedIn(!!token);
    setUserName(storedUserName || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setUserName('');
    setShowDropdown(false);
    navigate('/login');
  };

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
            <Link to="/" className="text-black font-medium hover:text-blue-600 transition-colors duration-300">Home</Link>
            <Link to="/feature" className="text-black font-medium hover:text-blue-600 transition-colors duration-300">Feature</Link>
            <Link to="/about" className="text-black font-medium hover:text-blue-600 transition-colors duration-300">About</Link>
            <Link to="/services" className="text-black font-medium hover:text-blue-600 transition-colors duration-300">Services</Link>
            <Link to="/faq" className="text-black font-medium hover:text-blue-600 transition-colors duration-300">FAQ</Link>
            <Link to="/blog" className="text-black font-medium hover:text-blue-600 transition-colors duration-300">Blog</Link>
            <Link to="/cart" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center">
              <FaShoppingCart className="w-5 h-5 mr-2" />
              CART
              {cartCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
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
            <Link to="/" className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/feature" className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300" onClick={() => setIsOpen(false)}>Feature</Link>
            <Link to="/about" className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300" onClick={() => setIsOpen(false)}>About</Link>
            <Link to="/services" className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300" onClick={() => setIsOpen(false)}>Services</Link>
            <Link to="/faq" className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300" onClick={() => setIsOpen(false)}>FAQ</Link>
            <Link to="/blog" className="block w-full text-left px-3 py-2 text-black font-medium hover:text-blue-600 transition-colors duration-300" onClick={() => setIsOpen(false)}>Blog</Link>
            <Link to="/cart" className="block w-full text-left px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center" onClick={() => setIsOpen(false)}>
              <FaShoppingCart className="w-5 h-5 mr-2" />
              CART
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

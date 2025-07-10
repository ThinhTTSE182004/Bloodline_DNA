import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClipboardList, FaUserCog, FaBars, FaTimes, FaDna, FaUserMd } from 'react-icons/fa';

const MedicalStaffNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const sessionToken = sessionStorage.getItem('token');
    const localToken = localStorage.getItem('token');
    
    // Check if user should be logged out (sessionStorage token missing but localStorage token exists)
    if (localToken && !sessionToken) {
      // Auto logout - clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      navigate('/login');
      return;
    }
    
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const userData = JSON.parse(jsonPayload);
        setUserName(userData.name || 'Medical Staff');
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserName('Medical Staff');
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userRole');
    window.dispatchEvent(new CustomEvent('userLogout'));
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md rounded-b-lg font-sans fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/medical-staff" className="flex-shrink-0 flex items-center">
              <img src="/img/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
              <span className="ml-2 text-xl font-semibold text-black hover:text-teal-600 transition-colors duration-300">DNA Testing</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/medical-staff"
              className="text-black font-medium hover:text-teal-600 transition-colors duration-300"
            >
              Dashboard
            </Link>
            <Link
              to="/medical-staff/orders"
              className="text-black font-medium hover:text-teal-600 transition-colors duration-300"
            >
              Orders
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center text-black font-medium hover:text-teal-600 transition-colors duration-300 focus:outline-none"
              >
                <FaUserMd className="mr-2" />
                Hi, {userName}!
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 transform transition-all duration-200 ease-in-out">
                  <Link
                    to="/medical-staff/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    User Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
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
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-teal-600 focus:outline-none transition-colors duration-300"
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
        <div className="md:hidden transform transition-all duration-200 ease-in-out">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/medical-staff"
              className="block w-full text-left px-3 py-2 text-black font-medium hover:text-teal-600 transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/medical-staff/orders"
              className="block w-full text-left px-3 py-2 text-black font-medium hover:text-teal-600 transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Orders
            </Link>
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="flex items-center px-3 py-2">
                  <FaUserMd className="text-gray-600 mr-2"/>
                  <span className="text-black font-medium">Hi, {userName}!</span>
              </div>
              <Link
                to="/medical-staff/profile"
                className="block w-full text-left pl-10 pr-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                  User Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left pl-10 pr-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MedicalStaffNavbar; 
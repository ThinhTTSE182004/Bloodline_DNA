import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserShield, FaHome, FaCogs, FaUsers, FaSignOutAlt, FaDna, FaColumns } from 'react-icons/fa';

const AdminNavbar = () => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const userData = JSON.parse(jsonPayload);
        setUserName(userData.name || 'Admin');
      } catch {
        setUserName('Admin');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.dispatchEvent(new Event('userLogout'));
  };

  return (
    <nav className="bg-white shadow-md rounded-b-lg font-sans fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/admin" className="flex-shrink-0 flex items-center">
              <FaDna className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-black">DNA Admin</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-black font-medium hover:text-blue-600 transition-colors duration-300 flex items-center"><FaHome className="mr-1" />Home</Link>
            <Link to="/admin" className="text-black font-medium hover:text-blue-600 transition-colors duration-300 flex items-center"><FaColumns className="mr-1" />Admin Page</Link>
            <Link to="/services" className="text-black font-medium hover:text-blue-600 transition-colors duration-300 flex items-center"><FaCogs className="mr-1" />Services</Link>
            <Link to="/admin/users" className="text-black font-medium hover:text-blue-600 transition-colors duration-300 flex items-center"><FaUsers className="mr-1" />User Management</Link>
            <span className="text-black font-medium">Hi, {userName}!</span>
            <button onClick={handleLogout} className="text-red-600 font-medium hover:text-red-800 transition-colors duration-300 flex items-center"><FaSignOutAlt className="mr-1" />Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 
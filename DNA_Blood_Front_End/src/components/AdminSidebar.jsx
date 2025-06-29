import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUserPlus, FaUserMd, FaCalendarAlt, FaListAlt, FaUsersCog, FaUserFriends, FaPlusCircle, FaClipboardList, FaVials, FaChartBar, FaEye, FaBoxOpen, FaTimes, FaShoppingCart } from 'react-icons/fa';

const menuItems = [
  { label: 'Dashboard', icon: <FaTachometerAlt />, to: '/admin' },
  { label: 'Register Staff', icon: <FaUserPlus />, to: '/admin/register-staff' },
  { label: 'Register Medical Staff', icon: <FaUserMd />, to: '/admin/register-medical-staff' },
  { label: 'Staff Management', icon: <FaUsersCog />, to: '/admin/staff-management' },
  { label: 'All Orders', icon: <FaShoppingCart />, to: '/admin/all-orders' },
  { label: 'Create Work Shift', icon: <FaCalendarAlt />, to: '/admin/create-workshift' },
  { label: 'Work Shift List', icon: <FaListAlt />, to: '/admin/workshift-list' },
  { label: 'Work Assignment', icon: <FaClipboardList />, to: '/admin/work-assignment' },
  { label: 'Service Management', icon: <FaBoxOpen />, to: '/admin/services' },
  { label: 'View Customer Site', icon: <FaEye />, to: '/' },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-700 to-blue-900 shadow-xl z-50 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ willChange: 'transform' }}
      >
        <button className="absolute top-4 right-4 text-white text-2xl md:hidden" onClick={onClose}>
          <FaTimes />
        </button>
        <nav className="flex flex-col py-8 space-y-2 mt-12 md:mt-0">
          {menuItems.map((item, idx) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center px-6 py-3 mx-4 rounded-lg text-white text-base font-medium transition-all duration-200 transform hover:bg-blue-600 hover:scale-105 hover:shadow-lg group ${location.pathname === item.to ? 'bg-blue-600 scale-105 shadow-lg' : ''}`}
              style={{ animation: `fadeInLeft 0.3s ${idx * 0.05 + 0.1}s both` }}
              onClick={onClose}
            >
              <span className="mr-3 text-lg group-hover:animate-bounce">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <style>{`
          @keyframes fadeInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </aside>
    </>
  );
};

export default AdminSidebar; 
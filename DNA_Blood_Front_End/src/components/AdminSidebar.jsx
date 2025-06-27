import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUserPlus, FaUserMd, FaCalendarAlt, FaListAlt, FaUsersCog, FaUserFriends, FaPlusCircle, FaClipboardList, FaVials, FaChartBar, FaEye, FaBoxOpen } from 'react-icons/fa';

const menuItems = [
  { label: 'Dashboard', icon: <FaTachometerAlt />, to: '/admin' },
  { label: 'Đăng ký tài khoản nhân viên', icon: <FaUserPlus />, to: '/admin/register-staff' },
  { label: 'Đăng ký tài khoản Medical Staff', icon: <FaUserMd />, to: '/admin/register-medical-staff' },
  { label: 'Create Work Shift', icon: <FaCalendarAlt />, to: '/admin/create-workshift' },
  { label: 'Work Shift List', icon: <FaListAlt />, to: '/admin/workshift-list' },
  { label: 'Quản lý nhân viên', icon: <FaUsersCog />, to: '/admin/staffs' },
  { label: 'Quản lý khách hàng', icon: <FaUserFriends />, to: '/admin/customers' },
  { label: 'Quản lý dịch vụ', icon: <FaBoxOpen />, to: '/admin/services' },
  { label: 'Quản lý đơn hàng', icon: <FaClipboardList />, to: '/admin/orders' },
  { label: 'Quản lý mẫu xét nghiệm', icon: <FaVials />, to: '/admin/samples' },
  { label: 'Góc nhìn người dùng', icon: <FaEye />, to: '/' },
  { label: 'Phân công công việc', icon: <FaClipboardList />, to: '/admin/work-assignment' },
];

const AdminSidebar = () => {
  const location = useLocation();
  return (
    <aside className="fixed top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-gradient-to-b from-blue-700 to-blue-900 shadow-xl z-40 transition-transform duration-300 ease-in-out hidden md:block">
      <nav className="flex flex-col py-8 space-y-2">
        {menuItems.map((item, idx) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex items-center px-6 py-3 mx-4 rounded-lg text-white text-base font-medium transition-all duration-200 transform hover:bg-blue-600 hover:scale-105 hover:shadow-lg group ${location.pathname === item.to ? 'bg-blue-600 scale-105 shadow-lg' : ''}`}
            style={{ animation: `fadeInLeft 0.3s ${idx * 0.05 + 0.1}s both` }}
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
  );
};

export default AdminSidebar; 
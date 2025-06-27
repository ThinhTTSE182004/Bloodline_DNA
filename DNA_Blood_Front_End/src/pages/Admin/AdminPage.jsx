import React from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';

const AdminPage = () => {
  return (
    <>
      <AdminNavbar />
      <AdminSidebar />
      <div className="min-h-screen bg-gray-100 py-10 px-4 pt-32 md:ml-64 transition-all duration-300">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-10">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Dashboard</h1>
          <p className="text-center text-gray-700">Chào mừng bạn đến trang quản trị!<br/>Sử dụng menu bên trái để quản lý tài khoản và các chức năng khác.</p>
        </div>
      </div>
    </>
  );
};

export default AdminPage; 
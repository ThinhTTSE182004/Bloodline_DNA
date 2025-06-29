import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';
import { motion } from 'framer-motion';

const RegisterStaff = () => {
  const [staffForm, setStaffForm] = useState({ username: '', password: '', email: '', phone: '' });
  const [staffMsg, setStaffMsg] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const role = tokenData['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        if (role !== 'Admin') {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleStaffChange = (e) => {
    setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setStaffMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://localhost:7113/api/Auth/registerForStaff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(staffForm)
      });
      if (res.ok) {
        setStaffMsg('Tạo tài khoản staff thành công!');
        setStaffForm({ username: '', password: '', email: '', phone: '' });
      } else {
        const err = await res.text();
        setStaffMsg('Lỗi: ' + err);
      }
    } catch (err) {
      setStaffMsg('Lỗi: ' + err.message);
    }
  };

  return (
    <>
      <AdminNavbar />
      <AdminSidebar />
      <div className="min-h-screen bg-gray-100 py-10 px-4 pt-32 md:ml-64 transition-all duration-300">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-10">
          <h1 className="text-2xl font-bold text-center mb-6">Tạo tài khoản Staff</h1>
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            <input name="username" value={staffForm.username} onChange={handleStaffChange} placeholder="Username" className="w-full border p-2 rounded" required />
            <input name="password" type="password" value={staffForm.password} onChange={handleStaffChange} placeholder="Password" className="w-full border p-2 rounded" required />
            <input name="email" value={staffForm.email} onChange={handleStaffChange} placeholder="Email" className="w-full border p-2 rounded" required />
            <input name="phone" value={staffForm.phone} onChange={handleStaffChange} placeholder="Phone" className="w-full border p-2 rounded" required />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Tạo Staff</button>
          </form>
          {staffMsg && <div className="mt-2 text-center text-red-600">{staffMsg}</div>}
        </div>
      </div>
    </>
  );
};

export default RegisterStaff; 
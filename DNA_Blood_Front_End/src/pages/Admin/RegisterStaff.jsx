import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { motion } from 'framer-motion';


const RegisterStaff = () => {
  const [staffForm, setStaffForm] = useState({ username: '', password: '', email: '', phone: '' });
  const [staffMsg, setStaffMsg] = useState('');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  React.useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
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
    
    const password = staffForm.password;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      setPasswordError(true);
      setStaffMsg('Password must be at least 8 characters, include uppercase, lowercase, and a number.');
      return;
    }
    setPasswordError(false);
    

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('/api/Auth/registerForStaff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(staffForm)
      });
      if (res.ok) {
        setStaffMsg('Staff account created successfully!');
        setStaffForm({ username: '', password: '', email: '', phone: '' });
      } else {
        const err = await res.text();
        setStaffMsg('Error: ' + err);
      }
    } catch (err) {
      setStaffMsg('Error: ' + err.message);
    }
  };

  return (
    <>
      <AdminNavbar onSidebarToggle={() => setSidebarOpen(true)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen bg-gray-100 py-10 px-4 pt-32 transition-all duration-300">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0 }}
            className="text-2xl font-bold text-center mb-6">
            Create Staff Account
          </motion.h1>
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative">
              {staffForm.password === '' && (
              <span className="absolute left-[10px] top-[13px] text-red-500 pointer-events-none">*</span>
              )}
            <input 
              name="username" 
              value={staffForm.username} 
              onChange={handleStaffChange} 
              placeholder="Username" 
              className="w-full border p-2 rounded pl-5" 
              required />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.33 }}
              className="relative">
              {staffForm.password === '' && (
                <span className="absolute left-[10px] top-[13px] text-red-500 pointer-events-none">*</span>
              )}
            <input 
              name="password" 
              type="password" 
              value={staffForm.password} 
              onChange={handleStaffChange} 
              placeholder="Password" 
              className={`w-full border p-2 rounded pl-5 ${passwordError ? 'border-red-500' : ''}`} 
              required />
              <p className="text-sm text-gray-500">
                Password must be at least 8 characters, include uppercase, lowercase, and a number.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative">
              {staffForm.password === '' && (
              <span className="absolute left-[10px] top-[13px] text-red-500 pointer-events-none">*</span>
              )}
            <input 
              name="email" 
              value={staffForm.email} 
              onChange={handleStaffChange} 
              placeholder="Email" 
              className="w-full border p-2 rounded pl-5" 
              required />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative">
              {staffForm.password === '' && (
              <span className="absolute left-[10px] top-[13px] text-red-500 pointer-events-none">*</span>
              )}
            <input 
              name="phone" 
              value={staffForm.phone} 
              onChange={handleStaffChange} 
              placeholder="Phone" 
              className="w-full border p-2 rounded pl-5" 
              required />
            </motion.div>
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Create Staff
            </motion.button>
          </form>
          {staffMsg && <div className="mt-2 text-center text-red-600">{staffMsg}</div>}
        </div>
      </div>
    </>
  );
};

export default RegisterStaff; 
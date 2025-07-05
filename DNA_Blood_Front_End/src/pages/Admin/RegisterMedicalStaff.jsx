import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';
import { motion } from 'framer-motion';

const RegisterMedicalStaff = () => {
  const [medicalForm, setMedicalForm] = useState({ username: '', password: '', email: '', phone: '', yoe: '', specialization: '' });
  const [medicalMsg, setMedicalMsg] = useState('');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleMedicalChange = (e) => {
    setMedicalForm({ ...medicalForm, [e.target.name]: e.target.value });
  };

  const handleMedicalSubmit = async (e) => {
    e.preventDefault();
    setMedicalMsg('');
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('https://localhost:7113/api/Auth/registerForMedicalStaff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...medicalForm, yoe: Number(medicalForm.yoe) })
      });
      if (res.ok) {
        setMedicalMsg('Medical staff account created successfully!');
        setMedicalForm({ username: '', password: '', email: '', phone: '', yoe: '', specialization: '' });
      } else {
        const err = await res.text();
        setMedicalMsg('Error: ' + err);
      }
    } catch (err) {
      setMedicalMsg('Error: ' + err.message);
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
            Create Medical Staff Account
          </motion.h1>
          <form onSubmit={handleMedicalSubmit} className="space-y-4">
            <motion.input 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              name="username" 
              value={medicalForm.username} 
              onChange={handleMedicalChange} 
              placeholder="Username" 
              className="w-full border p-2 rounded" 
              required />
            <motion.input 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              name="password" 
              type="password" 
              value={medicalForm.password} 
              onChange={handleMedicalChange} 
              placeholder="Password" 
              className="w-full border p-2 rounded" 
              required />
            <motion.input 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              name="email" 
              value={medicalForm.email} 
              onChange={handleMedicalChange} 
              placeholder="Email" 
              className="w-full border p-2 rounded" 
              required />
            <motion.input 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              name="phone" 
              value={medicalForm.phone} 
              onChange={handleMedicalChange} 
              placeholder="Phone" 
              className="w-full border p-2 rounded" 
              required />
            <motion.input 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              name="yoe" 
              type="number" 
              value={medicalForm.yoe} 
              onChange={handleMedicalChange} 
              placeholder="Years of Experience" 
              className="w-full border p-2 rounded" 
              required />
            <motion.input 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              name="specialization" 
              value={medicalForm.specialization} 
              onChange={handleMedicalChange} 
              placeholder="Specialization" 
              className="w-full border p-2 rounded" 
              required />
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              type="submit" 
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Create Medical Staff
            </motion.button>
          </form>
          {medicalMsg && <div className="mt-2 text-center text-red-600">{medicalMsg}</div>}
        </div>
      </div>
    </>
  );
};

export default RegisterMedicalStaff; 
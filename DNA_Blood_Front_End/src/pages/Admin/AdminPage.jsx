import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';

const AdminPage = () => {
  const [staffForm, setStaffForm] = useState({ username: '', password: '', email: '', phone: '' });
  const [medicalForm, setMedicalForm] = useState({ username: '', password: '', email: '', phone: '', yoe: '', specialization: '' });
  const [staffMsg, setStaffMsg] = useState('');
  const [medicalMsg, setMedicalMsg] = useState('');
  const navigate = useNavigate();

  // Check role
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
  const handleMedicalChange = (e) => {
    setMedicalForm({ ...medicalForm, [e.target.name]: e.target.value });
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

  const handleMedicalSubmit = async (e) => {
    e.preventDefault();
    setMedicalMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://localhost:7113/api/Auth/registerForMedicalStaff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...medicalForm, yoe: Number(medicalForm.yoe) })
      });
      if (res.ok) {
        setMedicalMsg('Tạo tài khoản medical staff thành công!');
        setMedicalForm({ username: '', password: '', email: '', phone: '', yoe: '', specialization: '' });
      } else {
        const err = await res.text();
        setMedicalMsg('Lỗi: ' + err);
      }
    } catch (err) {
      setMedicalMsg('Lỗi: ' + err.message);
    }
  };

  return (
    <>
      <AdminNavbar />
      <AdminSidebar />
      <div className="min-h-screen bg-gray-100 py-10 px-4 pt-32 md:ml-64 transition-all duration-300">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-10">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Page</h1>
          <div>
            <h2 className="text-xl font-semibold mb-4">Tạo tài khoản Staff</h2>
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <input name="username" value={staffForm.username} onChange={handleStaffChange} placeholder="Username" className="w-full border p-2 rounded" required />
              <input name="password" type="password" value={staffForm.password} onChange={handleStaffChange} placeholder="Password" className="w-full border p-2 rounded" required />
              <input name="email" value={staffForm.email} onChange={handleStaffChange} placeholder="Email" className="w-full border p-2 rounded" required />
              <input name="phone" value={staffForm.phone} onChange={handleStaffChange} placeholder="Phone" className="w-full border p-2 rounded" required />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Tạo Staff</button>
            </form>
            {staffMsg && <div className="mt-2 text-center text-red-600">{staffMsg}</div>}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Tạo tài khoản Medical Staff</h2>
            <form onSubmit={handleMedicalSubmit} className="space-y-4">
              <input name="username" value={medicalForm.username} onChange={handleMedicalChange} placeholder="Username" className="w-full border p-2 rounded" required />
              <input name="password" type="password" value={medicalForm.password} onChange={handleMedicalChange} placeholder="Password" className="w-full border p-2 rounded" required />
              <input name="email" value={medicalForm.email} onChange={handleMedicalChange} placeholder="Email" className="w-full border p-2 rounded" required />
              <input name="phone" value={medicalForm.phone} onChange={handleMedicalChange} placeholder="Phone" className="w-full border p-2 rounded" required />
              <input name="yoe" type="number" value={medicalForm.yoe} onChange={handleMedicalChange} placeholder="Years of Experience" className="w-full border p-2 rounded" required />
              <input name="specialization" value={medicalForm.specialization} onChange={handleMedicalChange} placeholder="Specialization" className="w-full border p-2 rounded" required />
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Tạo Medical Staff</button>
            </form>
            {medicalMsg && <div className="mt-2 text-center text-red-600">{medicalMsg}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage; 
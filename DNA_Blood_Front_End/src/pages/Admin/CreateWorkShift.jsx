import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';
import { motion } from 'framer-motion';

const shiftOptions = [
  {
    value: 'morning',
    label: 'Morning',
    startTime: '08:00',
    endTime: '12:00',
    description: 'Morning shift (08:00 - 12:00)'
  },
  {
    value: 'afternoon',
    label: 'Afternoon',
    startTime: '13:00',
    endTime: '17:00',
    description: 'Afternoon shift (13:00 - 17:00)'
  },
  {
    value: 'other',
    label: 'Other',
    startTime: '',
    endTime: '',
    description: ''
  }
];

const CreateWorkShift = () => {
  const [shiftName, setShiftName] = useState('morning');
  const [customShiftName, setCustomShiftName] = useState('');
  const [startTime, setStartTime] = useState(shiftOptions[0].startTime);
  const [endTime, setEndTime] = useState(shiftOptions[0].endTime);
  const [description, setDescription] = useState(shiftOptions[0].description);
  const [msg, setMsg] = useState('');
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

  React.useEffect(() => {
    if (shiftName === 'morning' || shiftName === 'afternoon') {
      const selected = shiftOptions.find(opt => opt.value === shiftName);
      setStartTime(selected.startTime);
      setEndTime(selected.endTime);
      setDescription(selected.description);
      setCustomShiftName('');
    } else if (shiftName === 'other') {
      setStartTime('');
      setEndTime('');
      setDescription('');
    }
  }, [shiftName]);

  const handleShiftChange = (e) => {
    setShiftName(e.target.value);
  };

  const handleCustomShiftNameChange = (e) => {
    setCustomShiftName(e.target.value);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    let finalShiftName = shiftName === 'other' ? customShiftName : shiftName.charAt(0).toUpperCase() + shiftName.slice(1);
    if (!finalShiftName) {
      setMsg('Please enter a shift name.');
      return;
    }
    if (!startTime || !endTime) {
      setMsg('Please select start and end time.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://localhost:7113/api/WorkShift/CreateWorkShift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shiftName: finalShiftName,
          startTime,
          endTime,
          description
        })
      });
      if (res.ok) {
        setMsg('Work shift created successfully!');
      } else {
        const err = await res.text();
        setMsg('Error: ' + err);
      }
    } catch (err) {
      setMsg('Error: ' + err.message);
    }
  };

  return (
    <>
      <AdminNavbar />
      <AdminSidebar />
      <div className="min-h-screen bg-gray-100 py-10 px-4 pt-32 md:ml-64 transition-all duration-300">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-10">
          <h1 className="text-2xl font-bold text-center mb-6">Create Work Shift</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Shift Name</label>
              <select name="shiftName" value={shiftName} onChange={handleShiftChange} className="w-full border p-2 rounded" required>
                {shiftOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {shiftName === 'other' && (
                <input
                  type="text"
                  name="customShiftName"
                  value={customShiftName}
                  onChange={handleCustomShiftNameChange}
                  placeholder="Enter custom shift name"
                  className="w-full border p-2 rounded mt-2"
                  required
                />
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">Start Time</label>
              <input
                name="startTime"
                type="time"
                value={startTime}
                onChange={handleStartTimeChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Time</label>
              <input
                name="endTime"
                type="time"
                value={endTime}
                onChange={handleEndTimeChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea name="description" value={description} onChange={handleDescriptionChange} className="w-full border p-2 rounded" rows={2} />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Create Shift</button>
          </form>
          {msg && <div className="mt-2 text-center text-red-600">{msg}</div>}
        </div>
      </div>
    </>
  );
};

export default CreateWorkShift; 
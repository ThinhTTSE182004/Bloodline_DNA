import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';
import { FaBars } from 'react-icons/fa';
import { motion } from 'framer-motion';

const WorkShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ shiftId: '', shiftName: '', startTime: '', endTime: '', description: '' });
  const [modalMsg, setModalMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, shiftId: null });
  const navigate = useNavigate();

  useEffect(() => {
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

  const fetchShifts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://localhost:7113/api/WorkShift/WorkShift', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setShifts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch work shifts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const openUpdateModal = (shift) => {
    setModalData({
      shiftId: shift.shiftId,
      shiftName: shift.shiftName,
      startTime: shift.startTime.slice(0,5),
      endTime: shift.endTime.slice(0,5),
      description: shift.description || ''
    });
    setModalMsg('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMsg('');
  };

  const handleModalChange = (e) => {
    setModalData({ ...modalData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setModalMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://localhost:7113/api/WorkShift/UpdateWorkShift?id=${modalData.shiftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shiftName: modalData.shiftName,
          startTime: modalData.startTime,
          endTime: modalData.endTime,
          description: modalData.description
        })
      });
      if (res.ok) {
        setModalMsg('Update successful!');
        await fetchShifts();
        setTimeout(() => closeModal(), 1000);
      } else {
        const err = await res.text();
        setModalMsg('Error: ' + err);
      }
    } catch (err) {
      setModalMsg('Error: ' + err.message);
    }
  };

  const handleDelete = async (shiftId) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://localhost:7113/api/WorkShift/DeleteWorkShift?id=${shiftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await fetchShifts();
        setDeleteConfirm({ show: false, shiftId: null });
      } else {
        const err = await res.text();
        setError('Delete failed: ' + err);
      }
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  return (
    <>
      <AdminNavbar />
      <AdminSidebar />
      <div className="min-h-screen bg-gray-100 py-10 px-4 pt-32 md:ml-64 transition-all duration-300">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Work Shift List</h1>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">#</th>
                    <th className="px-4 py-2 border">Shift Name</th>
                    <th className="px-4 py-2 border">Start Time</th>
                    <th className="px-4 py-2 border">End Time</th>
                    <th className="px-4 py-2 border">Description</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift, idx) => (
                    <tr key={shift.shiftId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">{idx + 1}</td>
                      <td className="px-4 py-2 border">{shift.shiftName}</td>
                      <td className="px-4 py-2 border">{shift.startTime}</td>
                      <td className="px-4 py-2 border">{shift.endTime}</td>
                      <td className="px-4 py-2 border">{shift.description}</td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition mr-2"
                          onClick={() => openUpdateModal(shift)}
                        >
                          Update
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          onClick={() => setDeleteConfirm({ show: true, shiftId: shift.shiftId })}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {shifts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">No work shifts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Update Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={closeModal}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-center">Update Work Shift</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Shift Name</label>
                <input
                  name="shiftName"
                  value={modalData.shiftName}
                  onChange={handleModalChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Start Time</label>
                <input
                  name="startTime"
                  type="time"
                  value={modalData.startTime}
                  onChange={handleModalChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">End Time</label>
                <input
                  name="endTime"
                  type="time"
                  value={modalData.endTime}
                  onChange={handleModalChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={modalData.description}
                  onChange={handleModalChange}
                  className="w-full border p-2 rounded"
                  rows={2}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Update</button>
            </form>
            {modalMsg && <div className="mt-2 text-center text-red-600">{modalMsg}</div>}
          </div>
        </div>
      )}
      {/* Delete Confirm Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <h2 className="text-xl font-bold mb-4 text-center text-red-700">Delete Work Shift</h2>
            <p className="mb-6 text-center">Are you sure you want to delete this work shift?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setDeleteConfirm({ show: false, shiftId: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => handleDelete(deleteConfirm.shiftId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkShiftList; 
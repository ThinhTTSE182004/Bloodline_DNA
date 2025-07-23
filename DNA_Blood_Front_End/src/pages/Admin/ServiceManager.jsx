import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { motion } from 'framer-motion';

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState({ show: false, id: null });
  const [showUpdate, setShowUpdate] = useState({ show: false, data: null });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({ serviceName: '', category: '', description: '', duration: 0, processingTimeMinutes: 0, price: 0 });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('/api/Service/GetAllServiceWithPrice', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error(await res.text());
      setServices(await res.json());
    } catch (err) {
      setError('Error loading services: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    setError('');
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`/api/Service/DeleteServicePackage?id=${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error(await res.text());
      setShowDelete({ show: false, id: null });
      fetchServices();
    } catch (err) {
      setError('Error deleting service: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!showUpdate.data) return;
    setUpdateLoading(true);
    setUpdateError('');
    const { servicePackageId, serviceName, category, description, duration, processingTimeMinutes, price } = showUpdate.data;
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    try {
      await Promise.all([
        fetch(`/api/ServicePackage/UpdateServicePackage?id=${servicePackageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({ serviceName, category, description, duration, processingTimeMinutes })
        }),
        fetch(`/api/ServicePackage/UpdatePrice?servicePackageId=${servicePackageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({ price })
        })
      ]);
      setShowUpdate({ show: false, data: null });
      fetchServices();
    } catch (err) {
      setUpdateError('Error updating: ' + err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreateLoading(true);
    setCreateError('');
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    try {
      const res = await fetch('/api/ServicePackage/CreateServicePackage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify(createData)
      });
      if (!res.ok) throw new Error(await res.text());
      setShowCreate(false);
      setCreateData({ serviceName: '', category: '', description: '', duration: 0, processingTimeMinutes: 0, price: 0 });
      fetchServices();
    } catch (err) {
      setCreateError('Error creating service: ' + err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar onSidebarToggle={() => setSidebarOpen(true)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen bg-gray-100 py-10 px-4 pt-32 transition-all duration-300">
        <div className="max-w-7xl w-full mx-auto bg-white shadow-lg rounded-lg p-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0 }}
            className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-green-700">Service Management</h1>
            <button className="px-4 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700 transition" onClick={() => setShowCreate(true)}>Create</button>
          </motion.div>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading services...</div>
          ) : (
            <div className="overflow-x-auto">
              <motion.table 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-green-50">
                    <th className="px-4 py-2 border">Service Name</th>
                    <th className="px-4 py-2 border">Category</th>
                    <th className="px-4 py-2 border">Description</th>
                    <th className="px-4 py-2 border">Price (VND)</th>
                    <th className="px-4 py-2 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s.servicePackageId} className="hover:bg-green-50">
                      <td className="px-4 py-2 border font-semibold text-gray-800">{s.serviceName}</td>
                      <td className="px-4 py-2 border">{s.category}</td>
                      <td className="px-4 py-2 border text-sm text-gray-600">{s.description}</td>
                      <td className="px-4 py-2 border text-right text-blue-700 font-bold">{s.price.toLocaleString()}</td>
                      <td className="px-4 py-2 border text-center">
                        <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition mr-2 font-semibold" onClick={() => setShowUpdate({ show: true, data: { ...s } })}>Update</button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold" onClick={() => setShowDelete({ show: true, id: s.servicePackageId })}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-4 text-gray-400">No services available.</td></tr>
                  )}
                </tbody>
              </motion.table>
            </div>
          )}
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {showDelete.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <h2 className="text-xl font-bold mb-4 text-center text-red-700">Delete Service</h2>
            <p className="mb-6 text-center">Are you sure you want to delete this service?</p>
            <div className="flex justify-center gap-4">
              <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowDelete({ show: false, id: null })}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => handleDelete(showDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Update Modal */}
      {showUpdate.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700" onClick={() => setShowUpdate({ show: false, data: null })}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-center text-yellow-700">Update Service</h2>
            {updateError && <div className="text-red-600 mb-2 text-center">{updateError}</div>}
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Service Name</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={showUpdate.data.serviceName} onChange={e => setShowUpdate(u => ({ ...u, data: { ...u.data, serviceName: e.target.value } }))} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={showUpdate.data.category} onChange={e => setShowUpdate(u => ({ ...u, data: { ...u.data, category: e.target.value } }))} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea className="w-full border rounded px-3 py-2" value={showUpdate.data.description} onChange={e => setShowUpdate(u => ({ ...u, data: { ...u.data, description: e.target.value } }))} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Duration (minutes)</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={showUpdate.data.duration} onChange={e => setShowUpdate(u => ({ ...u, data: { ...u.data, duration: Number(e.target.value) } }))} />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Processing Time (minutes)</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={showUpdate.data.processingTimeMinutes} onChange={e => setShowUpdate(u => ({ ...u, data: { ...u.data, processingTimeMinutes: Number(e.target.value) } }))} />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Price (VND)</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={showUpdate.data.price} onChange={e => setShowUpdate(u => ({ ...u, data: { ...u.data, price: Number(e.target.value) } }))} />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowUpdate({ show: false, data: null })}>Cancel</button>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-bold min-w-[100px]" onClick={handleUpdate} disabled={updateLoading}>{updateLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700" onClick={() => setShowCreate(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-center text-blue-700">Create New Service</h2>
            {createError && <div className="text-red-600 mb-2 text-center">{createError}</div>}
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Service Name</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={createData.serviceName} onChange={e => setCreateData(d => ({ ...d, serviceName: e.target.value }))} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={createData.category} onChange={e => setCreateData(d => ({ ...d, category: e.target.value }))} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea className="w-full border rounded px-3 py-2" value={createData.description} onChange={e => setCreateData(d => ({ ...d, description: e.target.value }))} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Duration (minutes)</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={createData.duration} onChange={e => setCreateData(d => ({ ...d, duration: Number(e.target.value) }))} />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Processing Time (minutes)</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={createData.processingTimeMinutes} onChange={e => setCreateData(d => ({ ...d, processingTimeMinutes: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Price (VND)</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={createData.price} onChange={e => setCreateData(d => ({ ...d, price: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold min-w-[100px]" onClick={handleCreate} disabled={createLoading}>{createLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceManager; 
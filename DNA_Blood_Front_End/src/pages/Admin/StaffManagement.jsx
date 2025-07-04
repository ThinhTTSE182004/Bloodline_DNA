import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { FaUsers, FaUserMd, FaUserTie, FaChartBar, FaSearch, FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StaffManagement = () => {
  const [medicalStaffs, setMedicalStaffs] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
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

  useEffect(() => {
    const fetchStaffData = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      try {
        // Fetch Medical Staffs
        const medRes = await fetch('https://localhost:7113/api/ShiftAssignment/medical-staffs', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const medData = medRes.ok ? await medRes.json() : [];
        setMedicalStaffs(Array.isArray(medData) ? medData : []);

        // Fetch Staffs
        const staffRes = await fetch('https://localhost:7113/api/ShiftAssignment/staffs', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const staffData = staffRes.ok ? await staffRes.json() : [];
        setStaffs(Array.isArray(staffData) ? staffData : []);
      } catch (err) {
        setError('Failed to fetch staff data: ' + err.message);
        setMedicalStaffs([]);
        setStaffs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  // Calculate statistics
  const totalMedicalStaff = medicalStaffs.length;
  const totalStaff = staffs.length;
  const totalEmployees = totalMedicalStaff + totalStaff;
  
  // Calculate average experience for medical staff (using yearsOfExperience field)
  const avgExperience = medicalStaffs.length > 0 
    ? medicalStaffs.reduce((sum, staff) => sum + (staff.yearsOfExperience || 0), 0) / medicalStaffs.length 
    : 0;

  // Chart data
  const roleDistributionData = [
    { name: 'Medical Staff', value: totalMedicalStaff, color: '#10B981' },
    { name: 'Regular Staff', value: totalStaff, color: '#3B82F6' }
  ];

  const experienceData = [
    { range: '0-2 years', count: medicalStaffs.filter(s => (s.yearsOfExperience || 0) <= 2).length },
    { range: '3-5 years', count: medicalStaffs.filter(s => (s.yearsOfExperience || 0) >= 3 && (s.yearsOfExperience || 0) <= 5).length },
    { range: '6-10 years', count: medicalStaffs.filter(s => (s.yearsOfExperience || 0) >= 6 && (s.yearsOfExperience || 0) <= 10).length },
    { range: '10+ years', count: medicalStaffs.filter(s => (s.yearsOfExperience || 0) > 10).length }
  ];

  // Filter and search functionality
  const filteredMedicalStaffs = medicalStaffs.filter(staff => {
    const matchesSearch = staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.userId?.toString().includes(searchTerm);
    const matchesFilter = filterRole === 'all' || filterRole === 'medical';
    return matchesSearch && matchesFilter;
  });

  const filteredStaffs = staffs.filter(staff => {
    const matchesSearch = staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.userId?.toString().includes(searchTerm);
    const matchesFilter = filterRole === 'all' || filterRole === 'staff';
    return matchesSearch && matchesFilter;
  });

  const allStaff = [...filteredMedicalStaffs, ...filteredStaffs];

  if (loading) {
    return (
      <>
        <AdminNavbar onSidebarToggle={() => setSidebarOpen(true)} />
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-h-screen bg-gray-100 py-10 px-4 pt-32 transition-all duration-300">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading staff data...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar onSidebarToggle={() => setSidebarOpen(true)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen bg-gray-100 py-10 px-4 pt-32 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0 }}
            className="mb-8">
            <h1 className="flex justify-center text-3xl font-bold text-gray-900 mb-2 hover:text-blue-500 transition-all duration-300">Staff Management</h1>
            <p className="flex justify-center text-gray-600">Comprehensive overview of all employees and their statistics</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-2xl hover:bg-blue-50 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <FaUsers className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-2xl hover:bg-green-50 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <FaUserMd className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Medical Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{totalMedicalStaff}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-2xl hover:bg-purple-50 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <FaUserTie className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Regular Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-2xl hover:bg-orange-50 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <FaChartBar className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Experience</p>
                  <p className="text-2xl font-bold text-gray-900">{avgExperience.toFixed(1)}y</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Role Distribution Pie Chart */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 hover:text-blue-500 transition-all duration-300">Role Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Experience Distribution Bar Chart */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 hover:text-blue-500 transition-all duration-300">Medical Staff Experience Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={experienceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <motion.div 
            initial={{ opacity: 0, y: 40}}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8}}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative group">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-all duration-300" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400 hover:text-blue-500 transition-all duration-300" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="medical">Medical Staff</option>
                  <option value="staff">Regular Staff</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Staff List */}
          <motion.div 
            initial={{ opacity: 0, y: 40}}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8}}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-500 transition-all duration-300">Employee List</h3>
              <p className="text-sm text-gray-600">Showing {allStaff.length} of {totalEmployees} employees</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allStaff.map((staff) => (
                    <tr key={staff.userId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {staff.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                            <div className="text-sm text-gray-500">ID: {staff.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          staff.roleId === 4 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {staff.roleId === 4 ? 'Medical Staff' : 'Regular Staff'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {staff.yearsOfExperience ? `${staff.yearsOfExperience} years` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {allStaff.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No employees found matching your criteria.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default StaffManagement; 
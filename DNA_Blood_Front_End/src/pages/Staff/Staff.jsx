import React, { useState, useEffect } from 'react';
import StaffNavbar from '../../components/StaffNavbar';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaEdit, FaSpinner, FaExclamationTriangle, FaChartPie, FaTags, FaShippingFast, FaCheckCircle } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import StaffFeedback from './StaffFeedback';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Staff = () => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [sampleData, setSampleData] = useState({
    sampleStatus: '',
    note: ''
  });
  const [sampleTransfers, setSampleTransfers] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchAPI = async (url) => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          throw new Error('No token found');
        }
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch from ${url}`);
        }
        return await response.json();
      };

      const [ordersData, samplesData, transfersData] = await Promise.all([
        fetchAPI('https://localhost:7113/api/Staff/assigned-order-details'),
        fetchAPI('https://localhost:7113/api/Staff/get-sample-by-staffId'),
        fetchAPI('https://localhost:7113/api/Staff/get-sample-transfers-by-staffId')
      ]);

      setAssignedOrders(ordersData);
      setSamples(samplesData);
      setSampleTransfers(transfersData);

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const calculateStats = () => {
    return {
      totalAssignedOrders: assignedOrders.length,
      totalSamples: samples.length,
      pendingSamples: samples.filter(s => s.sampleStatus === 'Pending').length,
      completedSamples: samples.filter(s => s.sampleStatus === 'Completed' || s.sampleStatus === 'Done').length,
    };
  };

  const handleUpdateSample = async (sampleId) => {
    setUpdateError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      if (!sampleData.sampleStatus) {
        setUpdateError('Sample status is required');
        return;
      }
      const response = await fetch(`https://localhost:7113/api/Staff/update-sample/${sampleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update sample');
      }
      setShowUpdateModal(false);
      await fetchData(); // Refresh data
    } catch (err) {
      setUpdateError(err.message || 'An error occurred while updating the sample');
    }
  };

  const openUpdateModal = (sample) => {
    if (!sample) {
      setUpdateError('Invalid sample');
      return;
    }
    setSelectedSample(sample);
    setUpdateError(null);
    setSampleData({
      sampleStatus: sample.sampleStatus || '',
      note: sample.note || ''
    });
    setShowUpdateModal(true);
  };
  
  const getChartData = () => {
    const statusCounts = samples.reduce((acc, sample) => {
        const status = sample.sampleStatus || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return {
        labels: Object.keys(statusCounts),
        datasets: [{
            label: 'Sample Status',
            data: Object.values(statusCounts),
            backgroundColor: [
                'rgba(255, 206, 86, 0.7)', // Yellow for Pending
                'rgba(75, 192, 192, 0.7)',  // Green for Collected
                'rgba(54, 162, 235, 0.7)',  // Blue for Processing
                'rgba(153, 102, 255, 0.7)', // Purple for Completed/Done
                'rgba(201, 203, 207, 0.7)'  // Grey for Unknown
            ],
            borderColor: [
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(201, 203, 207, 1)'
            ],
            borderWidth: 1,
        }]
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <StaffNavbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  const stats = calculateStats();
  const chartData = getChartData();

  const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-white shadow-lg rounded-lg p-6 flex items-center space-x-4 transform transition-all duration-300 hover:scale-105 ${color} hover:bg-blue-50 group`}>
        {icon}
        <div>
            <p className="text-sm font-medium text-gray-500 cursor-default group-hover:text-gray-800">{title}</p>
            <p className="text-2xl font-bold text-gray-900 cursor-default">{value}</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <StaffNavbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb- cursor-default">Staff Dashboard</h1>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<FaClipboardList className="w-8 h-8 text-blue-500"/>} title="Total Assigned Orders" value={stats.totalAssignedOrders} color="border-l-4 border-blue-500" />
            <StatCard icon={<FaTags className="w-8 h-8 text-green-500"/>} title="Total Samples" value={stats.totalSamples} color="border-l-4 border-green-500" />
            <StatCard icon={<FaShippingFast className="w-8 h-8 text-yellow-500"/>} title="Pending Samples" value={stats.pendingSamples} color="border-l-4 border-yellow-500" />
            <StatCard icon={<FaCheckCircle className="w-8 h-8 text-purple-500"/>} title="Completed Samples" value={stats.completedSamples} color="border-l-4 border-purple-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-1 bg-white shadow-lg rounded-lg p-6 cursor-default group">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center group-hover:text-black"><FaChartPie className="mr-2 text-gray-600 group-hover:text-gray-800"/>Sample Status Distribution</h2>
              <div className="h-80 flex items-center justify-center">
                 <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Sample Status' } } }} />
              </div>
            </div>

            {/* Recent Samples Table */}
            <div className="lg:col-span-2 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FaClipboardList className="mr-2" />
                  Sample Management
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {samples.slice(0, 5).map((sample) => (
                      <tr key={sample.sampleId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{sample.sampleId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.sampleTypeName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sample.sampleStatus === 'Collected' ? 'bg-green-100 text-green-800' :
                            sample.sampleStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            sample.sampleStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sample.sampleStatus || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openUpdateModal(sample)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <FaEdit className="mr-1" /> Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Update Sample Modal */}
      {showUpdateModal && selectedSample && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Update Sample #{selectedSample.sampleId}</h3>
            {updateError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold"><FaExclamationTriangle className="inline-block mr-2" />Error: </strong>
                <span className="block sm:inline">{updateError}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Sample Status <span className="text-red-500">*</span></label>
                <select
                  value={sampleData.sampleStatus}
                  onChange={(e) => setSampleData({ ...sampleData, sampleStatus: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Collected">Collected</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Note</label>
                <textarea
                  value={sampleData.note}
                  onChange={(e) => setSampleData({ ...sampleData, note: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  rows="3"
                  placeholder="Enter notes..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowUpdateModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={() => handleUpdateSample(selectedSample.sampleId)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
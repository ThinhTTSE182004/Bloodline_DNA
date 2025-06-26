import React, { useState, useEffect } from 'react';
import MedicalStaffNavbar from '../../components/MedicalStaffNavbar';
import { useNavigate } from 'react-router-dom';
import { FaChartPie, FaTags, FaCheckCircle, FaSpinner, FaVials } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const MedicalStaff = () => {
  const [samples, setSamples] = useState([]);
  const [sampleTransfers, setSampleTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchAPI = async (url) => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          throw new Error('Unauthorized');
        }
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch from ${url}`);
        }
        return response.json();
      };

      const [samplesData, transfersData] = await Promise.all([
        fetchAPI('https://localhost:7113/api/MedicalStaff/get-sample-by-medicalStaffId'),
        fetchAPI('https://localhost:7113/api/MedicalStaff/get-sample-transfers-by-medicalStaffId')
      ]);

      setSamples(samplesData);
      setSampleTransfers(transfersData);

    } catch (err) {
      if (err.message !== 'Unauthorized') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const calculateStats = () => {
    return {
      totalSamples: samples.length,
      processingSamples: samples.filter(s => s.sampleStatus === 'Processing').length,
      completedSamples: samples.filter(s => s.sampleStatus === 'Completed').length,
      receivedTransfers: sampleTransfers.filter(t => t.sampleTransferStatus === 'Received').length,
    };
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
          'rgba(54, 162, 235, 0.7)',  // Blue for Processing
          'rgba(75, 192, 192, 0.7)',  // Green for Completed
          'rgba(255, 206, 86, 0.7)', // Yellow for others
          'rgba(201, 203, 207, 0.7)'  // Grey for Unknown
        ],
        borderWidth: 1,
      }]
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100"><MedicalStaffNavbar /><div className="flex justify-center items-center h-screen"><FaSpinner className="w-12 h-12 text-teal-600 animate-spin" /></div></div>
    );
  }

  const stats = calculateStats();
  const chartData = getChartData();

  const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-white shadow-lg rounded-lg p-6 flex items-center space-x-4 transform transition-all duration-300 hover:scale-105 ${color}`}>
      {icon}
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <MedicalStaffNavbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center text-3xl font-bold text-gray-800 mb-8 cursor-default">
            Medical Staff Dashboard
          </motion.h1>
          {error && <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4"><p className="text-sm text-red-700">{error}</p></div>}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay:0}}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<FaTags className="w-8 h-8 text-yellow-500" />} title="Total Samples Assigned" value={stats.totalSamples} color="border-l-4 border-yellow-500" />
            <StatCard icon={<FaVials className="w-8 h-8 text-blue-500" />} title="Processing Samples" value={stats.processingSamples} color="border-l-4 border-blue-500" />
            <StatCard icon={<FaCheckCircle className="w-8 h-8 text-green-500" />} title="Completed Samples" value={stats.completedSamples} color="border-l-4 border-green-500" />
            <StatCard icon={<FaCheckCircle className="w-8 h-8 text-indigo-500" />} title="Transfers Received" value={stats.receivedTransfers} color="border-l-4 border-indigo-500" />
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay:0.2}}
              className="lg:col-span-1 bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center cursor-default"><FaChartPie className="mr-2 text-gray-600" />Sample Status Distribution</h2>
              <div className="h-80 flex items-center justify-center">
                <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay:0.4}}
              className="lg:col-span-2 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-teal-600 to-teal-700">
                <h2 className="text-xl font-bold text-white cursor-default">Recent Samples</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {samples.slice(0, 5).map((sample) => (
                      <tr key={sample.sampleId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{sample.sampleId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.sampleTypeName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${sample.sampleStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                              sample.sampleStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {sample.sampleStatus || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicalStaff; 
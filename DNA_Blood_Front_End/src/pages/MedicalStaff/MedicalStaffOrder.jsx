import React, { useState, useEffect } from 'react';
import MedicalStaffNavbar from '../../components/MedicalStaffNavbar';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaSpinner, FaExclamationTriangle, FaCheck, FaFlask, FaCheckCircle, FaPlusCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MedicalStaffOrder = () => {
  const [samples, setSamples] = useState([]);
  const [sampleTransfers, setSampleTransfers] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmActionDetails, setConfirmActionDetails] = useState({ action: null, id: null, actionText: '' });
  
  // State for Add Result Modal
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [currentOrderDetailId, setCurrentOrderDetailId] = useState(null);
  const [resultData, setResultData] = useState({
    testSummary: '',
    rawDataPath: '',
    reportUrl: '',
    resultStatus: ''
  });
  const [resultError, setResultError] = useState('');

  // 1. State cho filter
  const [transferStatusFilter, setTransferStatusFilter] = useState('all');
  const [sampleTypeFilter, setSampleTypeFilter] = useState('all');
  const [sampleStatusFilter, setSampleStatusFilter] = useState('all');
  const [orderServiceFilter, setOrderServiceFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const navigate = useNavigate();

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    setActionError('');
    try {
      const fetchAPI = async (url) => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          throw new Error('Unauthorized');
        }
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          if (response.status === 401) navigate('/login');
          throw new Error(`API call failed for ${url}`);
        }
        return response.json();
      };

      const [samplesData, transfersData, ordersData] = await Promise.all([
        fetchAPI('https://localhost:7113/api/MedicalStaff/get-sample-by-medicalStaffId'),
        fetchAPI('https://localhost:7113/api/MedicalStaff/get-sample-transfers-by-medicalStaffId'),
        fetchAPI('https://localhost:7113/api/MedicalStaff/order-details')
      ]);

      setSamples(samplesData);
      setSampleTransfers(transfersData);
      setOrderDetails(ordersData);

    } catch (err) {
      if (err.message !== 'Unauthorized') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [navigate]);

  const handleAction = (action, id, actionText) => {
    setActionError('');
    setConfirmActionDetails({ action, id, actionText });
    setShowConfirmModal(true);
  };

  const executeConfirmedAction = async () => {
    const { action, id } = confirmActionDetails;
    if (!action || !id) return;

    setActionError('');
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`https://localhost:7113/api/MedicalStaff/${action}/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        if (action === 'confirm-sample-transfer-received') {
          setActionError('Sample has not been delivered to the lab yet.');
        } else {
          const contentType = response.headers.get("content-type");
          let errorMessage;
          if (contentType && contentType.indexOf("application/json") !== -1) {
              const errorData = await response.json();
              errorMessage = errorData.message;
          } else {
              errorMessage = await response.text();
          }
          throw new Error(errorMessage || `Failed to perform action: ${action}`);
        }
      }
      
      await fetchAllData();
    } catch (err) {
      console.error(`Error performing action ${action}:`, err);
      setActionError(err.message || 'An error occurred.');
    } finally {
      setShowConfirmModal(false);
      setConfirmActionDetails({ action: null, id: null, actionText: '' });
    }
  };

  const openAddResultModal = (orderDetailId) => {
    setCurrentOrderDetailId(orderDetailId);
    setResultData({ testSummary: '', rawDataPath: '', reportUrl: '', resultStatus: '' });
    setResultError('');
    setShowAddResultModal(true);
  };

  const handleAddResultSubmit = async (e) => {
    e.preventDefault();
    setResultError('');

    if (!currentOrderDetailId) {
        setResultError('No Order Detail ID specified.');
        return;
    }

    const payload = {
      ...resultData,
      orderDetailId: currentOrderDetailId,
      reportDate: new Date().toISOString(),
    };

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch('https://localhost:7113/api/MedicalStaff/add-result', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await response.json();
            errorMessage = errorData.message;
        } else {
            errorMessage = await response.text();
        }
        throw new Error(errorMessage || 'Failed to add result.');
      }

      setShowAddResultModal(false);
      await fetchAllData();

    } catch (err) {
      setResultError(err.message);
    }
  };

  // 2. Filtered data
  const filteredSampleTransfers = sampleTransfers.filter(t =>
    transferStatusFilter === 'all' || t.sampleTransferStatus === transferStatusFilter
  );
  const filteredSamples = samples.filter(s =>
    (sampleTypeFilter === 'all' || s.sampleTypeName === sampleTypeFilter) &&
    (sampleStatusFilter === 'all' || s.sampleStatus === sampleStatusFilter)
  );
  const filteredOrderDetails = orderDetails.filter(o =>
    (orderServiceFilter === 'all' || o.serviceName === orderServiceFilter) &&
    (orderStatusFilter === 'all' || o.status === orderStatusFilter)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <MedicalStaffNavbar />
        <main className="flex justify-center items-center h-screen">
            <FaSpinner className="w-12 h-12 text-teal-600 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <MedicalStaffNavbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto space-y-10">
          {error && <div className="bg-red-50 border-l-4 border-red-400 p-4"><p className="text-sm text-red-700">{error}</p></div>}
          {actionError && <div className="bg-red-50 border-l-4 border-red-400 p-4"><p className="text-sm text-red-700">{actionError}</p></div>}

          {/* Sample Transfers Table */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay:0}}
            className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700">
              <h2 className="text-xl font-bold text-white flex items-center"><FaClipboardList className="mr-2" /> Sample Transfers</h2>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <label className="text-white font-medium">Status:</label>
                <select value={transferStatusFilter} onChange={e => setTransferStatusFilter(e.target.value)} className="rounded px-2 py-1">
                  <option value="all">All</option>
                  {[...new Set(sampleTransfers.map(t => t.sampleTransferStatus))].map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer ID</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSampleTransfers.map((transfer) => (
                    <tr key={transfer.sampleTransferId} className="hover:bg-gray-50">
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{transfer.sampleTransferId}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.staffName}</td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transfer.sampleTransferStatus === 'Received' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transfer.sampleTransferStatus}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                            onClick={() => handleAction('confirm-sample-transfer-received', transfer.sampleTransferId, 'Confirm Transfer Received')}
                            className={`flex items-center px-3 py-2 text-white rounded-md transition-all duration-200 text-xs font-semibold ${
                                transfer.sampleTransferStatus === 'Received' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                            }`}
                            disabled={transfer.sampleTransferStatus === 'Received'}
                        >
                            <FaCheck className="mr-2" /> Confirm Received
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
          
          {/* Sample Management Table */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay:0.2}}
            className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 bg-gradient-to-r from-teal-600 to-teal-700">
              <h2 className="text-xl font-bold text-white flex items-center"><FaFlask className="mr-2" /> Sample Processing</h2>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <div className="flex items-center gap-1">
                  <label className="text-white font-medium">Type:</label>
                  <select value={sampleTypeFilter} onChange={e => setSampleTypeFilter(e.target.value)} className="rounded px-2 py-1">
                    <option value="all">All</option>
                    {[...new Set(samples.map(s => s.sampleTypeName))].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-white font-medium">Status:</label>
                  <select value={sampleStatusFilter} onChange={e => setSampleStatusFilter(e.target.value)} className="rounded px-2 py-1">
                    <option value="all">All</option>
                    {[...new Set(samples.map(s => s.sampleStatus))].map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample ID</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Type</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSamples.map((sample) => (
                    <tr key={sample.sampleId} className="hover:bg-gray-50">
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{sample.sampleId}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{sample.sampleTypeName}</td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sample.sampleStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          sample.sampleStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sample.sampleStatus}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleAction('receive-sample', sample.sampleId, 'Set Status to Processing')}
                                className={`flex items-center px-3 py-2 text-white rounded-md transition-all duration-200 text-xs font-semibold ${
                                    !['collected', 'inlab'].includes(sample.sampleStatus?.trim().toLowerCase()) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                                disabled={!['collected', 'inlab'].includes(sample.sampleStatus?.trim().toLowerCase())}
                            >
                                <FaFlask className="mr-2" /> Set to Processing
                            </button>
                            <button
                                onClick={() => handleAction('complete-sample', sample.sampleId, 'Set Status to Completed')}
                                className={`flex items-center px-3 py-2 text-white rounded-md transition-all duration-200 text-xs font-semibold ${
                                    sample.sampleStatus?.trim().toLowerCase() !== 'processing' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                                }`}
                                disabled={sample.sampleStatus?.trim().toLowerCase() !== 'processing'}
                            >
                                <FaCheckCircle className="mr-2" /> Set to Completed
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Order Details Table */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay:0.4}}
            className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 bg-gradient-to-r from-green-600 to-green-700">
              <h2 className="text-xl font-bold text-white flex items-center"><FaClipboardList className="mr-2" /> Order Details</h2>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <div className="flex items-center gap-1">
                  <label className="text-white font-medium">Service:</label>
                  <select value={orderServiceFilter} onChange={e => setOrderServiceFilter(e.target.value)} className="rounded px-2 py-1">
                    <option value="all">All</option>
                    {[...new Set(orderDetails.map(o => o.serviceName))].map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-white font-medium">Status:</label>
                  <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} className="rounded px-2 py-1">
                    <option value="all">All</option>
                    {[...new Set(orderDetails.map(o => o.status))].map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                            <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrderDetails.map((order) => (
                            <tr key={order.orderDetailId} className="hover:bg-gray-50">
                                <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.orderDetailId}</td>
                                <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                                <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{order.serviceName}</td>
                                <td className="px-8 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        order.status === 'Qualified for Result Update' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {order.status || 'Pending'}
                                    </span>
                                </td>
                                <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleAction('update-status-order-detail', order.orderDetailId, 'Qualify for Result Update')}
                                            className={`flex items-center px-3 py-2 text-white rounded-md transition-all duration-200 text-xs font-semibold ${
                                                order.status?.trim().toLowerCase() === 'qualified for result update' || order.status === 'Completed' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                                            }`}
                                            disabled={order.status?.trim().toLowerCase() === 'Ok' || order.status === 'Completed'}
                                        >
                                            <FaCheck className="mr-2" /> Qualify
                                        </button>
                                        <button
                                            onClick={() => openAddResultModal(order.orderDetailId)}
                                            className={`flex items-center px-3 py-2 text-white rounded-md transition-all duration-200 text-xs font-semibold ${
                                                !['qualified for result update', 'completed'].includes(order.status?.trim().toLowerCase()) ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'
                                            }`}
                                            disabled={!['qualified for result update', 'completed'].includes(order.status?.trim().toLowerCase())}
                                        >
                                            <FaPlusCircle className="mr-2" /> Add Result
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-8 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Confirm Action</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to: <br />
                  <strong className="font-semibold text-gray-700">"{confirmActionDetails.actionText}"</strong>?
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button onClick={() => setShowConfirmModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={executeConfirmedAction} className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Result Modal */}
      {showAddResultModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <form onSubmit={handleAddResultSubmit} className="relative mx-auto p-8 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Add Result for Order #{currentOrderDetailId}</h3>
            {resultError && <p className="text-red-500 text-sm mb-4 bg-red-100 p-2 rounded">{resultError}</p>}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Test Summary</label>
                <textarea
                  value={resultData.testSummary}
                  onChange={(e) => setResultData({ ...resultData, testSummary: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Raw Data Path</label>
                <input
                  type="text"
                  value={resultData.rawDataPath}
                  onChange={(e) => setResultData({ ...resultData, rawDataPath: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Report URL</label>
                <input
                  type="text"
                  value={resultData.reportUrl}
                  onChange={(e) => setResultData({ ...resultData, reportUrl: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Result Status</label>
                 <select
                  value={resultData.resultStatus}
                  onChange={(e) => setResultData({ ...resultData, resultStatus: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Positive">Positive</option>
                  <option value="Negative">Negative</option>
                  <option value="Inconclusive">Inconclusive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button type="button" onClick={() => setShowAddResultModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Submit Result</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MedicalStaffOrder; 
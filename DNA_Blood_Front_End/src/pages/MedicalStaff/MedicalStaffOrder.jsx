import React, { useState, useEffect } from 'react';
import MedicalStaffNavbar from '../../components/medicalStaff/MedicalStaffNavbar';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaSpinner, FaExclamationTriangle, FaCheck, FaFlask, FaCheckCircle, FaPlusCircle, FaTrash, FaUser, FaTimes } from 'react-icons/fa';
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
  
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [currentOrderDetailId, setCurrentOrderDetailId] = useState(null);
  const [resultData, setResultData] = useState({
    testSummary: '',
    rawDataPath: '',
    reportUrl: '',
    resultStatus: '',
    locusResults: [
      { locusId: '', personAAlleles: '', personBAlleles: '', isMatch: null }
    ]
  });
  const [resultError, setResultError] = useState('');

  const [transferStatusFilter, setTransferStatusFilter] = useState('all');
  const [sampleTypeFilter, setSampleTypeFilter] = useState('all');
  const [sampleStatusFilter, setSampleStatusFilter] = useState('all');
  const [orderServiceFilter, setOrderServiceFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const [showViewImagesModal, setShowViewImagesModal] = useState(false);
  const [viewImages, setViewImages] = useState([]);
  const [selectedSampleForImages, setSelectedSampleForImages] = useState(null);

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
        fetchAPI('/api/MedicalStaff/get-sample-by-medicalStaffId'),
        fetchAPI('/api/MedicalStaff/get-sample-transfers-by-medicalStaffId'),
        fetchAPI('/api/MedicalStaff/order-details')
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
      const response = await fetch(`/api/MedicalStaff/${action}/${id}`, {
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
    setResultData({ testSummary: '', rawDataPath: '', reportUrl: '', resultStatus: '', locusResults: [
      { locusId: '', personAAlleles: '', personBAlleles: '', isMatch: null }
    ] });
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
      const response = await fetch('/api/MedicalStaff/add-result', {
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

  const handleLocusChange = (index, field, value) => {
    const updated = resultData.locusResults.map((locus, i) =>
      i === index ? { ...locus, [field]: value } : locus
    );
    setResultData({ ...resultData, locusResults: updated });
  };

  // Toggle isMatch: null -> true -> false -> null
  const handleToggleIsMatch = (index) => {
    const current = resultData.locusResults[index].isMatch;
    let next;
    if (current === null || current === undefined) next = true;
    else if (current === true) next = false;
    else next = null;
    handleLocusChange(index, 'isMatch', next);
  };

  const handleAddLocus = () => {
    setResultData({
      ...resultData,
      locusResults: [
        ...resultData.locusResults,
        { locusId: '', personAAlleles: '', personBAlleles: '', isMatch: null }
      ]
    });
  };

  const handleRemoveLocus = (index) => {
    if (resultData.locusResults.length === 1) return;
    setResultData({
      ...resultData,
      locusResults: resultData.locusResults.filter((_, i) => i !== index)
    });
  };

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

  const verifyImage = async (verificationImageId, status) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    try {
      await fetch(`/api/MedicalStaff/verify-sample-image/${verificationImageId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verificationStatus: status })
      });
      if (selectedSampleForImages) {
        const resp = await fetch(`/api/MedicalStaff/sample-images/${selectedSampleForImages}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) {
          const images = await resp.json();
          setViewImages(images);
        }
      }
    } catch (err) {
      alert('Xác nhận ảnh thất bại!');
    }
  };

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
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleAction('confirm-sample-transfer-received', transfer.sampleTransferId, 'Confirm Transfer Received')}
                                className={`flex items-center px-3 py-2 text-white rounded-md transition-all duration-200 text-xs font-semibold ${
                                    transfer.sampleTransferStatus === 'Received' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                                }`}
                                disabled={transfer.sampleTransferStatus === 'Received'}
                            >
                                <FaCheck className="mr-2" /> Confirm Received
                            </button>
                            {/* Nút View Images */}
                            <button
                                onClick={async () => {
                                  setSelectedSampleForImages(transfer.sampleId);
                                  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                                  const resp = await fetch(`/api/MedicalStaff/sample-images/${transfer.sampleId}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  if (resp.ok) {
                                    const images = await resp.json();
                                    setViewImages(images);
                                    setShowViewImagesModal(true);
                                  }
                                }}
                                className="flex items-center px-2 py-1 text-blue-600 hover:text-blue-800 border border-blue-200 rounded"
                                title="View Verification Images"
                            >
                                📷 View Images
                            </button>
                        </div>
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
              {/* Locus Results Table */}
              <div className="overflow-x-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">Locus Results</label>
                <table className="min-w-[600px] divide-y divide-gray-200 mb-2 border border-gray-300 rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 border border-gray-300">Locus ID</th>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 border border-gray-300">Person A Alleles</th>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 border border-gray-300">Person B Alleles</th>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 border border-gray-300">Is Match</th>
                      <th className="border border-gray-300"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultData.locusResults.map((locus, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1 border border-gray-300">
                          <input
                            type="number"
                            value={locus.locusId}
                            onChange={e => handleLocusChange(idx, 'locusId', e.target.value)}
                            className="w-24 rounded border border-gray-300 focus:border-teal-500 focus:ring-teal-500 appearance-auto"
                            required
                          />
                        </td>
                        <td className="px-2 py-1 border border-gray-300">
                          <input
                            type="text"
                            value={locus.personAAlleles}
                            onChange={e => handleLocusChange(idx, 'personAAlleles', e.target.value)}
                            className="w-32 rounded border border-gray-300"
                            required
                          />
                        </td>
                        <td className="px-2 py-1 border border-gray-300">
                          <input
                            type="text"
                            value={locus.personBAlleles}
                            onChange={e => handleLocusChange(idx, 'personBAlleles', e.target.value)}
                            className="w-32 rounded border border-gray-300"
                            required
                          />
                        </td>
                        <td className="px-2 py-1 text-center border border-gray-300">
                          <button
                            type="button"
                            onClick={() => handleToggleIsMatch(idx)}
                            className={`w-7 h-7 flex items-center justify-center rounded border-2
                              ${locus.isMatch === true ? 'border-green-500 bg-green-50' : locus.isMatch === false ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
                              focus:outline-none`}
                            title="Toggle Match"
                          >
                            {locus.isMatch === true && <FaCheck className="text-green-600 text-lg" />}
                            {locus.isMatch === false && <FaTimes className="text-red-500 text-lg" />}
                          </button>
                        </td>
                        <td className="px-2 py-1 border border-gray-300">
                          <button
                            type="button"
                            onClick={() => handleRemoveLocus(idx)}
                            className="bg-red-100 text-red-700 rounded p-2 text-base hover:bg-red-500 hover:text-white transition flex items-center justify-center"
                            title="Remove"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={handleAddLocus} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs">+ Add Locus</button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button type="button" onClick={() => setShowAddResultModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Submit Result</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal show verified image */}
      {showViewImagesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto relative">
            <div className="mb-4 flex items-center gap-3 text-base font-semibold">
              <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-base font-bold">
                <FaUser className="mr-2" /> Participant:
              </span>
              <span className="text-gray-800">{viewImages[0]?.participantName}</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center">
              Verification Images for Sample <span className="text-blue-600">#{selectedSampleForImages}</span>
            </h3>
            {/* Warning if any image is not verified */}
            {viewImages.some(img => !img.verificationStatus || img.verificationStatus === 'Pending') && (
              <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
                <strong>Chú ý:</strong> Bạn phải kiểm tra và xác thực tất cả ảnh trước khi xác nhận nhận mẫu.
              </div>
            )}
            {viewImages.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No images uploaded.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {viewImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-gray-200 rounded-xl p-5 bg-white shadow hover:shadow-lg transition flex flex-col"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.verificationType}
                      className="w-full h-44 object-cover rounded-lg mb-3 cursor-pointer hover:scale-105 transition"
                      onClick={() => window.open(img.imageUrl, '_blank')}
                    />
                    <div className="flex flex-wrap gap-2 mb-3 items-center">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        {img.verificationType}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold shadow-sm
                        ${img.verificationStatus === 'Valid photo verification' ? 'bg-green-100 text-green-700 border border-green-300'
                          : img.verificationStatus === 'Invalid photo verification' ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}>
                        {img.verificationStatus === 'Valid photo verification' ? 'Approved'
                          : img.verificationStatus === 'Invalid photo verification' ? 'Rejected'
                          : 'Pending'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 italic mb-1">
                      <span className="font-semibold text-gray-700">Note:</span> {img.note ? img.note : <span className="text-gray-400">No note</span>}
                    </div>
                    <div className="text-xs text-gray-700 mb-1">
                      <span className="font-semibold">Captured by:</span> {img.capturedByName}
                      {img.verifiedByName && (
                        <>
                          <span className="mx-1">|</span>
                          <span className="font-semibold">Verified by:</span> {img.verifiedByName}
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-semibold">Capture Time:</span> {img.captureTime ? new Date(img.captureTime).toLocaleString() : 'N/A'}
                    </div>
                    <div className="flex gap-2 mb-3 mt-2">
                      <button
                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold shadow transition-all duration-150
                          ${img.verificationStatus === 'Valid photo verification' ? 'bg-green-400 text-white cursor-not-allowed' : 'bg-green-100 text-green-700 hover:bg-green-500 hover:text-white'}`}
                        disabled={img.verificationStatus === 'Valid photo verification'}
                        onClick={() => verifyImage(img.verificationImageId, 'Valid photo verification')}
                        title={img.verificationStatus === 'Valid photo verification' ? 'Already approved' : 'Approve this image'}
                      >
                        <FaCheck className="text-base" /> Approve
                      </button>
                      <button
                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold shadow transition-all duration-150
                          ${img.verificationStatus === 'Invalid photo verification' ? 'bg-red-400 text-white cursor-not-allowed' : 'bg-red-100 text-red-700 hover:bg-red-500 hover:text-white'}`}
                        disabled={img.verificationStatus === 'Invalid photo verification'}
                        onClick={() => verifyImage(img.verificationImageId, 'Invalid photo verification')}
                        title={img.verificationStatus === 'Invalid photo verification' ? 'Already rejected' : 'Reject this image'}
                      >
                        <FaTimes className="text-base" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowViewImagesModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold transition"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalStaffOrder; 
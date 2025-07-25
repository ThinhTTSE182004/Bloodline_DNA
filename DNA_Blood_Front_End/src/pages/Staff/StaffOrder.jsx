import React, { useState, useEffect } from 'react';
import StaffNavbar from '../../components/staff/StaffNavbar';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaEdit, FaSpinner, FaExclamationTriangle, FaTruck, FaBoxOpen, FaVial, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StaffOrder = () => {
  const [samples, setSamples] = useState([]);
  const [sampleTransfers, setSampleTransfers] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [noteOption, setNoteOption] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmActionDetails, setConfirmActionDetails] = useState({ action: null, transferIds: null, actionText: '' });
  const [sampleVerificationCounts, setSampleVerificationCounts] = useState({});
  // Thêm các state cho modal upload ảnh
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTransferForUpload, setSelectedTransferForUpload] = useState(null);
  const [uploadError, setUploadError] = useState('');
  // Thay selectedFile thành selectedFiles (array)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  // Thêm state cho verificationType và note
  const [verificationType, setVerificationType] = useState('');
  const [imageNote, setImageNote] = useState('');
  const [showViewImagesModal, setShowViewImagesModal] = useState(false);
  const [viewImages, setViewImages] = useState([]);
  const navigate = useNavigate();

  const statusHierarchy = ['Pending', 'Delivering Kit', 'Collecting Sample', 'Delivering to Lab', 'Completed'];

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
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

      const [ordersData, samplesData, transfersData] = await Promise.all([
        fetchAPI('/api/Staff/assigned-order-details'),
        fetchAPI('/api/Staff/get-sample-by-staffId'),
        fetchAPI('/api/Staff/get-sample-transfers-by-staffId')
      ]);

      setAssignedOrders(ordersData);
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
    fetchAllData();
  }, [navigate]);

  useEffect(() => {
    if (sampleTransfers.length === 0) return;
    const fetchCounts = async () => {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const counts = {};
      await Promise.all(sampleTransfers.map(async (transfer) => {
        try {
          const resp = await fetch(`/api/Staff/sample-verification-images/${transfer.sampleId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resp.ok) {
            const images = await resp.json();
            counts[transfer.sampleId] = images.length;
          } else {
            counts[transfer.sampleId] = 0;
          }
        } catch {
          counts[transfer.sampleId] = 0;
        }
      }));
      setSampleVerificationCounts(counts);
    };
    fetchCounts();
  }, [sampleTransfers]);

  const handleTransferAction = (action, transferId, actionText) => {
    setConfirmActionDetails({ action, transferIds: [transferId], actionText });
    setShowConfirmModal(true);
  };

  const executeConfirmedAction = async () => {
    const { action, transferIds } = confirmActionDetails;
    if (!action || !transferIds || transferIds.length === 0) return;

    setError(null);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) {
        navigate('/login');
      }
      // Gọi API cho từng transferId trong nhóm
      await Promise.all(transferIds.map(async (transferId) => {
      const response = await fetch(`/api/Staff/${action}/${transferId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to perform action: ${action}`);
      }
      }));
      await fetchAllData();
    } catch (err) {
      setError(`Failed to perform action. Please try again.`);
    } finally {
      setShowConfirmModal(false);
      setConfirmActionDetails({ action: null, transferIds: null, actionText: '' });
    }
  };

  const predefinedNotes = [
    "Sample kit delivered to customer's address.",
    "Customer has picked up the sample kit at the facility."
  ];

  const handleUpdateSample = async (sampleId) => {
    setUpdateError(null);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const finalNote = noteOption === 'Other' ? customNote : noteOption;
      if (!finalNote) {
        setUpdateError('Note cannot be empty.');
        return;
      }

      const response = await fetch(`/api/Staff/update-sample/${sampleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: finalNote }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update sample note');
      }
      setShowUpdateModal(false);
      await fetchAllData();
    } catch (err) {
      setUpdateError(err.message);
    }
  };

  const openUpdateModal = (sample) => {
    setSelectedSample(sample);
    setUpdateError(null);
    const currentNote = sample.note || '';

    if (predefinedNotes.includes(currentNote)) {
      setNoteOption(currentNote);
      setCustomNote('');
    } else if (currentNote) {
      setNoteOption('Other');
      setCustomNote(currentNote);
    } else {
      setNoteOption('');
      setCustomNote('');
    }
    
    setShowUpdateModal(true);
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

  // Lọc các sample transfer theo collectionMethod
  const atHomeTransfers = sampleTransfers.filter(
    transfer => transfer.collectionMethod === 'At Home'
  );
  const medicalCenterTransfers = sampleTransfers.filter(
    transfer => transfer.collectionMethod === 'At Medical Center'
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <StaffNavbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto space-y-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Sample Management Table */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay:0}}
            className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700">
              <h2 className="text-xl font-bold text-white flex items-center"><FaClipboardList className="mr-2" /> Sample Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample ID</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Type</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kit Codes</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {samples.map((sample) => (
                    <tr key={sample.sampleId} className="hover:bg-gray-50">
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{sample.sampleId}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{sample.sampleTypeName}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{sample.kitCodes?.join(', ') || 'No Kit'}</td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sample.sampleStatus === 'Collected' ? 'bg-green-100 text-green-800' :
                          sample.sampleStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          sample.sampleStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sample.sampleStatus || 'Not Updated'}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
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
          </motion.div>

          {/* Sample Transfers Table at home*/}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay:0.2}}
            className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-purple-700">
              <h2 className="text-xl font-bold text-white flex items-center"><FaClipboardList className="mr-2" /> Sample Transfers At Home</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer ID</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample ID</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kit Code</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer Date</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {atHomeTransfers.map((transfer) => {
                    const statusIndex = statusHierarchy.indexOf(transfer.sampleTransferStatus);
                    const isDeliverKitDisabled = statusIndex >= 1;
                    const isCollectSampleDisabled = statusIndex >= 2;
                    const isDeliverToLabDisabled = statusIndex >= 3;
                    const verificationCount = sampleVerificationCounts[transfer.sampleId] || 0;

                    return (
                      <tr key={transfer.sampleTransferId} className="hover:bg-gray-50">
                        <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{transfer.sampleTransferId}</td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.sampleId}</td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.kitCode || 'N/A'}</td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transfer.sampleTransferStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                            transfer.sampleTransferStatus === 'Delivering Kit' ? 'bg-blue-100 text-blue-800' :
                            transfer.sampleTransferStatus === 'Collecting Sample' ? 'bg-orange-100 text-orange-800' :
                            transfer.sampleTransferStatus === 'Delivering to Lab' ? 'bg-teal-100 text-teal-800' :
                            transfer.sampleTransferStatus === 'Received' ? 'bg-green-100 text-green-800' :
                            'bg-green-100 text-green-800' // Completed
                          }`}>
                            {transfer.sampleTransferStatus}
                          </span>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transfer.transferDate).toLocaleString()}</td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                          {transfer.sampleTransferStatus === 'Received' ? (
                            <div className="flex items-center font-semibold text-green-600">
                              <FaCheckCircle className="mr-2" />
                              Confirmed
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              {/* Nút Deliver Kit */}
                              <button
                                onClick={() => handleTransferAction('deliver-kit', transfer.sampleTransferId, 'Delivering Kit')}
                                className={`flex items-center px-3 py-2 text-white rounded-md transition-all duration-200 text-xs font-semibold ${
                                  isDeliverKitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                                title="Delivering Kit"
                                disabled={isDeliverKitDisabled}
                              >
                                <FaTruck className="mr-2" /> Deliver Kit
                              </button>
                              {/* Nút upload ảnh luôn hiển thị */}
                              <button
                                onClick={() => {
                                  setSelectedTransferForUpload(transfer);
                                  setShowUploadModal(true);
                                  setUploadError('');
                                  setSelectedFiles([]);
                                  setVerificationType('');
                                  setImageNote('');
                                }}
                                className="flex items-center px-2 py-1 text-blue-600 hover:text-blue-800 border border-blue-200 rounded"
                                title="Upload Verification Image"
                              >
                                <FaBoxOpen className="mr-1" /> Upload Image
                              </button>
                              {/* Nút Collect Sample luôn hiển thị, chỉ enable khi trạng thái là 'Delivering Kit' */}
                              <button
                                onClick={() => handleTransferAction('collect-sample', transfer.sampleTransferId, 'Collecting Sample')}
                                className={`flex items-center px-3 py-2 text-white rounded-md transition-all duration-200 text-xs font-semibold ${
                                  transfer.sampleTransferStatus === 'Delivering Kit' && !isCollectSampleDisabled
                                    ? 'bg-orange-500 hover:bg-orange-600'
                                    : 'bg-gray-400 cursor-not-allowed'
                                }`}
                                title={
                                  transfer.sampleTransferStatus === 'Delivering Kit'
                                    ? ''
                                    : 'Chỉ có thể Collect Sample khi đã Deliver Kit'
                                }
                                disabled={transfer.sampleTransferStatus !== 'Delivering Kit' || isCollectSampleDisabled}
                              >
                                <FaBoxOpen className="mr-2" /> Collect Sample
                              </button>
                              {/* Nút Deliver to Lab enable/disable chỉ theo trạng thái và số lượng ảnh của dòng này */}
                              <button
                                onClick={() => handleTransferAction('deliver-to-lab', transfer.sampleTransferId, 'Delivering to Lab')}
                                className={`flex items-center px-3 py-2 text-white rounded-md transition-all duration-200 text-xs font-semibold ${
                                  isDeliverToLabDisabled || verificationCount < 2 ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'
                                }`}
                                title={
                                  isDeliverToLabDisabled
                                    ? ''
                                    : verificationCount < 2
                                    ? 'Cần upload ít nhất 2 ảnh xác minh trước khi chuyển mẫu đến lab'
                                    : ''
                                }
                                disabled={isDeliverToLabDisabled || verificationCount < 2}
                              >
                                <FaVial className="mr-2" /> Deliver to Lab
                              </button>
                              <button
                                onClick={async () => {
                                  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                                  const resp = await fetch(`/api/Staff/sample-verification-images/${transfer.sampleId}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  if (resp.ok) {
                                    const images = await resp.json();
                                    setViewImages(images);
                                    setShowViewImagesModal(true);
                                  }
                                }}
                                className="flex items-center px-2 py-1 text-green-600 hover:text-green-800 border border-green-200 rounded"
                                title="View Uploaded Images"
                              >
                                <FaCheckCircle className="mr-1" /> View Images
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )})}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Sample Transfers Table at medical center */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay:0.2}}
            className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-teal-600 to-teal-700">
              <h2 className="text-xl font-bold text-white flex items-center"><FaClipboardList className="mr-2" /> Sample Transfers At Medical Center</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer ID</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample ID</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kit Code</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer Date</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicalCenterTransfers.map((transfer) => {
                    const statusIndex = statusHierarchy.indexOf(transfer.sampleTransferStatus);
                    const isCollectSampleDisabled = statusIndex >= 2;
                    const isDeliverToLabDisabled = statusIndex >= 3;
                    const verificationCount = sampleVerificationCounts[transfer.sampleId] || 0;

                    return (
                    <tr key={transfer.sampleTransferId} className="hover:bg-gray-50">
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{transfer.sampleTransferId}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.sampleId}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.kitCode || 'N/A'}</td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transfer.sampleTransferStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          transfer.sampleTransferStatus === 'Delivering Kit' ? 'bg-blue-100 text-blue-800' :
                          transfer.sampleTransferStatus === 'Collecting Sample' ? 'bg-orange-100 text-orange-800' :
                          transfer.sampleTransferStatus === 'Delivering to Lab' ? 'bg-teal-100 text-teal-800' :
                          transfer.sampleTransferStatus === 'Received' ? 'bg-green-100 text-green-800' :
                          'bg-green-100 text-green-800' // Completed
                        }`}>
                          {transfer.sampleTransferStatus}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transfer.transferDate).toLocaleString()}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Nút upload ảnh luôn hiển thị */}
                          <button
                            onClick={() => {
                              setSelectedTransferForUpload(transfer);
                              setShowUploadModal(true);
                              setUploadError('');
                              setSelectedFiles([]);
                              setVerificationType('');
                              setImageNote('');
                            }}
                            className="flex items-center px-2 py-1 text-blue-600 hover:text-blue-800 border border-blue-200 rounded"
                            title="Upload Verification Image"
                          >
                            <FaBoxOpen className="mr-1" /> Upload Image
                          </button>
                          {/* Nút Collect Sample chỉ chuyển trạng thái */}
                          <button
                            onClick={() => handleTransferAction('collect-sample', transfer.sampleTransferId, 'Collecting Sample')}
                            className={`flex items-center px-3 py-2 text-white rounded-md transition-all duration-200 text-xs font-semibold ${
                              isCollectSampleDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                            }`}
                            title="Collecting Sample"
                            disabled={isCollectSampleDisabled}
                          >
                            <FaBoxOpen className="mr-2" /> Collect Sample
                          </button>
                          <button
                            onClick={() => handleTransferAction('deliver-to-lab', transfer.sampleTransferId, 'Delivering to Lab')}
                            className={`flex items-center px-3 py-2 text-white rounded-md transition-all duration-200 text-xs font-semibold ${
                              isDeliverToLabDisabled || verificationCount < 2 ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'
                            }`}
                            title={
                              isDeliverToLabDisabled
                                ? ''
                                : verificationCount < 2
                                ? 'Cần upload ít nhất 2 ảnh xác minh trước khi chuyển mẫu đến lab'
                                : ''
                            }
                            disabled={isDeliverToLabDisabled || verificationCount < 2}
                          >
                            <FaVial className="mr-2" /> Deliver to Lab
                          </button>
                          <button
                            onClick={async () => {
                              const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                              const resp = await fetch(`/api/Staff/sample-verification-images/${transfer.sampleId}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              if (resp.ok) {
                                const images = await resp.json();
                                setViewImages(images);
                                setShowViewImagesModal(true);
                              }
                            }}
                            className="flex items-center px-2 py-1 text-green-600 hover:text-green-800 border border-green-200 rounded"
                            title="View Uploaded Images"
                          >
                            <FaCheckCircle className="mr-1" /> View Images
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Assigned Orders Table */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay:0.4}}
            className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-green-600 to-green-700">
              <h2 className="text-xl font-bold text-white flex items-center"><FaClipboardList className="mr-2" /> Assigned Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Detail ID</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignedOrders.map((order) => (
                    <tr key={order.orderDetailId} className="hover:bg-gray-50">
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.orderDetailId}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{order.serviceName}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.orderDate).toLocaleString()}</td>
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
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Confirm Action
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to confirm: <br />
                  <strong className="font-semibold text-gray-700">"{confirmActionDetails.actionText}"</strong>?
                </p>
                {confirmActionDetails.transferIds && confirmActionDetails.transferIds.length > 1 && (
                  <p className="text-xs text-gray-600 mt-2">
                    This will update <b>{confirmActionDetails.transferIds.length}</b> samples with kit code <b>{confirmActionDetails.kitCode}</b>.
                  </p>
                )}
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={executeConfirmedAction}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-all duration-200"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Sample Modal */}
      {showUpdateModal && selectedSample && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Update Sample #{selectedSample.sampleId}</h3>
            {updateError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{updateError}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <div className="space-y-2">
                  {predefinedNotes.map((note) => (
                    <div key={note} className="flex items-center">
                      <input
                        id={note}
                        name="noteOption"
                        type="radio"
                        value={note}
                        checked={noteOption === note}
                        onChange={(e) => setNoteOption(e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor={note} className="ml-3 block text-sm font-medium text-gray-700">
                        {note}
                      </label>
                    </div>
                  ))}
                  <div className="flex items-center">
                    <input
                      id="other"
                      name="noteOption"
                      type="radio"
                      value="Other"
                      checked={noteOption === 'Other'}
                      onChange={(e) => setNoteOption(e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="other" className="ml-3 block text-sm font-medium text-gray-700">
                      Other
                    </label>
                  </div>
                </div>
              </div>

              {noteOption === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 sr-only">Custom Note</label>
                  <textarea 
                    value={customNote} 
                    onChange={(e) => setCustomNote(e.target.value)} 
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" 
                    rows="3"
                    placeholder="Enter custom note..."
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowUpdateModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={() => handleUpdateSample(selectedSample.sampleId)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update Note</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal upload ảnh */}
      {showUploadModal && selectedTransferForUpload && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[420px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Upload Sample Verification Images</h3>
            {uploadError && <div className="text-red-600 mb-2">{uploadError}</div>}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => setSelectedFiles(Array.from(e.target.files))}
              className="mb-2"
            />
            {selectedFiles.length > 0 && (
              <div className="mb-2 grid grid-cols-2 gap-2">
                {selectedFiles.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt={`preview-${idx}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                ))}
              </div>
            )}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại xác minh (Verification Type)</label>
              <input
                type="text"
                value={verificationType}
                onChange={e => setVerificationType(e.target.value)}
                className="w-full border rounded px-2 py-1"
                placeholder="Ví dụ: Trước khi lấy mẫu, Sau khi lấy mẫu..."
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Note)</label>
              <input
                type="text"
                value={imageNote}
                onChange={e => setImageNote(e.target.value)}
                className="w-full border rounded px-2 py-1"
                placeholder="Ghi chú cho ảnh (nếu có)"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                }}
                className="mr-2 px-4 py-2 bg-gray-200 rounded"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setUploading(true);
                  setUploadError('');
                  if (!selectedFiles.length) {
                    setUploadError('Please select at least one image.');
                    setUploading(false);
                    return;
                  }
                  try {
                    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                    for (const file of selectedFiles) {
                      // 1. Upload lên Cloudinary
                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('upload_preset', 'blog_unsigned');
                      const res = await fetch('https://api.cloudinary.com/v1_1/duqp1ecoj/image/upload', {
                        method: 'POST',
                        body: formData,
                      });
                      const data = await res.json();
                      if (!data.secure_url) throw new Error('Upload to cloud failed');
                      const imageUrl = data.secure_url;
                      // 2. Gửi URL và các trường khác lên backend
                      const resp = await fetch('/api/Staff/upload-sample-verification-image', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          sampleId: selectedTransferForUpload.sampleId,
                          imageUrl,
                          verificationType,
                          note: imageNote,
                        }),
                      });
                      if (!resp.ok) throw new Error('Upload to server failed');
                    }
                    await fetchAllData();
                    setShowUploadModal(false);
                    setSelectedFiles([]);
                    setVerificationType('');
                    setImageNote('');
                  } catch (err) {
                    setUploadError(err.message);
                  } finally {
                    setUploading(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Image(s)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hiển thị ảnh xác minh */}
      {showViewImagesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
            <h3 className="text-xl font-bold mb-4 text-center">
              Uploaded Verification Images <span className="text-blue-600">({viewImages.length})</span>
            </h3>
            {viewImages.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No images uploaded.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {viewImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-gray-200 rounded-xl p-3 bg-gray-50 hover:shadow-lg transition"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.verificationType}
                      className="w-full h-40 object-cover rounded-lg mb-3 cursor-pointer hover:scale-105 transition"
                      onClick={() => window.open(img.imageUrl, '_blank')}
                    />
                    <div className="mb-1">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        {img.verificationType}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 italic break-words">
                      {img.note || <span className="text-gray-400">No note</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowViewImagesModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold transition"
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

export default StaffOrder;
import React, { useState, useEffect } from 'react';
import StaffNavbar from '../../components/StaffNavbar';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaEdit, FaSpinner, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

const Staff = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [sampleData, setSampleData] = useState({
    sampleStatus: '',
    collectedDate: '',
    receivedDate: '',
    note: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://localhost:7113/api/Staff', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSample = async (sampleId) => {
    try {
      setUpdateError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (!sampleId) {
        setUpdateError('Invalid sample ID');
        return;
      }

      if (!sampleData.sampleStatus) {
        setUpdateError('Sample status is required');
        return;
      }

      if (!sampleData.collectedDate) {
        setUpdateError('Collected date is required');
        return;
      }

      if (!sampleData.receivedDate) {
        setUpdateError('Received date is required');
        return;
      }

      const formattedData = {
        ...sampleData,
        collectedDate: new Date(sampleData.collectedDate).toISOString(),
        receivedDate: new Date(sampleData.receivedDate).toISOString()
      };

      const response = await fetch(`https://localhost:7113/api/Staff/update-sample/${sampleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formattedData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update sample');
      }

      setShowUpdateModal(false);
      setLoading(true);
      await fetchOrders();
      
    } catch (err) {
      console.error('Error updating sample:', err);
      setUpdateError(err.message || 'An error occurred while updating the sample');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (order) => {
    if (!order) {
      setUpdateError('Invalid order');
      return;
    }

    setSelectedOrder(order);
    setUpdateError(null);
    setSampleData({
      sampleStatus: order.sampleStatus || '',
      collectedDate: order.collectedDate ? new Date(order.collectedDate).toISOString().slice(0, 16) : '',
      receivedDate: order.receivedDate ? new Date(order.receivedDate).toISOString().slice(0, 16) : '',
      note: order.note || ''
    });
    setShowUpdateModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <StaffNavbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <StaffNavbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 transform transition-all duration-300 ease-in-out">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaTimesCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            <div className="px-6 py-5 sm:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FaClipboardList className="mr-2" />
                Order Management
              </h1>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collection Method
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sample Status
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderId}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.serviceName}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors duration-200 ${
                          order.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.orderStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          <span className="text-sm text-gray-700">
                            {order.paymentMethod === 'BankTransfer' ? 'Bank Transfer' :
                             order.paymentMethod === 'CashOnDelivery' ? 'Cash on Delivery' :
                             order.paymentMethod}
                          </span>
                          {order.paymentMethod !== 'BankTransfer' && (
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors duration-200 ${
                              order.paymentStatus === 'PaymentCompleted' ? 'bg-green-100 text-green-800' :
                              order.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.paymentStatus === 'PaymentCompleted' ? 'Completed' :
                               order.paymentStatus === 'Pending' ? 'Pending' :
                               order.paymentStatus}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.sampleCollectionMethod}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.totalAmount.toLocaleString()} VND
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors duration-200 ${
                          order.sampleStatus === 'Collected' ? 'bg-green-100 text-green-800' :
                          order.sampleStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.sampleStatus || 'Not Updated'}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openUpdateModal(order)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-4 py-2 rounded-full border border-blue-200 hover:bg-blue-100 transition-all duration-200 transform hover:scale-105"
                        >
                          <FaEdit className="inline-block mr-1" />
                          Update Sample
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Update Sample Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white transform transition-all duration-300 ease-in-out">
            <div className="mt-3">
              <h3 className="text-xl font-medium leading-6 text-gray-900 mb-6">
                Update Sample Information
                <span className="text-sm text-gray-500 ml-2">(Order ID: {selectedOrder.orderId})</span>
              </h3>
              
              {updateError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 transform transition-all duration-300 ease-in-out">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{updateError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-2 px-7 py-3">
                <div className="grid grid-cols-2 gap-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sample Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={sampleData.sampleStatus}
                      onChange={(e) => setSampleData({...sampleData, sampleStatus: e.target.value})}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 transition-colors duration-200 ${
                        updateError && !sampleData.sampleStatus ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Status</option>
                      <option value="Collected">Collected</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Collected Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={sampleData.collectedDate}
                      onChange={(e) => setSampleData({...sampleData, collectedDate: e.target.value})}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 transition-colors duration-200 ${
                        updateError && !sampleData.collectedDate ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Received Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={sampleData.receivedDate}
                      onChange={(e) => setSampleData({...sampleData, receivedDate: e.target.value})}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 transition-colors duration-200 ${
                        updateError && !sampleData.receivedDate ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                </div>
                <div className="mb-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                  <textarea
                    value={sampleData.note}
                    onChange={(e) => setSampleData({...sampleData, note: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    rows="4"
                    placeholder="Enter any additional notes here..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 px-7 py-4 border-t mt-4">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateSample(selectedOrder.orderId)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;

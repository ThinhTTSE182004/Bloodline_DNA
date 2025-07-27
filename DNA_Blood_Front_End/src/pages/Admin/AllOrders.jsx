import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { FaSearch, FaFilter, FaCheck, FaClock, FaMoneyBillWave, FaCreditCard, FaHome, FaHospital } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [updatingPayment, setUpdatingPayment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
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
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/Order/all-orders', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch orders: ' + err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPayment = async (orderId) => {
    setUpdatingPayment(orderId);
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/Order/update-payment-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderId,
          status: 'Paid'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { ...order, paymentStatus: 'Paid' }
            : order
        )
      );

      alert('Payment accepted successfully!');
    } catch (err) {
      alert('Failed to accept payment: ' + err.message);
    } finally {
      setUpdatingPayment(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderId?.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid').length;
  const totalRevenue = orders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FaClock className="inline mr-1" /> },
      'Completed': { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheck className="inline mr-1" /> },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: <FaClock className="inline mr-1" /> }
    };
    const config = statusConfig[status] || statusConfig['Pending'];
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FaClock className="inline mr-1" /> },
      'Paid': { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheck className="inline mr-1" /> },
      'Failed': { bg: 'bg-red-100', text: 'text-red-800', icon: <FaClock className="inline mr-1" /> }
    };
    const config = statusConfig[status] || statusConfig['Pending'];
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const iconConfig = {
      'BankTransfer': <FaMoneyBillWave className="inline mr-1" />,
      'CreditCard': <FaCreditCard className="inline mr-1" />,
      'Cash': <FaMoneyBillWave className="inline mr-1" />
    };
    return iconConfig[method] || <FaMoneyBillWave className="inline mr-1" />;
  };

  const getCollectionMethodIcon = (method) => {
    const iconConfig = {
      'At Home': <FaHome className="inline mr-1" />,
      'At Hospital': <FaHospital className="inline mr-1" />
    };
    return iconConfig[method] || <FaHome className="inline mr-1" />;
  };

  if (loading) {
    return (
      <>
        <AdminNavbar onSidebarToggle={() => setSidebarOpen(true)} />
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-h-screen bg-gray-100 py-10 px-4 pt-32 transition-all duration-300">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading orders...</span>
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className=" mb-8">
            <h1 className="flex justify-center text-3xl font-bold text-gray-900 mb-2">All Orders</h1>
            <p className="flex justify-center text-gray-600">Manage and track all customer orders</p>
          </motion.div>

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
              transition={{ duration: 0.8, delay: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <FaCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <FaClock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <FaMoneyBillWave className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{paidOrders}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <FaCreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by service name or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Payment</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Orders Table */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Order List</h3>
              <p className="text-sm text-gray-600">Showing {filteredOrders.length} of {totalOrders} orders</p>
            </div>
            
            <div className="overflow-x-auto ">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order.orderId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.serviceName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.orderDate).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.orderStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getPaymentStatusBadge(order.paymentStatus)}
                          <div className="text-xs text-gray-500">
                            {getPaymentMethodIcon(order.paymentMethod)}
                            {order.paymentMethod}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${order.totalAmount?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getCollectionMethodIcon(order.sampleCollectionMethod)}
                          {order.sampleCollectionMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.paymentStatus === 'Pending' && (
                          <button
                            onClick={() => handleAcceptPayment(order.orderId)}
                            disabled={updatingPayment === order.orderId}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              updatingPayment === order.orderId
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {updatingPayment === order.orderId ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <FaCheck className="mr-1" />
                                Accept Payment
                              </>
                            )}
                          </button>
                        )}
                        {order.paymentStatus === 'Paid' && (
                          <span className="text-green-600 font-medium">Payment Accepted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders found matching your criteria.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AllOrders; 
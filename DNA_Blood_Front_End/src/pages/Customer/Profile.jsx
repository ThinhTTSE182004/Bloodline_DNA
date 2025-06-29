import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import signalRService from '../../services/signalRService.js';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [results, setResults] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [shareStatus, setShareStatus] = useState({});
  const [feedbackModal, setFeedbackModal] = useState({ open: false, orderId: null });
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackResponseModal, setFeedbackResponseModal] = useState({ open: false, feedbacks: [], loading: false, error: '', orderId: null });
  const [feedbackList, setFeedbackList] = useState([]);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found');
        navigate('/login');
        return;
      }

      console.log('Token being used:', token);

      const response = await fetch('https://localhost:7113/api/UserProfile/GetUserProfile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 401) {
        console.log('Token expired or invalid');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch profile data: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Profile data:', data);

      // Xử lý dữ liệu từ token JWT
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      console.log('Token data:', tokenData);

      // Kết hợp dữ liệu từ API và token
      const profileData = {
        name: data.name,
        email: data.email,
        phone: data.phone,

        updatedAt: data.updatedAt
      };

      console.log('Combined profile data:', profileData);

      if (!profileData.name || !profileData.email || !profileData.phone) {
        throw new Error('Invalid profile data received');
      }

      setUserProfile(profileData);
      setLoading(false);
      // Nếu thiếu thông tin, chuyển hướng sang Account Setting
      if (!profileData.name || !profileData.email || !profileData.phone) {
        navigate('/account-setting', { replace: true });
      }

    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng của bạn.');
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  }, [navigate]);

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://localhost:7113/api/UserProfile/GetOrderHistory', {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }

      let data = await response.json();
      // Đảm bảo mỗi order có orderId
      data = data.map((order) => {
        if (!order.orderId && order.id) {
          return { ...order, orderId: order.id };
        }
        return order;
      });
      setOrderHistory(data);
    } catch (err) {
      console.error('Error fetching order history:', err);
    }
  };

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('https://localhost:7113/api/UserProfile/Results', {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`https://localhost:7113/api/UserProfile/GetOrderDetail?orderId=${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch order detail');
      }
      const data = await response.json();
      setSelectedOrder(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      console.error('Error fetching order detail:', err);
    }
  };

  const fetchFeedbackList = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('https://localhost:7113/api/UserProfile/feedback-list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch feedback list');
      const data = await res.json();
      setFeedbackList(data);
    } catch {
      setFeedbackList([]);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchOrderHistory();
    setupSignalR();
    fetchResults();
    fetchFeedbackList();
    return () => {
      signalRService.stopConnection();
    };
  }, [fetchProfile]);

  const setupSignalR = async () => {
    try {
      // Stop any existing connection first
      await signalRService.stopConnection();
      
      // Start new connection
      await signalRService.startConnection();
      
      // Join user group
      const tokenData = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
      await signalRService.joinUserGroup(tokenData.nameid);
      
      // Listen for profile updates
      signalRService.onUserProfileUpdate((updatedProfile) => {
        console.log('Profile updated via SignalR:', updatedProfile);
        if (updatedProfile) {
          setUserProfile(prevProfile => ({
            ...prevProfile,
            ...updatedProfile
          }));
        }
      });
    } catch (error) {
      console.error('Error setting up SignalR:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 transform transition-all duration-300 hover:shadow-xl">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gradient-to-r from-blue-400 to-blue-600 h-24 w-24"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 transform transition-all duration-300 hover:shadow-xl">
              <div className="text-red-600 text-center">
                <div className="flex justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16 text-red-500 animate-bounce">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold mb-4">Error loading profile: {error}</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* User Profile Card */}
          <div
            className="bg-white shadow-lg rounded-lg p-6 md:p-8 transform transition-all duration-300 hover:shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl transform transition-all duration-300 hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              </div>
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 cursor-default">{userProfile.name}</h1>
                <p className="text-gray-600 flex items-center justify-center md:justify-start cursor-default">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2 text-blue-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  Last updated: {new Date(userProfile.updatedAt).toLocaleDateString()}
                </p>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                  <Link 
                    to="/account-setting"
                    className="flex items-center px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    Account Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div
            className="bg-white shadow-lg rounded-lg p-6 md:p-8 transform transition-all duration-300 hover:shadow-xl"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center cursor-default">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-2 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
              </svg>
              Personal Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg transform transition-all duration-300 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-3 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L2.52 8.91A2.25 2.25 0 0 1 1.5 6.993V6.75" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 cursor-default">Email Address</p>
                  <p className="text-gray-900 font-medium cursor-default">{userProfile.email}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg transform transition-all duration-300 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-3 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0-1.036.84-1.875 1.875-1.875h16.5c1.035 0 1.875.84 1.875 1.875v10.5a1.875 1.875 0 0 1-1.875 1.875H4.125A1.875 1.875 0 0 1 2.25 17.25V6.75Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 0 3 3m-3-3-3 3M12 18.75h.008v.008H12v-.008Z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 cursor-default">Phone Number</p>
                  <p className="text-gray-900 font-medium cursor-default">{userProfile.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order History Section */}
          <div
            className="bg-white shadow-lg rounded-lg p-6 md:p-8 transform transition-all duration-300 hover:shadow-xl"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center cursor-default">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-2 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
              Order History
            </h2>
            <div className="space-y-4">
              {orderHistory.map((order) => {
                const orderResults = results.filter(r => r.orderDetailId === order.orderId);
                return (
                  <React.Fragment key={order.orderId}>
                    <div className="w-full h-auto bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-md cursor-pointer"
                      onClick={() => fetchOrderDetail(order.orderId)}>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center h-full gap-2 md:gap-0">
                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{order.serviceName}</h3>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-1 items-center">
                              <span>Order ID: {order.orderId}</span>
                              <span>|</span>
                              <span>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}</span>
                              <span>|</span>
                              <span>Payment: {order.paymentMethod}</span>
                              <span>|</span>
                              <span>Collection: {order.collectionMethod || order.sampleCollectionMethod}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right mt-2 md:mt-0">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.orderStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                          <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                            order.paymentStatus === 'PaymentCompleted' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                          <p className="mt-2 text-lg font-semibold text-blue-600">
                            {order.totalAmount != null ? order.totalAmount.toLocaleString() : 'N/A'} VND
                          </p>
                        </div>
                      </div>
                    </div>
                    {orderResults.length > 0 && (
                      <div className="flex flex-col items-start">
                        <div className="flex flex-row gap-2 mb-2">
                          <button
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            onClick={e => { e.stopPropagation(); setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId); }}
                          >
                            {expandedOrderId === order.orderId ? 'Hide Result' : 'See Result'}
                          </button>
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-60"
                            disabled={shareStatus[orderResults[0].resultId]?.loading}
                            onClick={async e => {
                              e.stopPropagation();
                              setShareStatus(s => ({ ...s, [orderResults[0].resultId]: { loading: true, message: '' } }));
                              try {
                                const token = localStorage.getItem('token');
                                const res = await fetch('https://localhost:7113/api/UserProfile/ShareResult', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ resultId: orderResults[0].resultId, toEmail: userProfile.email })
                                });
                                if (res.ok) {
                                  setShareStatus(s => ({ ...s, [orderResults[0].resultId]: { loading: false, message: 'Result shared to your email!' } }));
                                } else {
                                  const err = await res.text();
                                  setShareStatus(s => ({ ...s, [orderResults[0].resultId]: { loading: false, message: 'Error: ' + err } }));
                                }
                              } catch (err) {
                                setShareStatus(s => ({ ...s, [orderResults[0].resultId]: { loading: false, message: 'Error: ' + err.message } }));
                              }
                            }}
                          >
                            {shareStatus[orderResults[0].resultId]?.loading ? 'Sharing...' : 'Share to Email'}
                          </button>
                          <button
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg flex items-center font-medium"
                            onClick={e => { e.stopPropagation(); setFeedbackModal({ open: true, orderId: order.orderId }); setFeedback({ rating: 0, comment: '' }); setFeedbackMsg(''); }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Give Feedback
                          </button>
                          <button
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-60 flex items-center"
                            disabled={!feedbackList.find(fb => fb.orderId === order.orderId)}
                            onClick={async e => {
                              e.stopPropagation();
                              const found = feedbackList.find(fb => fb.orderId === order.orderId);
                              if (!found) {
                                setFeedbackResponseModal({ open: true, feedbacks: [], loading: false, error: 'You have not submitted feedback for this order.', orderId: order.orderId });
                                return;
                              }
                              // Sử dụng contentResponses từ API mới
                              setFeedbackResponseModal({ 
                                open: true, 
                                feedbacks: found.contentResponses || [], 
                                loading: false, 
                                error: '', 
                                orderId: order.orderId 
                              });
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            See Feedback Response
                          </button>
                        </div>
                        {shareStatus[orderResults[0].resultId]?.message && (
                          <div className="mb-2 text-xs text-blue-700 text-left">{shareStatus[orderResults[0].resultId].message}</div>
                        )}
                        {expandedOrderId === order.orderId && (
                          <div className="w-full mt-2 space-y-4">
                            {orderResults.map(result => (
                              <div key={result.resultId} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 shadow hover:shadow-lg transition-all">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                                  <div>
                                    <div className="text-gray-700 text-sm mb-1">Test Name: <span className="font-semibold text-green-700">{result.testName}</span></div>
                                    <div className="text-gray-700 text-sm mb-1">Result Status: <span className={`font-semibold ${result.resultStatus === 'Positive' ? 'text-green-600' : 'text-red-600'}`}>{result.resultStatus}</span></div>
                                    <div className="text-gray-500 text-xs mb-1">Report Date: {result.reportDate ? new Date(result.reportDate).toLocaleString() : 'N/A'}</div>
                                    <div className="text-gray-500 text-xs mb-1">Created At: {result.createAt ? new Date(result.createAt).toLocaleString() : 'N/A'}</div>
                                    <div className="text-gray-700 text-sm mb-1">Summary: {result.testSummary || 'N/A'}</div>
                                    <div className="text-gray-700 text-sm mb-1">Raw Data: {result.rawDataPath || 'N/A'}</div>
                                    <div className="text-gray-700 text-sm mb-1">Report URL: {result.reportUrl || 'N/A'}</div>
                                    <div className="text-gray-700 text-sm mb-1">Samples: {result.samples && result.samples.length > 0 ? result.samples.map(s => `${s.sampleName} (${s.sampleStatus})`).join(', ') : 'N/A'}</div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Result ID: {result.resultId}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 rounded-lg bg-blue-400 px-4 py-3 cursor-default hover:shadow-xl group">
                  <h3 className="text-xl font-semibold px-1 text-gray-900  hover:border-100 group-hover:text-black">Order Details</h3>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 rounded-full p-2 transition-colors duration-200 hover:bg-red-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg border border-gray-300 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:border-gray-900 group">
                      <p className="text-sm text-gray-500 px-3 group-hover:text-black">Order ID</p>
                      <p className="font-medium px-3 text-gray-700 group-hover:text-black">{selectedOrder.orderId}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-300 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:border-gray-900 group">
                      <p className="text-sm text-gray-500 px-3 group-hover:text-black">Service</p>
                      <p className="font-medium px-3 text-gray-700 hover:text-black">{selectedOrder.serviceName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-300 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:border-gray-900 group">
                      <p className="text-sm text-gray-500 px-3 group-hover:black">Test Type</p>
                      <p className="font-medium px-3 text-gray-700 group-hover:text-black">{selectedOrder.testType || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-300 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:border-gray-900 group">
                      <p className="text-sm text-gray-500 px-3 group-hover:text-black">Sample Type</p>
                      <p className="font-medium px-3 text-gray-700 group-hover:text-black">{selectedOrder.sampleType || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-300 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:border-gray-900 group">
                      <p className="text-sm text-gray-500 px-3 group-hover:text-black">Participant</p>
                      <p className="font-medium px-3 text-gray-700 group-hover:text-black">{selectedOrder.participantName || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-300 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:border-gray-900 group">
                      <p className="text-sm text-gray-500 px-3 group-hover:text-black">Relationship</p>
                      <p className="font-medium px-3 text-gray-700 group-hover:text-black">{selectedOrder.relationship || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-300 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:border-gray-900 group">
                      <p className="text-sm text-gray-500 px-3 group-hover:text-black">Collection Method</p>
                      <p className="font-medium px-3 text-gray-700 group-hover:text-black">{selectedOrder.collectionMethod || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-300 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:border-gray-900 group">
                      <p className="text-sm text-gray-500 px-3 group-hover:text-black">Payment Method</p>
                      <p className="font-medium px-3 text-gray-700 group-hover:text-black">{selectedOrder.paymentMethod || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-300 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:border-gray-900 group">
                      <p className="text-sm text-gray-500 px-3 group-hover:text-black">Total Amount</p>
                      <p className="font-medium px-3 text-gray-700 group-hover:text-black">{selectedOrder.total != null ? selectedOrder.total.toLocaleString() : 'N/A'} VND</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-300 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:border-gray-900 group">
                      <p className="text-sm text-gray-500 px-3 group-hover:text-black">Status</p>
                      <p className="font-medium px-3 text-gray-700 group-hover:text-black">{selectedOrder.orderStatus || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-300 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:border-gray-900 group">
                      <p className="text-sm text-gray-500 px-3 group-hover:text-black">Created At</p>
                      <p className="font-medium px-3 text-gray-700 group-hover:text-black">{selectedOrder.createAt ? new Date(selectedOrder.createAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Modal */}
          {feedbackModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
                <button 
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300" 
                  onClick={() => setFeedbackModal({ open: false, orderId: null })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h2>
                  <p className="text-gray-600">Help us improve our services</p>
                </div>

                <form onSubmit={async e => {
                  e.preventDefault();
                  setFeedbackLoading(true);
                  setFeedbackMsg('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('https://localhost:7113/api/UserProfile/Feedback', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        orderId: feedbackModal.orderId,
                        name: userProfile.name,
                        rating: feedback.rating,
                        comment: feedback.comment,
                        createAt: new Date().toISOString()
                      })
                    });
                    if (res.ok) {
                      setFeedbackMsg('Thank you for your feedback!');
                      fetchFeedbackList();
                      setTimeout(() => setFeedbackModal({ open: false, orderId: null }), 1500);
                    } else {
                      const err = await res.text();
                      setFeedbackMsg('Error: ' + err);
                    }
                  } catch (err) {
                    setFeedbackMsg('Error: ' + err.message);
                  }
                  setFeedbackLoading(false);
                }} className="space-y-6">
                  
                  {/* Customer Info Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Customer Information</span>
                    </div>
                    <input 
                      type="text" 
                      value={userProfile.name} 
                      disabled 
                      className="w-full bg-white border border-blue-200 rounded-lg p-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  {/* Rating Section */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Rate Your Experience</span>
                    </div>
                    <div className="flex justify-center gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button
                          type="button"
                          key={star}
                          className={`text-3xl transition-all duration-300 transform hover:scale-110 ${
                            feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-full p-1`}
                          onClick={() => setFeedback(f => ({ ...f, rating: star }))}
                          tabIndex={0}
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-sm text-gray-600">
                        {feedback.rating === 0 && 'Select your rating'}
                        {feedback.rating === 1 && 'Poor'}
                        {feedback.rating === 2 && 'Fair'}
                        {feedback.rating === 3 && 'Good'}
                        {feedback.rating === 4 && 'Very Good'}
                        {feedback.rating === 5 && 'Excellent'}
                      </span>
                    </div>
                  </div>

                  {/* Comment Section */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Share Your Thoughts</span>
                    </div>
                    <textarea
                      className="w-full bg-white border border-green-200 rounded-lg p-3 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={4}
                      value={feedback.comment}
                      onChange={e => setFeedback(f => ({ ...f, comment: e.target.value }))}
                      placeholder="Tell us about your experience with our service..."
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      feedbackLoading || feedback.rating === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus:ring-yellow-500 shadow-lg hover:shadow-xl'
                    }`}
                    disabled={feedbackLoading || feedback.rating === 0}
                  >
                    {feedbackLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Feedback...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Submit Feedback
                      </div>
                    )}
                  </button>

                  {/* Message Display */}
                  {feedbackMsg && (
                    <div className={`text-center p-3 rounded-lg font-medium ${
                      feedbackMsg.includes('Thank you') 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {feedbackMsg}
                    </div>
                  )}
                </form>
              </div>
              
              <style>{`
                @keyframes fade-in {
                  from { 
                    opacity: 0; 
                    transform: translateY(20px) scale(0.95); 
                  }
                  to { 
                    opacity: 1; 
                    transform: translateY(0) scale(1); 
                  }
                }
                .animate-fade-in { 
                  animation: fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both; 
                }
              `}</style>
            </div>
          )}

          {/* Feedback Response Modal */}
          {feedbackResponseModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in">
                <button 
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300" 
                  onClick={() => setFeedbackResponseModal({ open: false, feedbacks: [], loading: false, error: '', orderId: null })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedback Response</h2>
                  <p className="text-gray-600">Your feedback and our response</p>
                </div>

                {feedbackResponseModal.loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-purple-600 font-semibold">Loading response...</p>
                  </div>
                ) : feedbackResponseModal.error ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-red-600 font-semibold">{feedbackResponseModal.error}</p>
                  </div>
                ) : (() => {
                  const feedback = feedbackList.find(fb => fb.orderId === feedbackResponseModal.orderId);
                  if (!feedback) {
                    return (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-semibold">No feedback found for this order.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {/* Customer Feedback Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Your Feedback</h3>
                            <p className="text-sm text-gray-600">Submitted on {new Date(feedback.createAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Customer:</span>
                            <span className="text-sm text-gray-900 font-semibold">{feedback.name}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Rating:</span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`h-5 w-5 ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              ))}
                              <span className="ml-2 text-sm font-semibold text-gray-900">({feedback.rating}/5)</span>
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-700 block mb-2">Comment:</span>
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <p className="text-gray-900 italic">"{feedback.comment}"</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Staff Response Section */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Staff Response</h3>
                            <p className="text-sm text-gray-600">Our team's reply to your feedback</p>
                          </div>
                        </div>

                        {feedback.contentResponses && feedback.contentResponses.length > 0 ? (
                          <div className="space-y-3">
                            {feedback.contentResponses.map((response, index) => (
                              <div key={index} className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 mr-3">
                                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                                      <span className="text-xs text-white font-bold">{index + 1}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-gray-900 leading-relaxed mb-2">{response}</p>
                                    <div className="flex items-center text-xs text-gray-500">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span>Response #{index + 1}</span>
                                      <span className="mx-2">•</span>
                                      <span>Staff Team</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-gray-500 font-medium">Response is being prepared</p>
                            <p className="text-sm text-gray-400 mt-1">Our team will respond soon</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              <style>{`
                @keyframes fade-in {
                  from { 
                    opacity: 0; 
                    transform: translateY(20px) scale(0.95); 
                  }
                  to { 
                    opacity: 1; 
                    transform: translateY(0) scale(1); 
                  }
                }
                .animate-fade-in { 
                  animation: fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both; 
                }
              `}</style>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
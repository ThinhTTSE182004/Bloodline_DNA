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
      const res = await fetch('https://localhost:7113/api/UserProfile/FeedbackList', {
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
                const feedbackForOrder = feedbackList.find(fb => fb.orderId === order.orderId);
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
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                            onClick={e => { e.stopPropagation(); setFeedbackModal({ open: true, orderId: order.orderId }); setFeedback({ rating: 0, comment: '' }); setFeedbackMsg(''); }}
                          >
                            Feedback
                          </button>
                          <button
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-60"
                            disabled={!feedbackList.find(fb => fb.orderId === order.orderId)}
                            onClick={async e => {
                              e.stopPropagation();
                              const found = feedbackList.find(fb => fb.orderId === order.orderId);
                              if (!found) {
                                setFeedbackResponseModal({ open: true, feedbacks: [], loading: false, error: 'You have not submitted feedback for this order.', orderId: order.orderId });
                                return;
                              }
                              setFeedbackResponseModal({ open: true, feedbacks: [], loading: true, error: '', orderId: order.orderId });
                              try {
                                const token = localStorage.getItem('token');
                                const res = await fetch(`https://localhost:7113/api/UserProfile/FeedbackResponse/${found.feedbackId}`, {
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  }
                                });
                                if (!res.ok) throw new Error('Failed to fetch feedback response');
                                const data = await res.json();
                                setFeedbackResponseModal({ open: true, feedbacks: data, loading: false, error: '', orderId: order.orderId });
                              } catch {
                                setFeedbackResponseModal({ open: true, feedbacks: [], loading: false, error: 'Error loading response', orderId: order.orderId });
                              }
                            }}
                          >
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
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative animate-fade-in">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setFeedbackModal({ open: false, orderId: null })}>&times;</button>
                <h2 className="text-xl font-bold mb-4 text-center text-yellow-600">Order Feedback</h2>
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
                }} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Your Name</label>
                    <input type="text" value={userProfile.name} disabled className="w-full border p-2 rounded bg-gray-100" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Rating</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button
                          type="button"
                          key={star}
                          className={`text-2xl ${feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'} focus:outline-none`}
                          onClick={() => setFeedback(f => ({ ...f, rating: star }))}
                          tabIndex={0}
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Comment</label>
                    <textarea
                      className="w-full border p-2 rounded"
                      rows={3}
                      value={feedback.comment}
                      onChange={e => setFeedback(f => ({ ...f, comment: e.target.value }))}
                      placeholder="Share your experience..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition font-semibold disabled:opacity-60"
                    disabled={feedbackLoading || feedback.rating === 0}
                  >
                    {feedbackLoading ? 'Sending...' : 'Submit Feedback'}
                  </button>
                  {feedbackMsg && <div className="mt-2 text-center text-yellow-700">{feedbackMsg}</div>}
                </form>
              </div>
              <style>{`
                @keyframes fade-in {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
              `}</style>
            </div>
          )}

          {/* Feedback Response Modal */}
          {feedbackResponseModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative animate-fade-in">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setFeedbackResponseModal({ open: false, feedbacks: [], loading: false, error: '', orderId: null })}>&times;</button>
                <h2 className="text-xl font-bold mb-4 text-center text-purple-700 flex items-center justify-center">
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-7 h-7 mr-2 text-purple-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2M15 3h-6a2 2 0 00-2 2v3a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z' /></svg>
                  Feedback Response
                </h2>
                {feedbackResponseModal.loading ? (
                  <div className="text-center py-8 text-purple-600 font-semibold">Loading...</div>
                ) : feedbackResponseModal.error ? (
                  <div className="text-center text-red-600 py-8">{feedbackResponseModal.error}</div>
                ) : feedbackResponseModal.feedbacks.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No response yet.</div>
                ) : (
                  <ul className="space-y-4">
                    {feedbackResponseModal.feedbacks.map((resp, idx) => (
                      <li key={idx} className="bg-purple-50 border-l-4 border-purple-400 rounded-lg p-4 flex items-start gap-2 shadow">
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6 text-purple-500 flex-shrink-0 mt-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2' /></svg>
                        <span className="text-gray-800 text-base">{resp}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <style>{`
                @keyframes fade-in {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
              `}</style>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;

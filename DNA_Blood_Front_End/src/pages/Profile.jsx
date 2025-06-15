import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import signalRService from '../services/signalRService.js';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
        name: tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || data.name,
        email: tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || data.email,
        phone: tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone'] || data.phone,
        updatedAt: data.updatedAt
      };

      console.log('Combined profile data:', profileData);

      if (!profileData.name || !profileData.email || !profileData.phone) {
        throw new Error('Invalid profile data received');
      }

      setUserProfile(profileData);
      setLoading(false);
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

      const data = await response.json();
      setOrderHistory(data);
    } catch (err) {
      console.error('Error fetching order history:', err);
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
      setSelectedOrder(data);
    } catch (err) {
      console.error('Error fetching order detail:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchOrderHistory();
    setupSignalR();

    // Cleanup function
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
        <Footer />
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* User Profile Card */}
          <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 transform transition-all duration-300 hover:shadow-xl">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl transform transition-all duration-300 hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              </div>
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{userProfile.name}</h1>
                <p className="text-gray-600 flex items-center justify-center md:justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2 text-blue-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  Last updated: {new Date(userProfile.updatedAt).toLocaleDateString()}
                </p>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                  <Link 
                    to="/settings"
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
          <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 transform transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
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
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-gray-900 font-medium">{userProfile.email}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg transform transition-all duration-300 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-3 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0-1.036.84-1.875 1.875-1.875h16.5c1.035 0 1.875.84 1.875 1.875v10.5a1.875 1.875 0 0 1-1.875 1.875H4.125A1.875 1.875 0 0 1 2.25 17.25V6.75Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 0 3 3m-3-3-3 3M12 18.75h.008v.008H12v-.008Z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-900 font-medium">{userProfile.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order History Section */}
          <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 transform transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-2 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
              Order History
            </h2>
            <div className="space-y-4">
              {orderHistory.map((order) => (
                <div 
                  key={order.orderId}
                  className="w-full h-[100px] bg-gray-50 rounded-lg p-4 cursor-pointer transform transition-all duration-300 hover:bg-gray-100 hover:shadow-md"
                  onClick={() => fetchOrderDetail(order.orderId)}
                >
                  <div className="flex justify-between items-center h-full">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{order.serviceName}</h3>
                      <p className="text-sm text-gray-600">Order ID: {order.orderId}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.orderStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                      <p className="mt-2 text-lg font-semibold text-blue-600">
                        {order.totalAmount.toLocaleString()} VND
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-medium">{selectedOrder.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-medium">{selectedOrder.serviceName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Test Type</p>
                      <p className="font-medium">{selectedOrder.testType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sample Type</p>
                      <p className="font-medium">{selectedOrder.sampleType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Participant</p>
                      <p className="font-medium">{selectedOrder.participantName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Relationship</p>
                      <p className="font-medium">{selectedOrder.relationship}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Collection Method</p>
                      <p className="font-medium">{selectedOrder.collectionMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">{selectedOrder.total.toLocaleString()} VND</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{selectedOrder.orderStatus}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;

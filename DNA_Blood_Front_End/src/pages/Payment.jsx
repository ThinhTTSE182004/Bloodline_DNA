import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { FaClipboardList, FaMoneyBillWave, FaUniversity, FaCreditCard, FaCheckCircle, FaUser, FaTransgender, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaUserFriends } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('bankTransfer');
  const [orderSummary, setOrderSummary] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  useEffect(() => {
    // Load user details from localStorage (from FillBookingForm)
    const storedUserDetails = JSON.parse(localStorage.getItem('bookingFormData')) || {};
    setUserDetails(storedUserDetails);

    // Ưu tiên lấy selectedServices từ bookingFormData, fallback sang cartItems nếu không có
    let selected = [];
    if (storedUserDetails.selectedServices && Array.isArray(storedUserDetails.selectedServices)) {
      selected = storedUserDetails.selectedServices;
    } else {
      selected = JSON.parse(localStorage.getItem('cart')) || [];
    }
    setOrderSummary(selected);

    if (!selected || selected.length === 0) {
      alert('No services selected for payment. Redirecting to cart.');
      navigate('/cart');
    }
  }, [navigate]);

  const calculateTotalAmount = () => {
    return orderSummary.reduce((total, item) => total + item.price, 0).toFixed(0); // VND usually no decimals
  };

  const handleConfirmPayment = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to continue');
        navigate('/login');
        return;
      }

      // Get user ID from token
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const customerId = parseInt(tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);

      // Debug log user details
      console.log('User Details:', userDetails);

      // Map gender to sex
      const genderMap = {
        'male': 'Male',
        'female': 'Female',
        'other': 'Other'
      };

      // Map relationship values
      const relationshipMap = {
        'self': 'Self',
        'child': 'Child',
        'parent': 'Parent',
        'sibling': 'Sibling',
        'other': 'Other'
      };

      // Prepare order data according to API format
      const orderData = {
        customerId: customerId,
        participant: {
          fullName: userDetails.fullName || '',
          sex: genderMap[userDetails.gender?.toLowerCase()] || 'Male',
          birthDate: userDetails.dateOfBirth || '',
          phone: parseInt(userDetails.phoneNumber?.replace(/\D/g, '')) || 0,
          relationship: relationshipMap[userDetails.relationshipToPatient?.toLowerCase()] || 'Self',
          nameRelation: userDetails.relatedPersonName || ''
        },
        details: orderSummary.map(item => ({
          servicePackageId: parseInt(item.servicePackageId || item.id)
        })),
        payment: {
          paymentMethod: paymentMethod === 'bankTransfer' ? 'Bank Transfer' : 'Cash on Delivery',
          total: parseInt(calculateTotalAmount().replace(/\D/g, ''))
        },
        testTypeName: userDetails.testType || 'Civil',
        sampleTypeName: userDetails.sampleType || 'Blood',
        methodTypeName: userDetails.sampleCollectionMethod || 'At Medical Center'
      };

      // Debug log order data
      console.log('Order Data:', orderData);

      // Call API to create order with authentication token
      const response = await fetch('https://localhost:7113/api/Order/CreateOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || 'Failed to create order');
      }

      const responseData = await response.json();
      console.log('API Success Response:', responseData);

      // Lấy danh sách các service đã thanh toán (orderSummary)
      const paidIds = orderSummary.map(item => item.servicePackageId || item.id);

      // Lấy lại cartItems gốc
      const allCart = JSON.parse(localStorage.getItem('cart')) || [];
      // Giữ lại các service chưa thanh toán
      const newCart = allCart.filter(item => !paidIds.includes(item.servicePackageId || item.id));
      localStorage.setItem('cart', JSON.stringify(newCart));
      refreshCart();

      // Lưu thông tin thanh toán vào sessionStorage trước khi xóa bookingFormData
      const paymentInfo = {
        ...userDetails,
        selectedServices: orderSummary,
        paymentMethod,
        paymentDate: new Date().toISOString(),
        orderId: `ORD${Date.now().toString().slice(-6)}`
      };
      sessionStorage.setItem('lastPaidBooking', JSON.stringify(paymentInfo));

      // Xóa thông tin bookingFormData
      localStorage.removeItem('bookingFormData');
      
      // Chuyển hướng sang trang PaymentSuccess
      navigate('/payment-success');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.message || 'Failed to create order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-blue-100 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-2 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Information Card */}
          <div className="bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center mb-8 transition-transform duration-300 hover:scale-105 hover:shadow-2xl group">
            <h2 className="text-2xl font-extrabold text-blue-600 mb-6 text-center tracking-wide group-hover:text-blue-700 transition-colors duration-300">CONFIRM USER INFORMATION</h2>
            <div className="w-full max-w-md space-y-4 text-gray-700">
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaUser className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Full Name:</span>
                <span className="ml-2 flex-1 truncate">{userDetails.fullName}</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaEnvelope className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Email:</span>
                <span className="ml-2 flex-1 truncate">{userDetails.email}</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaPhone className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Phone Number:</span>
                <span className="ml-2 flex-1 truncate">{userDetails.phoneNumber}</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaMapMarkerAlt className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Address:</span>
                <span className="ml-2 flex-1 truncate">{userDetails.address}</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaCalendarAlt className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Date of Birth:</span>
                <span className="ml-2 flex-1 truncate">{userDetails.dateOfBirth}</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaTransgender className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Gender:</span>
                <span className="ml-2 flex-1 capitalize">{userDetails.gender}</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaUsers className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Relationship:</span>
                <span className="ml-2 flex-1 capitalize">{userDetails.relationshipToPatient}</span>
              </div>
              {userDetails.relationshipToPatient !== 'self' && userDetails.relationshipToPatient !== '' && (
                <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                  <FaUserFriends className="mr-3 text-blue-500 text-xl" />
                  <span className="font-semibold w-36">Related Person:</span>
                  <span className="ml-2 flex-1 truncate">{userDetails.relatedPersonName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white shadow-xl rounded-2xl p-8 flex flex-col mb-8 transition-transform duration-300 hover:scale-105 hover:shadow-2xl group">
            <h1 className="text-2xl font-extrabold text-blue-600 mb-6 text-center tracking-wide group-hover:text-blue-700 transition-colors duration-300">PAYMENT INFORMATION</h1>
            {/* Order Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-600 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wider">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderSummary.map((item) => (
                      <tr key={item.servicePackageId || item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.serviceName || item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{(item.price || 0).toLocaleString()} VND</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-300 bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-blue-600 text-right">{calculateTotalAmount()} VND</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Select Payment Method */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Select Payment Method</h2>
              <div className="space-y-4">
                <label className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${paymentMethod === 'bankTransfer' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bankTransfer"
                    checked={paymentMethod === 'bankTransfer'}
                    onChange={() => setPaymentMethod('bankTransfer')}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <FaUniversity className="w-6 h-6 text-blue-600" />
                  <span className="text-lg text-gray-800 font-semibold">Bank Transfer</span>
                </label>
                <label className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${paymentMethod === 'cashOnDelivery' ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cashOnDelivery"
                    checked={paymentMethod === 'cashOnDelivery'}
                    onChange={() => setPaymentMethod('cashOnDelivery')}
                    className="form-radio h-5 w-5 text-green-600"
                  />
                  <FaMoneyBillWave className="w-6 h-6 text-green-600" />
                  <span className="text-lg text-gray-800 font-semibold">Cash on Delivery</span>
                </label>
              </div>
            </div>

            {/* Bank Account Information (Conditional) */}
            {paymentMethod === 'bankTransfer' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 mb-8 animate-fade-in">
                <h3 className="font-bold text-lg mb-2">Bank Account Information</h3>
                <p><strong>Bank:</strong> BIDV</p>
                <p><strong>Account Number:</strong> 123456789</p>
                <p><strong>Account Holder:</strong> DNA TESTING COMPANY LIMITED</p>
                <p className="mt-2 text-sm">Note: Please include your Order ID in the transfer note</p>
              </div>
            )}

            {/* Confirm Payment Button */}
            <div className="flex justify-center">
              <button
                onClick={handleConfirmPayment}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-bold rounded-full shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <FaCheckCircle className="w-5 h-5 mr-2" />
                CONFIRM PAYMENT
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaMoneyBillWave, FaUniversity, FaCheckCircle, FaUser, FaTransgender, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaUserFriends } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useServices } from '../../context/ServiceContext';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('bankTransfer');
  const [orderSummary, setOrderSummary] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { services } = useServices();

  useEffect(() => {
    const storedBookingData = JSON.parse(localStorage.getItem('bookingFormData'));

    if (!storedBookingData || !storedBookingData.details || storedBookingData.details.length === 0) {
      alert('No booking information found. Redirecting...');
      navigate('/services');
      return;
    }
    
    setBookingData(storedBookingData);

    if (services.length > 0) {
        const summary = storedBookingData.details.map(detail => 
            services.find(s => String(s.servicePackageId) === String(detail.servicePackageId))
        ).filter(Boolean);
        setOrderSummary(summary);
    }
  }, [navigate, services]);

  const calculateTotalAmount = () => {
    if (!bookingData) return '0';
    return bookingData.payment.total.toLocaleString();
  };

  const handleConfirmPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to continue');
        navigate('/login');
        return;
      }
      
      if (!bookingData) {
        alert('Booking information is missing.');
        return;
      }

      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const customerId = parseInt(tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);

      const paymentMethodMap = {
        'bankTransfer': 'BankTransfer',
        'cashOnDelivery': 'CashOnDelivery'
      };

      const finalOrderData = {
        ...bookingData,
        customerId: customerId,
        payment: {
          ...bookingData.payment,
          paymentMethod: paymentMethodMap[paymentMethod]
        },
      };

      console.log('Final Order Data to be sent:', JSON.stringify(finalOrderData, null, 2));

      const response = await fetch('https://localhost:7113/api/Order/CreateOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalOrderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || 'Failed to create order');
      }

      const responseData = await response.json();
      console.log('API Success Response:', responseData);

      const paidIds = orderSummary.map(item => item.servicePackageId);
      const allCart = JSON.parse(localStorage.getItem('cart')) || [];
      const newCart = allCart.filter(item => !paidIds.includes(item.servicePackageId));
      localStorage.setItem('cart', JSON.stringify(newCart));
      refreshCart();
      
      sessionStorage.setItem('lastPaidBooking', JSON.stringify({
        ...bookingData,
        ...bookingData.participant,
        selectedServices: orderSummary,
        paymentMethod,
        paymentDate: new Date().toISOString(),
        orderId: responseData.orderId || `ORD${Date.now().toString().slice(-6)}`
      }));

      localStorage.removeItem('bookingFormData');
      
      navigate('/payment-success');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.message || 'Failed to create order. Please try again.');
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading booking details...</p>
      </div>
    );
  }

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
                <span className="ml-2 flex-1 truncate">{bookingData.participant.fullName}</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaEnvelope className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Email:</span>
                <span className="ml-2 flex-1 truncate">{bookingData.email || 'N/A'}</span>
              </div>
              {/* Booking Date */}
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaCalendarAlt className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Booking Date:</span>
                <span className="ml-2 flex-1 truncate">{bookingData.bookingDate ? new Date(bookingData.bookingDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaPhone className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Phone Number:</span>
                <span className="ml-2 flex-1 truncate">{bookingData.participant.phone}</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaMapMarkerAlt className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Address:</span>
                <span className="ml-2 flex-1 truncate">{bookingData.deliveryAddress || 'N/A'}</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaCalendarAlt className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Date of Birth:</span>
                <span className="ml-2 flex-1 truncate">{bookingData.participant.birthDate}</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaTransgender className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Gender:</span>
                <span className="ml-2 flex-1 capitalize">{bookingData.participant.sex}</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                <FaUsers className="mr-3 text-blue-500 text-xl" />
                <span className="font-semibold w-36">Relationship:</span>
                <span className="ml-2 flex-1 capitalize">{bookingData.participant.relationship}</span>
              </div>
              {bookingData.participant.relationship !== 'self' && bookingData.participant.relationship !== '' && (
                <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3 group-hover:bg-blue-50 transition-colors duration-300">
                  <FaUserFriends className="mr-3 text-blue-500 text-xl" />
                  <span className="font-semibold w-36">Related Person:</span>
                  <span className="ml-2 flex-1 truncate">{bookingData.participant.nameRelation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white shadow-xl rounded-2xl p-8 flex flex-col mb-8 transition-transform duration-300 hover:scale-105 hover:shadow-2xl group">
            <h1 className="text-2xl font-extrabold text-blue-600 mb-6 text-center tracking-wide group-hover:text-blue-700 transition-colors duration-300 cursor-default">PAYMENT INFORMATION</h1>
            {/* Order Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 cursor-default group-hover:text-black">Order Summary</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-600 uppercase tracking-wider cursor-default group-hover:text-blue-700">Service</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wider cursor-default group-hover:text-blue-700">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderSummary.map((item) => (
                      <tr key={item.servicePackageId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.serviceName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{item.price.toLocaleString()} VND</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-300 bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900 cursor-default group-hover:text-black">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-blue-600 text-right cursor-default group-hover:text-blue-700">{calculateTotalAmount()} VND</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Select Payment Method */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 cursor-default">Select Payment Method</h2>
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
    </div>
  );
};

export default Payment;

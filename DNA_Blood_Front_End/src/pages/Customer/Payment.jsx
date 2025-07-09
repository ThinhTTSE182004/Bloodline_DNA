import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaMoneyBillWave, FaUniversity, FaCheckCircle, FaUser, FaTransgender, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaUserFriends } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useServices } from '../../context/ServiceContext';
import { motion } from 'framer-motion';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('bankTransfer');
  const [orderSummary, setOrderSummary] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { services } = useServices();

  useEffect(() => {
          const storedBookingData = JSON.parse(sessionStorage.getItem('bookingFormData'));

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
      const token = sessionStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('token');
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
      const allCart = JSON.parse(sessionStorage.getItem('cart')) || [];
      const newCart = allCart.filter(item => !paidIds.includes(item.servicePackageId));
      sessionStorage.setItem('cart', JSON.stringify(newCart));
      refreshCart();
      
      sessionStorage.setItem('lastPaidBooking', JSON.stringify({
        ...bookingData,
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center mb-8 hover:scale-105 hover:shadow-2xl group">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-2xl font-extrabold text-blue-600 mb-6 text-center tracking-wide group-hover:text-blue-700 transition-colors duration-300 cursor-default">
                CONFIRM USER INFORMATION
            </motion.h2>
            <div className="w-full max-w-md space-y-4 text-gray-700 group-hover:text-gray-900">
              {/* Main Participant */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-blue-50 rounded-lg p-4 mb-4">
                <motion.h3 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="font-bold text-blue-700 mb-3">
                    Main Participant (Person Taking the Test)
                </motion.h3>
                {bookingData.participants && bookingData.participants.length > 0 && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="flex items-center bg-white rounded-lg px-4 py-3 mb-2">
                      <FaUser className="mr-3 text-blue-500 text-xl" />
                      <span className="font-semibold w-36">Full Name:</span>
                      <span className="ml-2 flex-1 truncate">{bookingData.participants[0].fullName}</span>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="flex items-center bg-white rounded-lg px-4 py-3 mb-2">
                      <FaPhone className="mr-3 text-blue-500 text-xl" />
                      <span className="font-semibold w-36">Phone:</span>
                      <span className="ml-2 flex-1 truncate">{bookingData.participants[0].phone}</span>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="flex items-center bg-white rounded-lg px-4 py-3 mb-2">
                      <FaCalendarAlt className="mr-3 text-blue-500 text-xl" />
                      <span className="font-semibold w-36">Date of Birth:</span>
                      <span className="ml-2 flex-1 truncate">{bookingData.participants[0].birthDate}</span>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                      className="flex items-center bg-white rounded-lg px-4 py-3">
                      <FaTransgender className="mr-3 text-blue-500 text-xl" />
                      <span className="font-semibold w-36">Gender:</span>
                      <span className="ml-2 flex-1 capitalize">{bookingData.participants[0].sex}</span>
                    </motion.div>
                  </>
                )}
              </motion.div>

              {/* Related Participant */}
              {bookingData.participants && bookingData.participants.length > 1 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="bg-green-50 rounded-lg p-4 mb-4">
                  <motion.h3 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="font-bold text-green-700 mb-3">
                      Related Participant (Person Booking)
                  </motion.h3>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="flex items-center bg-white rounded-lg px-4 py-3 mb-2">
                    <FaUser className="mr-3 text-green-500 text-xl" />
                    <span className="font-semibold w-36">Full Name:</span>
                    <span className="ml-2 flex-1 truncate">{bookingData.participants[1].fullName}</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1.1 }}
                    className="flex items-center bg-white rounded-lg px-4 py-3 mb-2">
                    <FaPhone className="mr-3 text-green-500 text-xl" />
                    <span className="font-semibold w-36">Phone:</span>
                    <span className="ml-2 flex-1 truncate">{bookingData.participants[1].phone}</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="flex items-center bg-white rounded-lg px-4 py-3 mb-2">
                    <FaCalendarAlt className="mr-3 text-green-500 text-xl" />
                    <span className="font-semibold w-36">Date of Birth:</span>
                    <span className="ml-2 flex-1 truncate">{bookingData.participants[1].birthDate}</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1.3 }}
                    className="flex items-center bg-white rounded-lg px-4 py-3">
                    <FaTransgender className="mr-3 text-green-500 text-xl" />
                    <span className="font-semibold w-36">Gender:</span>
                    <span className="ml-2 flex-1 capitalize">{bookingData.participants[1].sex}</span>
                  </motion.div>
                </motion.div>
              )}

              {/* Booking Information */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="bg-gray-50 rounded-lg p-4">
                <motion.h3 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="font-bold text-gray-700 mb-3">
                    Booking Information
                </motion.h3>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="flex items-center bg-white rounded-lg px-4 py-3 mb-2">
                  <FaCalendarAlt className="mr-3 text-gray-500 text-xl" />
                  <span className="font-semibold w-36">Booking Date:</span>
                  <span className="ml-2 flex-1 truncate">{bookingData.bookingDate ? new Date(bookingData.bookingDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</span>
                </motion.div>
                {bookingData.deliveryAddress && bookingData.deliveryAddress !== 'N/A' && (
                  <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                    className="flex items-center bg-white rounded-lg px-4 py-3">
                    <FaMapMarkerAlt className="mr-3 text-gray-500 text-xl" />
                    <span className="font-semibold w-36">Address:</span>
                    <span className="ml-2 flex-1 truncate">{bookingData.deliveryAddress}</span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Payment Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white shadow-xl rounded-2xl p-8 flex flex-col mb-8 hover:scale-105 hover:shadow-2xl group">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-2xl font-extrabold text-blue-600 mb-6 text-center tracking-wide group-hover:text-blue-700 transition-colors duration-300 cursor-default">
                PAYMENT INFORMATION
            </motion.h1>
            {/* Order Summary */}
            <div className="mb-8">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl font-bold text-gray-800 mb-4 cursor-default group-hover:text-black">
                  Order Summary
              </motion.h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <motion.table 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="min-w-full divide-y divide-gray-200 rounded-lg">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-600 uppercase tracking-wider cursor-default group-hover:text-blue-700">Service</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wider cursor-default group-hover:text-blue-700">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderSummary.map((item) => (
                      <tr key={item.servicePackageId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-default group-hover:text-black">{item.serviceName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right cursor-default group-hover:text-gray-800">{item.price.toLocaleString()} VND</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-300 bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900 cursor-default group-hover:text-black">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-blue-600 text-right cursor-default group-hover:text-blue-700">{calculateTotalAmount()} VND</td>
                    </tr>
                  </tbody>
                </motion.table>
              </div>
            </div>

            {/* Select Payment Method */}
            <div className="mb-8">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl font-bold text-gray-800 mb-4 cursor-default">
                  Select Payment Method
              </motion.h2>
              <div className="space-y-4">
                <motion.label 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'bankTransfer' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
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
                </motion.label>
                <motion.label 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'cashOnDelivery' ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}>
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
                </motion.label>
              </div>
            </div>

            {/* Bank Account Information (Conditional) */}
            {paymentMethod === 'bankTransfer' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 mb-8 animate-fade-in">
                <motion.h3 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="font-bold text-lg mb-2">
                    Bank Account Information
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}>
                    <strong>Bank:</strong> BIDV
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}>
                    <strong>Account Number:</strong> 123456789
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}>
                    <strong>Account Holder:</strong> DNA TESTING COMPANY LIMITED
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="mt-2 text-sm">
                    Note: Please include your Order ID in the transfer note
                </motion.p>
              </motion.div>
            )}

            {/* Confirm Payment Button */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex justify-center">
              <button
                onClick={handleConfirmPayment}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-bold rounded-full shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <FaCheckCircle className="w-5 h-5 mr-2" />
                CONFIRM PAYMENT
              </button>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Payment;

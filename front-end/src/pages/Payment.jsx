import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { FaClipboardList, FaMoneyBillWave, FaUniversity, FaCreditCard, FaCheckCircle, FaUser, FaTransgender, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaUserFriends } from 'react-icons/fa';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('bankTransfer');
  const [orderSummary, setOrderSummary] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Load order summary (cart items) from localStorage
    const storedOrderSummary = JSON.parse(localStorage.getItem('cartItems')) || [];
    setOrderSummary(storedOrderSummary);

    // Load user details from localStorage (from FillBookingForm)
    const storedUserDetails = JSON.parse(localStorage.getItem('bookingFormData')) || {};
    setUserDetails(storedUserDetails);

    if (storedOrderSummary.length === 0) {
      alert('No services selected for payment. Redirecting to cart.');
      navigate('/cart');
    }
  }, [navigate]);

  const calculateTotalAmount = () => {
    return orderSummary.reduce((total, item) => total + item.price, 0).toFixed(0); // VND usually no decimals
  };

  const handleConfirmPayment = () => {
    console.log('Confirming payment with method:', paymentMethod);
    console.log('Order Summary:', orderSummary);
    console.log('User Details:', userDetails);

    // TODO: Tích hợp API xử lý thanh toán thực tế
    /*
    fetch('/api/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethod,
        orderSummary,
        userDetails,
        totalAmount: calculateTotalAmount(),
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Payment confirmed successfully!');
        localStorage.removeItem('cartItems');
        localStorage.removeItem('bookingFormData');
        navigate('/order-confirmation'); // Redirect to a success page
      } else {
        alert('Payment failed: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error confirming payment:', error);
      alert('An error occurred during payment confirmation.');
    });
    */

    alert('Payment confirmed successfully (simulated)!');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('bookingFormData');
    navigate('/payment-success'); // Simulate redirect to new path
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* User Information Confirmation (Left Column) */}
          <div className="bg-white shadow rounded-lg p-6 md:p-8" style={{ borderRadius: '5px' }}>
            <h2 className="text-2xl font-extrabold text-blue-600 mb-6 text-center">CONFIRM USER INFORMATION</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-center"><FaUser className="mr-3 text-blue-500" /><strong>Full Name:</strong> <span className="ml-2">{userDetails.fullName}</span></div>
              <div className="flex items-center"><FaEnvelope className="mr-3 text-blue-500" /><strong>Email:</strong> <span className="ml-2">{userDetails.email}</span></div>
              <div className="flex items-center"><FaPhone className="mr-3 text-blue-500" /><strong>Phone Number:</strong> <span className="ml-2">{userDetails.phoneNumber}</span></div>
              <div className="flex items-center"><FaMapMarkerAlt className="mr-3 text-blue-500" /><strong>Address:</strong> <span className="ml-2">{userDetails.address}</span></div>
              <div className="flex items-center"><FaCalendarAlt className="mr-3 text-blue-500" /><strong>Date of Birth:</strong> <span className="ml-2">{userDetails.dateOfBirth}</span></div>
              <div className="flex items-center"><FaTransgender className="mr-3 text-blue-500" /><strong>Gender:</strong> <span className="ml-2">{userDetails.gender}</span></div>
              <div className="flex items-center"><FaUsers className="mr-3 text-blue-500" /><strong>Relationship to Patient:</strong> <span className="ml-2">{userDetails.relationshipToPatient}</span></div>
              {userDetails.relationshipToPatient !== 'self' && userDetails.relationshipToPatient !== '' && (
                <div className="flex items-center"><FaUserFriends className="mr-3 text-blue-500" /><strong>Related Person's Name:</strong> <span className="ml-2">{userDetails.relatedPersonName}</span></div>
              )}
            </div>
          </div>

          {/* Payment Information (Right Column) */}
          <div className="bg-white shadow rounded-lg p-6 md:p-8" style={{ borderRadius: '5px' }}>
            <h1 className="text-2xl font-extrabold text-blue-600 mb-6 text-center">PAYMENT INFORMATION</h1>

            {/* Order Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderSummary.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{item.price.toFixed(0)} VND</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-300">
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
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bankTransfer"
                    checked={paymentMethod === 'bankTransfer'}
                    onChange={() => setPaymentMethod('bankTransfer')}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <FaUniversity className="w-6 h-6 text-blue-600" />
                  <span className="text-lg text-gray-800">Bank Transfer</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cashOnDelivery"
                    checked={paymentMethod === 'cashOnDelivery'}
                    onChange={() => setPaymentMethod('cashOnDelivery')}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <FaMoneyBillWave className="w-6 h-6 text-green-600" />
                  <span className="text-lg text-gray-800">Cash on Delivery</span>
                </label>
              </div>
            </div>

            {/* Bank Account Information (Conditional) */}
            {paymentMethod === 'bankTransfer' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 mb-8">
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
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

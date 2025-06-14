import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaTransgender, FaUsers, FaUserFriends, FaChevronDown, FaChevronUp, FaReceipt, FaShoppingBag } from 'react-icons/fa';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [services, setServices] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [orderId] = useState(() => `ORD${Date.now().toString().slice(-6)}`);

  useEffect(() => {
    // Ưu tiên lấy từ sessionStorage trước
    const sessionBooking = JSON.parse(sessionStorage.getItem('lastPaidBooking'));
    if (sessionBooking) {
      setUserDetails(sessionBooking);
      setServices(sessionBooking.selectedServices || []);
      return;
    }

    // Nếu không có trong sessionStorage, thử lấy từ localStorage
    const booking = JSON.parse(localStorage.getItem('bookingFormData'));
    if (booking) {
      setUserDetails(booking);
      setServices(booking.selectedServices || []);
      // Lưu vào sessionStorage để giữ lại thông tin
      sessionStorage.setItem('lastPaidBooking', JSON.stringify(booking));
    }

    // Redirect về home sau 60s
    const timer = setTimeout(() => {
      navigate('/');
    }, 60000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Thêm useEffect để log thông tin debug
  useEffect(() => {
    console.log('User Details:', userDetails);
    console.log('Services:', services);
  }, [userDetails, services]);

  const calculateTotal = () => {
    return services.reduce((total, item) => total + (item.price || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-8 md:p-12 text-center max-w-2xl w-full" style={{ borderRadius: '5px' }}>
          <FaCheckCircle className="text-green-500 w-20 h-20 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Payment Successful!</h1>
          <p className="text-gray-700 text-lg mb-6">
            Your order has been placed successfully. Thank you for your purchase!
          </p>

          {userDetails ? (
            <div className="mb-6">
              {/* Order Summary Dropdown Header */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-blue-50 rounded-lg p-4 flex items-center justify-between hover:bg-blue-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <FaReceipt className="text-blue-600 text-2xl" />
                  <div className="text-left">
                    <div className="font-bold text-blue-600">Order #{orderId}</div>
                    <div className="text-sm text-gray-600">
                      {services.length} {services.length === 1 ? 'service' : 'services'} • Total: {calculateTotal().toLocaleString()} VND
                    </div>
                  </div>
                </div>
                {isExpanded ? <FaChevronUp className="text-blue-600" /> : <FaChevronDown className="text-blue-600" />}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 space-y-6 animate-fade-in">
                  {/* User Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
                      <FaUser className="mr-2" /> User Information
                    </h2>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex items-center"><FaUser className="mr-2 text-blue-500" /><span className="font-semibold w-32 inline-block">Full Name:</span> {userDetails.fullName}</div>
                      <div className="flex items-center"><FaEnvelope className="mr-2 text-blue-500" /><span className="font-semibold w-32 inline-block">Email:</span> {userDetails.email}</div>
                      <div className="flex items-center"><FaPhone className="mr-2 text-blue-500" /><span className="font-semibold w-32 inline-block">Phone:</span> {userDetails.phoneNumber}</div>
                      <div className="flex items-center"><FaMapMarkerAlt className="mr-2 text-blue-500" /><span className="font-semibold w-32 inline-block">Address:</span> {userDetails.address}</div>
                      <div className="flex items-center"><FaCalendarAlt className="mr-2 text-blue-500" /><span className="font-semibold w-32 inline-block">Date of Birth:</span> {userDetails.dateOfBirth}</div>
                      <div className="flex items-center"><FaTransgender className="mr-2 text-blue-500" /><span className="font-semibold w-32 inline-block">Gender:</span> {userDetails.gender}</div>
                      <div className="flex items-center"><FaUsers className="mr-2 text-blue-500" /><span className="font-semibold w-32 inline-block">Relationship:</span> {userDetails.relationshipToPatient}</div>
                      {userDetails.relationshipToPatient !== 'self' && userDetails.relationshipToPatient !== '' && (
                        <div className="flex items-center"><FaUserFriends className="mr-2 text-blue-500" /><span className="font-semibold w-32 inline-block">Related Person:</span> {userDetails.relatedPersonName}</div>
                      )}
                    </div>
                  </div>

                  {/* Services Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
                      <FaShoppingBag className="mr-2" /> Services Paid
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 rounded-lg border">
                        <thead className="bg-blue-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-bold text-blue-600 uppercase tracking-wider">Service</th>
                            <th className="px-4 py-2 text-right text-xs font-bold text-blue-600 uppercase tracking-wider">Price</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {services.map((item) => (
                            <tr key={item.servicePackageId || item.id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.serviceName || item.name}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right">{(item.price || 0).toLocaleString()} VND</td>
                            </tr>
                          ))}
                          <tr className="border-t border-gray-300 bg-blue-50">
                            <td className="px-4 py-2 whitespace-nowrap text-base font-bold text-gray-900">Total</td>
                            <td className="px-4 py-2 whitespace-nowrap text-base font-bold text-blue-600 text-right">{calculateTotal().toLocaleString()} VND</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-8">No payment information found.</p>
          )}

          <p className="text-gray-500 text-sm mb-8">
            You will be redirected to the home page shortly, or you can click the button below.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;

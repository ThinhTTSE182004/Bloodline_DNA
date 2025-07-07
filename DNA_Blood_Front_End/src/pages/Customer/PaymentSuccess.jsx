import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaTransgender, FaUsers, FaUserFriends, FaChevronDown, FaChevronUp, FaReceipt, FaShoppingBag } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [services, setServices] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Ưu tiên lấy từ sessionStorage trước
    const sessionBooking = JSON.parse(sessionStorage.getItem('lastPaidBooking'));
    if (sessionBooking) {
      setUserDetails(sessionBooking);
      setServices(sessionBooking.selectedServices || []);
      return;
    }

    // Nếu không có trong sessionStorage, thử lấy từ localStorage
    const booking = JSON.parse(sessionStorage.getItem('bookingFormData'));
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
        <motion.div
          initial={{ opacity: 0, scale:0.8}}
          animate={{ opacity: 1, scale:1}}
          transition={{ duration: 0.8 }}
          className="bg-white shadow rounded-lg p-8 md:p-12 max-w-2xl w-full"
          style={{ borderRadius: '5px' }}
        >
          <div className="text-center mb-8">
            <FaCheckCircle className="text-green-500 w-52 h-52 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-blue-600 mb-4">Payment Successful!</h1>
            <p className="text-gray-700 text-base">
              Your order has been placed successfully. Thank you for your purchase!
            </p>
          </div>

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
                    <div className="font-bold text-blue-600">Order #{userDetails.orderId}</div>
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
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-blue-600 mb-6 flex items-center justify-center">
                      <FaUser className="mr-2" /> User Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Main Participant */}
                      <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white">
                        <FaUser className="mt-1 text-blue-500 w-5 h-5" />
                        <div>
                          <div className="text-sm text-gray-500">Full Name</div>
                          <div className="font-medium text-gray-900">{userDetails.participants?.[0]?.fullName || '-'}</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white">
                        <FaPhone className="mt-1 text-blue-500 w-5 h-5" />
                        <div>
                          <div className="text-sm text-gray-500">Phone</div>
                          <div className="font-medium text-gray-900">{userDetails.participants?.[0]?.phone || '-'}</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white">
                        <FaCalendarAlt className="mt-1 text-blue-500 w-5 h-5" />
                        <div>
                          <div className="text-sm text-gray-500">Date of Birth</div>
                          <div className="font-medium text-gray-900">{userDetails.participants?.[0]?.birthDate || '-'}</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white">
                        <FaTransgender className="mt-1 text-blue-500 w-5 h-5" />
                        <div>
                          <div className="text-sm text-gray-500">Gender</div>
                          <div className="font-medium text-gray-900">{userDetails.participants?.[0]?.sex || '-'}</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white">
                        <FaUsers className="mt-1 text-blue-500 w-5 h-5" />
                        <div>
                          <div className="text-sm text-gray-500">Relationship</div>
                          <div className="font-medium text-gray-900">{userDetails.participants?.[0]?.relationship || '-'}</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white">
                        <FaUserFriends className="mt-1 text-blue-500 w-5 h-5" />
                        <div>
                          <div className="text-sm text-gray-500">Related Person</div>
                          <div className="font-medium text-gray-900">{userDetails.participants?.[0]?.nameRelation || '-'}</div>
                        </div>
                      </div>
                      {/* Nếu có người liên quan (participants[1]) thì hiển thị thêm */}
                      {userDetails.participants?.length > 1 && (
                        <>
                          <div className="col-span-2 border-t border-gray-300 my-2"></div>
                          <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white">
                            <FaUser className="mt-1 text-green-500 w-5 h-5" />
                            <div>
                              <div className="text-sm text-gray-500">Related Person Name</div>
                              <div className="font-medium text-gray-900">{userDetails.participants?.[1]?.fullName || '-'}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white">
                            <FaPhone className="mt-1 text-green-500 w-5 h-5" />
                            <div>
                              <div className="text-sm text-gray-500">Related Person Phone</div>
                              <div className="font-medium text-gray-900">{userDetails.participants?.[1]?.phone || '-'}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white">
                            <FaCalendarAlt className="mt-1 text-green-500 w-5 h-5" />
                            <div>
                              <div className="text-sm text-gray-500">Related Person DOB</div>
                              <div className="font-medium text-gray-900">{userDetails.participants?.[1]?.birthDate || '-'}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white">
                            <FaTransgender className="mt-1 text-green-500 w-5 h-5" />
                            <div>
                              <div className="text-sm text-gray-500">Related Person Gender</div>
                              <div className="font-medium text-gray-900">{userDetails.participants?.[1]?.sex || '-'}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white">
                            <FaUsers className="mt-1 text-green-500 w-5 h-5" />
                            <div>
                              <div className="text-sm text-gray-500">Relationship</div>
                              <div className="font-medium text-gray-900">{userDetails.participants?.[1]?.relationship || '-'}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white">
                            <FaUserFriends className="mt-1 text-green-500 w-5 h-5" />
                            <div>
                              <div className="text-sm text-gray-500">Related To</div>
                              <div className="font-medium text-gray-900">{userDetails.participants?.[1]?.nameRelation || '-'}</div>
                            </div>
                          </div>
                        </>
                      )}
                      {/* Địa chỉ giao mẫu */}
                      <div className="flex items-start space-x-3 border border-gray-300 px-2 py-2 bg-white col-span-2">
                        <FaMapMarkerAlt className="mt-1 text-blue-500 w-5 h-5" />
                        <div>
                          <div className="text-sm text-gray-500">Address</div>
                          <div className="font-medium text-gray-900">{userDetails.deliveryAddress || 'At Medical Center'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Services Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-blue-600 mb-6 flex items-center justify-center">
                      <FaShoppingBag className="mr-2" /> Services Paid
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 rounded-lg border">
                        <thead className="bg-blue-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">Service</th>
                            <th className="px-4 py-3 text-right text-sm font-bold text-blue-600 uppercase tracking-wider">Price</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {services.map((item) => (
                            <tr key={item.servicePackageId || item.id}>
                              <td className="px-4 py-3 whitespace-nowrap text-base font-medium text-gray-900">{item.serviceName || item.name}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700 text-right">{(item.price || 0).toLocaleString()} VND</td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-gray-300 bg-blue-50">
                            <td className="px-4 py-3 whitespace-nowrap text-lg font-bold text-gray-900">Total</td>
                            <td className="px-4 py-3 whitespace-nowrap text-lg font-bold text-blue-600 text-right">{calculateTotal().toLocaleString()} VND</td>
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

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-8">
              You will be redirected to the home page shortly, or you can click the button below.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-8 py-3 border-2 border-transparent text-lg font-bold rounded-lg shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-300 hover:scale-105"
            >
              Go to Home
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PaymentSuccess;

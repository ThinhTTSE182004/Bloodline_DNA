import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaClipboardList, FaPencilAlt, FaFlask, FaPrescriptionBottleAlt, FaUser, FaTransgender, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaUserFriends, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const FillBookingForm = () => {
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    testType: '',
    sampleCollectionMethod: '',
    sampleType: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    address: '',
    relationshipToPatient: '',
    relatedPersonName: '',
  });
  const navigate = useNavigate();

  // Giả định dữ liệu giỏ hàng được tải từ localStorage hoặc truyền qua props
  useEffect(() => {
    // Ví dụ: Lấy dữ liệu giỏ hàng từ localStorage
    const storedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [
      { id: 1, name: "Parentage Verification Test", price: 2000.00 },
      { id: 2, name: "Paternal Ancestry Test", price: 2500.00 }
    ];
    setCartItems(storedCartItems);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const calculateTotalAmount = () => {
    return cartItems.reduce((total, item) => total + item.price, 0).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
    console.log('Cart Items:', cartItems);

    // Save formData to localStorage for Payment page to access
    localStorage.setItem('bookingFormData', JSON.stringify(formData));

    // TODO: Tích hợp API xử lý thanh toán và gửi thông tin đơn hàng xuống database
    /*
    fetch('/api/process-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formData, cartItems }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Order placed successfully!');
        // Xóa giỏ hàng sau khi đặt hàng thành công
        localStorage.removeItem('cartItems');
        setCartItems([]);
        // Chuyển hướng hoặc hiển thị thông báo thành công
      } else {
        alert('Order failed: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error placing order:', error);
      alert('An error occurred while placing your order.');
    });
    */
    
    // Simulate successful order and navigate to payment page
    alert('Form submitted successfully! Proceeding to payment.');
    navigate('/payment'); // Navigate to the Payment page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* SELECTED SERVICES SUMMARY */}
          <div className="bg-white shadow rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-blue-600 mb-6 flex items-center">
              <FaClipboardList className="w-6 h-6 mr-3" />
              SELECTED SERVICES SUMMARY
            </h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-gray-700">
                  <span className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    {item.name} - {item.price.toFixed(0)} đ
                  </span>
                </div>
              ))}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <p className="text-xl font-bold text-blue-600">Total Amount: {calculateTotalAmount()} đ</p>
              </div>
            </div>
          </div>

          {/* ENTER SERVICE DETAILS */}
          <div className="bg-white shadow rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-blue-600 mb-6 flex items-center">
              <FaPencilAlt className="w-6 h-6 mr-3" />
              ENTER SERVICE DETAILS
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Test Type */}
              <div>
                <label htmlFor="testType" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaFlask className="w-5 h-5 mr-2 text-blue-500" />
                  Test Type
                </label>
                <select
                  id="testType"
                  name="testType"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.testType}
                  onChange={handleChange}
                >
                  <option value="">-- Select Type --</option>
                  <option value="parentage">Parentage Verification</option>
                  <option value="ancestry">Ancestry Test</option>
                  <option value="relationship">Relationship Test</option>
                </select>
              </div>

              {/* Sample Collection Method */}
              <div>
                <label htmlFor="sampleCollectionMethod" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaPrescriptionBottleAlt className="w-5 h-5 mr-2 text-blue-500" />
                  Sample Collection Method
                </label>
                <select
                  id="sampleCollectionMethod"
                  name="sampleCollectionMethod"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.sampleCollectionMethod}
                  onChange={handleChange}
                >
                  <option value="">-- Select Collection Method --</option>
                  <option value="clinic">At Clinic</option>
                  <option value="home_kit">Home Kit</option>
                </select>
              </div>

              {/* Sample Type */}
              <div>
                <label htmlFor="sampleType" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaFlask className="w-5 h-5 mr-2 text-blue-500" />
                  Sample Type
                </label>
                <select
                  id="sampleType"
                  name="sampleType"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.sampleType}
                  onChange={handleChange}
                >
                  <option value="">-- Select Sample Type --</option>
                  <option value="buccal_swab">Buccal Swab</option>
                  <option value="blood">Blood</option>
                  <option value="hair">Hair</option>
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaUser className="w-5 h-5 mr-2 text-blue-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaTransgender className="w-5 h-5 mr-2 text-blue-500" />
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">-- Select Gender --</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaCalendarAlt className="w-5 h-5 mr-2 text-blue-500" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaPhone className="w-5 h-5 mr-2 text-blue-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaEnvelope className="w-5 h-5 mr-2 text-blue-500" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaMapMarkerAlt className="w-5 h-5 mr-2 text-blue-500" />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              {/* Relationship to Patient */}
              <div>
                <label htmlFor="relationshipToPatient" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaUsers className="w-5 h-5 mr-2 text-blue-500" />
                  Relationship to Patient
                </label>
                <select
                  id="relationshipToPatient"
                  name="relationshipToPatient"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.relationshipToPatient}
                  onChange={handleChange}
                >
                  <option value="">-- Select Relationship --</option>
                  <option value="self">Self</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Related Person's Name (if applicable) */}
              {formData.relationshipToPatient !== 'self' && formData.relationshipToPatient !== '' && (
                <div>
                  <label htmlFor="relatedPersonName" className="block text-sm font-medium text-gray-700 flex items-center">
                    <FaUserFriends className="w-5 h-5 mr-2 text-blue-500" />
                    Related Person's Name
                  </label>
                  <input
                    type="text"
                    name="relatedPersonName"
                    id="relatedPersonName"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter related person's name"
                    value={formData.relatedPersonName}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaCheckCircle className="w-5 h-5 mr-2" />
                  SUBMIT ORDER
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FillBookingForm;

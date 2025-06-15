import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { FaClipboardList, FaPencilAlt, FaFlask, FaPrescriptionBottleAlt, FaUser, FaTransgender, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaUserFriends, FaCheckCircle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useServices } from '../context/ServiceContext';

const FillBookingForm = () => {
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
  const location = useLocation();
  const { cartItems } = useCart();
  const { services } = useServices();
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const serviceId = searchParams.get('service');

    if (serviceId) {
      // Tìm trong cart hoặc services (so sánh cùng kiểu)
      let service = cartItems.find(item => String(item.servicePackageId) === String(serviceId));
      if (!service) {
        service = services.find(item => String(item.servicePackageId) === String(serviceId));
      }
      if (service) {
        setSelectedServices([service]);
        return;
      }
    }
    // Nếu không có serviceId, lấy từ localStorage
    const saved = localStorage.getItem('selectedServices');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) {
          setSelectedServices(arr);
        }
      } catch {
        setSelectedServices([]);
      }
    }
  }, [location.search, cartItems, services]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const calculateTotalAmount = () => {
    return selectedServices.reduce((total, service) => total + (service.price || 0), 0).toLocaleString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('bookingFormData', JSON.stringify({
      ...formData,
      selectedServices
    }));
    navigate('/payment');
  };

  if (!selectedServices || selectedServices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-red-600 mb-4">No Service Selected</h2>
            <p className="text-lg text-gray-600 mb-6">Please select a service from the services page to proceed with your booking.</p>
            <button
              onClick={() => navigate('/services')}
              className="px-8 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Go to Services
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* SELECTED SERVICES SUMMARY */}
          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-blue-100">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center">
              <FaClipboardList className="w-7 h-7 mr-3 text-blue-600" />
              Selected Services Details
            </h2>
            <div className="space-y-4">
              {selectedServices.map((service) => (
                <div key={service.servicePackageId} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="flex items-center text-lg">
                    <FaCheckCircle className="text-green-500 mr-3 w-5 h-5" />
                    {service.serviceName}
                  </span>
                  <span className="font-bold text-blue-700 text-lg">{service.price?.toLocaleString()} đ</span>
                </div>
              ))}
              <div className="flex justify-end pt-4 mt-4 border-t-2 border-blue-200">
                <p className="text-2xl font-bold text-blue-700">Total Amount: {calculateTotalAmount()} đ</p>
              </div>
            </div>
          </div>

          {/* ENTER SERVICE DETAILS */}
          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-blue-100">
            <h2 className="text-2xl font-bold text-blue-700 mb-8 flex items-center">
              <FaPencilAlt className="w-7 h-7 mr-3 text-blue-600" />
              Enter Service Details
            </h2>
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.type !== 'textarea' && e.target.type !== 'submit') {
                  e.preventDefault();
                }
              }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Test Type */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label htmlFor="testType" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaFlask className="w-6 h-6 mr-3 text-blue-600" />
                    Test Type
                  </label>
                  <select
                    id="testType"
                    name="testType"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.testType}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Type --</option>
                    <option value="Civil">Civil</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>

                {/* Sample Collection Method */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label htmlFor="sampleCollectionMethod" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaPrescriptionBottleAlt className="w-6 h-6 mr-3 text-blue-600" />
                    Sample Collection Method
                  </label>
                  <select
                    id="sampleCollectionMethod"
                    name="sampleCollectionMethod"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.sampleCollectionMethod}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Collection Method --</option>
                    <option value="At Medical Center">At Medical Center</option>
                    <option value="At Home" disabled={formData.testType === 'Legal'}>At Home</option>
                  </select>
                </div>

                {/* Sample Type */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label htmlFor="sampleType" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaFlask className="w-6 h-6 mr-3 text-blue-600" />
                    Sample Type
                  </label>
                  <select
                    id="sampleType"
                    name="sampleType"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.sampleType}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Sample Type --</option>
                    <option value="Blood">Blood</option>
                    <option value="Hair">Hair</option>
                    <option value="Fingernail">Fingernail</option>
                  </select>
                </div>

                {/* Full Name */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label htmlFor="fullName" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaUser className="w-6 h-6 mr-3 text-blue-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                {/* Gender */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label htmlFor="gender" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaTransgender className="w-6 h-6 mr-3 text-blue-600" />
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label htmlFor="dateOfBirth" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaCalendarAlt className="w-6 h-6 mr-3 text-blue-600" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                {/* Phone Number */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label htmlFor="phoneNumber" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaPhone className="w-6 h-6 mr-3 text-blue-600" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaEnvelope className="w-6 h-6 mr-3 text-blue-600" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Address */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label htmlFor="address" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaMapMarkerAlt className="w-6 h-6 mr-3 text-blue-600" />
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                {/* Relationship to Patient */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label htmlFor="relationshipToPatient" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaUsers className="w-6 h-6 mr-3 text-blue-600" />
                    Relationship to Patient
                  </label>
                  <select
                    id="relationshipToPatient"
                    name="relationshipToPatient"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                {/* Related Person's Name */}
                {formData.relationshipToPatient !== 'self' && formData.relationshipToPatient !== '' && (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <label htmlFor="relatedPersonName" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <FaUserFriends className="w-6 h-6 mr-3 text-blue-600" />
                      Related Person's Name
                    </label>
                    <input
                      type="text"
                      name="relatedPersonName"
                      id="relatedPersonName"
                      className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter related person's name"
                      value={formData.relatedPersonName}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-8">
                <button
                  type="submit"
                  className="inline-flex items-center px-10 py-4 border-2 border-transparent text-xl font-bold rounded-lg shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition-all duration-300 hover:scale-105"
                >
                  <FaCheckCircle className="w-6 h-6 mr-3" />
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FillBookingForm;

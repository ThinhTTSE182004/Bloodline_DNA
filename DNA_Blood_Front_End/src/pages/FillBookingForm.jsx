import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-red-600">No service selected</h2>
            <p className="mt-4 text-gray-600">Please select a service from the services page.</p>
            <button
              onClick={() => navigate('/services')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Go to Services
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* SELECTED SERVICES SUMMARY */}
          <div className="bg-white shadow rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-blue-600 mb-6 flex items-center">
              <FaClipboardList className="w-6 h-6 mr-3" />
              SELECTED SERVICES DETAILS
            </h2>
            <div className="space-y-4">
              {selectedServices.map((service) => (
                <div key={service.servicePackageId} className="flex items-center justify-between text-gray-700">
                  <span className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    {service.serviceName}
                  </span>
                  <span className="font-semibold">{service.price?.toLocaleString()} đ</span>
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
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.type !== 'textarea' && e.target.type !== 'submit') {
                  e.preventDefault();
                }
              }}
              className="space-y-6"
            >
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
                  <option value="Civil">Civil</option>
                  <option value="Legal">Legal</option>
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
                  <option value="At Medical Center">At Medical Center</option>
                  <option value="At Home" disabled={formData.testType === 'Legal'}>At Home</option>
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
                  <option value="Blood">Blood</option>
                  <option value="Hair">Hair</option>
                  <option value="Fingernail">Fingernail</option>
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
                  placeholder="--/--/----"
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

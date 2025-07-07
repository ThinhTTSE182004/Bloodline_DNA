import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { FaClipboardList, FaPencilAlt, FaFlask, FaPrescriptionBottleAlt, FaUser, FaTransgender, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaUserFriends, FaCheckCircle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useServices } from '../../context/ServiceContext';


const FillBookingForm = () => {
  const [formData, setFormData] = useState({
    testType: '',
    sampleCollectionMethod: '',
    sampleType: '',
    // Main participant (person taking the test)
    mainParticipant: {
      fullName: '',
      gender: '',
      dateOfBirth: '',
      phoneNumber: '',
      email: '',
    },
    // Related participant (person booking for someone else)
    relatedParticipant: {
      fullName: '',
      gender: '',
      dateOfBirth: '',
      phoneNumber: '',
      email: '',
    },
    address: '',
    relationshipToPatient: '',
    bookingDate: new Date().toISOString().slice(0, 10) + 'T08:00', // Default to 8:00 AM
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
    const saved = sessionStorage.getItem('selectedServices');
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
    
    // Handle nested participant objects
    if (name.startsWith('mainParticipant.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        mainParticipant: {
          ...formData.mainParticipant,
          [field]: value,
        },
      });
    } else if (name.startsWith('relatedParticipant.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        relatedParticipant: {
          ...formData.relatedParticipant,
          [field]: value,
        },
      });
    } else {
      // Handle regular fields
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDateTimeFocus = (e) => {
    const { name } = e.target;
    if (name === 'bookingDate') {
      // If the time part is empty or 00:00, set it to 08:00
      const currentValue = e.target.value;
      if (!currentValue || currentValue.endsWith('T00:00')) {
        const today = new Date();
        const dateString = today.toISOString().slice(0, 10);
        const newValue = dateString + 'T08:00';
        setFormData({
          ...formData,
          [name]: newValue,
        });
      }
    }
  };

  const calculateTotalAmount = () => {
    return selectedServices.reduce((total, service) => total + (service.price || 0), 0).toLocaleString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const total = selectedServices.reduce((total, service) => total + (service.price || 0), 0);

    // Kiểm tra giờ
    const selectedDate = new Date(formData.bookingDate);
    const hour = selectedDate.getHours();
    if (hour < 8 || hour >= 17) {
      alert("Vui lòng chọn giờ từ 8:00 đến 17:00.");
      return;
    }

    // Prepare participants array
    const participants = [];
    
    // Add main participant
    participants.push({
      fullName: formData.mainParticipant.fullName,
      sex: formData.mainParticipant.gender,
      birthDate: formData.mainParticipant.dateOfBirth,
      phone: formData.mainParticipant.phoneNumber,
      relationship: 'self',
      nameRelation: formData.mainParticipant.fullName
    });

    // Add related participant if relationship is not 'self'
    if (formData.relationshipToPatient !== 'self' && formData.relationshipToPatient !== '') {
      participants.push({
        fullName: formData.relatedParticipant.fullName,
        sex: formData.relatedParticipant.gender,
        birthDate: formData.relatedParticipant.dateOfBirth,
        phone: formData.relatedParticipant.phoneNumber,
        relationship: formData.relationshipToPatient,
        nameRelation: formData.mainParticipant.fullName
      });
    }

    const bookingData = {
      bookingDate: formData.bookingDate + ':00',
      participants: participants,
      details: selectedServices.map(s => ({ servicePackageId: s.servicePackageId })),
      payment: {
        // paymentMethod will be added on payment screen
        total: total
      },
      testTypeName: formData.testType,
      sampleTypeName: formData.sampleType,
      methodTypeName: formData.sampleCollectionMethod,
      deliveryAddress: formData.sampleCollectionMethod === 'At Home' ? formData.address : null
    };

    sessionStorage.setItem('bookingFormData', JSON.stringify(bookingData));
    navigate('/payment');
  };

  if (!selectedServices || selectedServices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-red-600 mb-4 hover:cursor-default">No Service Selected</h2>
            <p className="text-lg text-gray-600 mb-6 hover:cursor-default">Please select a service from the services page to proceed with your booking.</p>
            <button
              onClick={() => navigate('/services')}
              className="px-8 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:cursor-pointer"
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
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center hover:text-blue-600 hover:cursor-default">
              <FaClipboardList className="w-7 h-7 mr-3 text-blue-600" />
              Selected Services Details
            </h2>
            <div className="space-y-4">
              {selectedServices.map((service) => (
                <div key={service.servicePackageId} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 group hover:border-blue-300 hover:bg-blue-100">
                  <span className="flex items-center text-lg cursor-default">
                    <FaCheckCircle className="text-green-500 mr-3 w-5 h-5" />
                    {service.serviceName}
                  </span>
                  <span className="font-bold text-blue-700 text-lg cursor-default group-hover:text-blue-600">{service.price?.toLocaleString()} đ</span>
                </div>
              ))}
              <div className="flex justify-end pt-4 mt-4 border-t-2 border-blue-200">
                <p className="text-2xl font-bold text-blue-700 cursor-default hover:text-blue-600">Total Amount: {calculateTotalAmount()} đ</p>
              </div>
            </div>
          </div>

          {/* ENTER SERVICE DETAILS */}
          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-blue-100">
            <h2 className="text-2xl font-bold text-blue-700 mb-8 flex items-center hover:text-blue-600 hover:cursor-default">
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
                  <label htmlFor="testType" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaFlask className="w-6 h-6 mr-3 text-blue-600" />
                    Test Type
                  </label>
                  <select
                    id="testType"
                    name="testType"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:cursor-pointer"
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
                  <label htmlFor="sampleCollectionMethod" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaPrescriptionBottleAlt className="w-6 h-6 mr-3 text-blue-600" />
                    Sample Collection Method
                  </label>
                  <select
                    id="sampleCollectionMethod"
                    name="sampleCollectionMethod"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:cursor-pointer"
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
                  <label htmlFor="sampleType" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaFlask className="w-6 h-6 mr-3 text-blue-600" />
                    Sample Type
                  </label>
                  <select
                    id="sampleType"
                    name="sampleType"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:cursor-pointer "
                    value={formData.sampleType}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Sample Type --</option>
                    <option value="Blood">Blood</option>
                    <option value="Hair">Hair</option>
                    <option value="Fingernail">Fingernail</option>
                  </select>
                </div>

                {/* Booking Date */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label htmlFor="bookingDate" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaCalendarAlt className="w-6 h-6 mr-3 text-blue-600" />
                    Booking Date
                  </label>
                  <input
                    type="datetime-local"
                    name="bookingDate"
                    id="bookingDate"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.bookingDate}
                    onChange={handleChange}
                    onFocus={handleDateTimeFocus}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                {/* Address - chỉ hiện khi chọn At Home */}
                {formData.sampleCollectionMethod === 'At Home' && (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <label htmlFor="address" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
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
                )}

                {/* Relationship to Patient */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label htmlFor="relationshipToPatient" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <FaUsers className="w-6 h-6 mr-3 text-blue-600" />
                    Relationship to Patient
                  </label>
                  <select
                    id="relationshipToPatient"
                    name="relationshipToPatient"
                    className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:cursor-pointer"
                    value={formData.relationshipToPatient}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Relationship --</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* MAIN PARTICIPANT SECTION */}
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-blue-700 mb-6 flex items-center">
                  <FaUser className="w-6 h-6 mr-3 text-blue-600" />
                  Main Participant (Person Taking the Test)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main Participant Full Name */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label htmlFor="mainParticipant.fullName" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <FaUser className="w-5 h-5 mr-2 text-blue-600" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="mainParticipant.fullName"
                      id="mainParticipant.fullName"
                      className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter full name"
                      value={formData.mainParticipant.fullName}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Main Participant Gender */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label htmlFor="mainParticipant.gender" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <FaTransgender className="w-5 h-5 mr-2 text-blue-600" />
                      Gender
                    </label>
                    <select
                      id="mainParticipant.gender"
                      name="mainParticipant.gender"
                      className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:cursor-pointer"
                      value={formData.mainParticipant.gender}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Main Participant Date of Birth */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label htmlFor="mainParticipant.dateOfBirth" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <FaCalendarAlt className="w-5 h-5 mr-2 text-blue-600" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="mainParticipant.dateOfBirth"
                      id="mainParticipant.dateOfBirth"
                      className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:cursor-text"
                      value={formData.mainParticipant.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Main Participant Phone Number */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label htmlFor="mainParticipant.phoneNumber" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <FaPhone className="w-5 h-5 mr-2 text-blue-600" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="mainParticipant.phoneNumber"
                      id="mainParticipant.phoneNumber"
                      className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                      value={formData.mainParticipant.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Main Participant Email */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-2">
                    <label htmlFor="mainParticipant.email" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <FaEnvelope className="w-5 h-5 mr-2 text-blue-600" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="mainParticipant.email"
                      id="mainParticipant.email"
                      className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                      value={formData.mainParticipant.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* RELATED PARTICIPANT SECTION - Always show */}
              <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold text-green-700 mb-6 flex items-center">
                  <FaUserFriends className="w-6 h-6 mr-3 text-green-600" />
                  Related Participant (Person Booking the Test)
                </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Related Participant Full Name */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <label htmlFor="relatedParticipant.fullName" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <FaUser className="w-5 h-5 mr-2 text-green-600" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="relatedParticipant.fullName"
                        id="relatedParticipant.fullName"
                        className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter full name"
                        value={formData.relatedParticipant.fullName}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Related Participant Gender */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <label htmlFor="relatedParticipant.gender" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <FaTransgender className="w-5 h-5 mr-2 text-green-600" />
                        Gender
                      </label>
                      <select
                        id="relatedParticipant.gender"
                        name="relatedParticipant.gender"
                        className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:cursor-pointer"
                        value={formData.relatedParticipant.gender}
                        onChange={handleChange}
                      >
                        <option value="">-- Select Gender --</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Related Participant Date of Birth */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <label htmlFor="relatedParticipant.dateOfBirth" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <FaCalendarAlt className="w-5 h-5 mr-2 text-green-600" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="relatedParticipant.dateOfBirth"
                        id="relatedParticipant.dateOfBirth"
                        className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:cursor-text"
                        value={formData.relatedParticipant.dateOfBirth}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Related Participant Phone Number */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <label htmlFor="relatedParticipant.phoneNumber" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <FaPhone className="w-5 h-5 mr-2 text-green-600" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="relatedParticipant.phoneNumber"
                        id="relatedParticipant.phoneNumber"
                        className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter phone number"
                        value={formData.relatedParticipant.phoneNumber}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Related Participant Email */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-2">
                      <label htmlFor="relatedParticipant.email" className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <FaEnvelope className="w-5 h-5 mr-2 text-green-600" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="relatedParticipant.email"
                        id="relatedParticipant.email"
                        className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter email address"
                        value={formData.relatedParticipant.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
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

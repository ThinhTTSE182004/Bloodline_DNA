import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { FaClipboardList, FaPencilAlt, FaFlask, FaPrescriptionBottleAlt, FaUser, FaTransgender, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaUserFriends, FaCheckCircle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useServices } from '../../context/ServiceContext';
import { motion } from 'framer-motion';


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
  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const newErrors = {};
    // Test Type
    if (!formData.testType) newErrors.testType = "Please select test type.";
    // Sample Collection Method
    if (!formData.sampleCollectionMethod) newErrors.sampleCollectionMethod = "Please select sample collection method.";
    // Sample Type
    if (!formData.sampleType) newErrors.sampleType = "Please select sample type.";
    // Booking Date
    if (!formData.bookingDate) {
      newErrors.bookingDate = "Please select booking date.";
    } else {
      const selectedDate = new Date(formData.bookingDate);
      const now = new Date();
      if (selectedDate < now) newErrors.bookingDate = "Booking date cannot be in the past.";
      const hour = selectedDate.getHours();
      if (hour < 8 || hour >= 17) newErrors.bookingDate = "Please select a time between 8:00 and 17:00.";
    }
    // Address
    if (formData.sampleCollectionMethod === "At Home" && !formData.address.trim()) {
      newErrors.address = "Please enter address for home collection.";
    }
    // Relationship
    if (!formData.relationshipToPatient) newErrors.relationshipToPatient = "Please select relationship.";
    // Main Participant
    if (!formData.mainParticipant.fullName.trim() || formData.mainParticipant.fullName.trim().length < 2)
      newErrors["mainParticipant.fullName"] = "Please enter full name (at least 2 characters).";
    if (!formData.mainParticipant.gender) newErrors["mainParticipant.gender"] = "Please select gender.";
    if (!formData.mainParticipant.dateOfBirth) {
      newErrors["mainParticipant.dateOfBirth"] = "Please select date of birth.";
    } else {
      if (new Date(formData.mainParticipant.dateOfBirth) > new Date())
        newErrors["mainParticipant.dateOfBirth"] = "Date of birth cannot be in the future.";
    }
    if (!formData.mainParticipant.phoneNumber.match(/^0[0-9]{9}$/))
      newErrors["mainParticipant.phoneNumber"] = "Please enter a valid 10-digit phone number.";
    if (!formData.mainParticipant.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/))
      newErrors["mainParticipant.email"] = "Please enter a valid email address.";
    // Related Participant (nếu relationship khác self và khác rỗng)
    if (formData.relationshipToPatient && formData.relationshipToPatient !== "self") {
      if (!formData.relatedParticipant.fullName.trim() || formData.relatedParticipant.fullName.trim().length < 2)
        newErrors["relatedParticipant.fullName"] = "Please enter full name (at least 2 characters).";
      if (!formData.relatedParticipant.gender) newErrors["relatedParticipant.gender"] = "Please select gender.";
      if (!formData.relatedParticipant.dateOfBirth) {
        newErrors["relatedParticipant.dateOfBirth"] = "Please select date of birth.";
      } else {
        if (new Date(formData.relatedParticipant.dateOfBirth) > new Date())
          newErrors["relatedParticipant.dateOfBirth"] = "Date of birth cannot be in the future.";
      }
      if (!formData.relatedParticipant.phoneNumber.match(/^0[0-9]{9}$/))
        newErrors["relatedParticipant.phoneNumber"] = "Please enter a valid 10-digit phone number.";
      if (!formData.relatedParticipant.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/))
        newErrors["relatedParticipant.email"] = "Please enter a valid email address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

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
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-lg shadow-xl p-8 border-2 border-blue-100">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl font-bold text-blue-700 mb-6 flex items-center hover:text-blue-600 hover:cursor-default">
              <FaClipboardList className="w-7 h-7 mr-3 text-blue-600" />
              Selected Services Details
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4">
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
            </motion.div>
          </motion.div>

          {/* ENTER SERVICE DETAILS */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-lg shadow-xl p-8 border-2 border-blue-100">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl font-bold text-blue-700 mb-8 flex items-center hover:text-blue-600 hover:cursor-default">
              <FaPencilAlt className="w-7 h-7 mr-3 text-blue-600" />
              Enter Service Details
            </motion.h2>
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
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="bg-gray-50 p-6 rounded-lg border border-gray-200">
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
                  {errors.testType && (
                    <div className="text-red-500 text-sm mt-1">{errors.testType}</div>
                  )}
                </motion.div>

                {/* Sample Collection Method */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="bg-gray-50 p-6 rounded-lg border border-gray-200">
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
                  {errors.sampleCollectionMethod && (
                    <div className="text-red-500 text-sm mt-1">{errors.sampleCollectionMethod}</div>
                  )}
                </motion.div>

                {/* Sample Type */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="bg-gray-50 p-6 rounded-lg border border-gray-200">
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
                  {errors.sampleType && (
                    <div className="text-red-500 text-sm mt-1">{errors.sampleType}</div>
                  )}
                </motion.div>

                {/* Booking Date */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="bg-gray-50 p-6 rounded-lg border border-gray-200">
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
                  {errors.bookingDate && (
                    <div className="text-red-500 text-sm mt-1">{errors.bookingDate}</div>
                  )}
                </motion.div>

                {/* Address - chỉ hiện khi chọn At Home */}
                {formData.sampleCollectionMethod === 'At Home' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="bg-gray-50 p-6 rounded-lg border border-gray-200">
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
                    {errors.address && (
                      <div className="text-red-500 text-sm mt-1">{errors.address}</div>
                    )}
                  </motion.div>
                )}

                {/* Relationship to Patient */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="bg-gray-50 p-6 rounded-lg border border-gray-200">
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
                  {errors.relationshipToPatient && (
                    <div className="text-red-500 text-sm mt-1">{errors.relationshipToPatient}</div>
                  )}
                </motion.div>
              </div>

              {/* MAIN PARTICIPANT SECTION */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                <motion.h3 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-xl font-bold text-blue-700 mb-6 flex items-center">
                  <FaUser className="w-6 h-6 mr-3 text-blue-600" />
                  Main Participant (Person Taking the Test)
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main Participant Full Name */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white p-4 rounded-lg border border-gray-200">
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
                    {errors["mainParticipant.fullName"] && (
                      <div className="text-red-500 text-sm mt-1">{errors["mainParticipant.fullName"]}</div>
                    )}
                  </motion.div>

                  {/* Main Participant Gender */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white p-4 rounded-lg border border-gray-200">
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
                    {errors["mainParticipant.gender"] && (
                      <div className="text-red-500 text-sm mt-1">{errors["mainParticipant.gender"]}</div>
                    )}
                  </motion.div>

                  {/* Main Participant Date of Birth */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white p-4 rounded-lg border border-gray-200">
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
                    {errors["mainParticipant.dateOfBirth"] && (
                      <div className="text-red-500 text-sm mt-1">{errors["mainParticipant.dateOfBirth"]}</div>
                    )}
                  </motion.div>

                  {/* Main Participant Phone Number */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white p-4 rounded-lg border border-gray-200">
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
                    {errors["mainParticipant.phoneNumber"] && (
                      <div className="text-red-500 text-sm mt-1">{errors["mainParticipant.phoneNumber"]}</div>
                    )}
                  </motion.div>

                  {/* Main Participant Email */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-2">
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
                    {errors["mainParticipant.email"] && (
                      <div className="text-red-500 text-sm mt-1">{errors["mainParticipant.email"]}</div>
                    )}
                  </motion.div>
                </div>
              </motion.div>

              {/* RELATED PARTICIPANT SECTION - Always show */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <motion.h3 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-xl font-bold text-green-700 mb-6 flex items-center">
                  <FaUserFriends className="w-6 h-6 mr-3 text-green-600" />
                  Related Participant (Person Booking the Test)
                </motion.h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Related Participant Full Name */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="bg-white p-4 rounded-lg border border-gray-200">
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
                      {errors["relatedParticipant.fullName"] && (
                        <div className="text-red-500 text-sm mt-1">{errors["relatedParticipant.fullName"]}</div>
                      )}
                    </motion.div>

                    {/* Related Participant Gender */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="bg-white p-4 rounded-lg border border-gray-200">
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
                      {errors["relatedParticipant.gender"] && (
                        <div className="text-red-500 text-sm mt-1">{errors["relatedParticipant.gender"]}</div>
                      )}
                    </motion.div>

                    {/* Related Participant Date of Birth */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="bg-white p-4 rounded-lg border border-gray-200">
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
                      {errors["relatedParticipant.dateOfBirth"] && (
                        <div className="text-red-500 text-sm mt-1">{errors["relatedParticipant.dateOfBirth"]}</div>
                      )}
                    </motion.div>

                    {/* Related Participant Phone Number */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="bg-white p-4 rounded-lg border border-gray-200">
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
                      {errors["relatedParticipant.phoneNumber"] && (
                        <div className="text-red-500 text-sm mt-1">{errors["relatedParticipant.phoneNumber"]}</div>
                      )}
                    </motion.div>

                    {/* Related Participant Email */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-2">
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
                      {errors["relatedParticipant.email"] && (
                        <div className="text-red-500 text-sm mt-1">{errors["relatedParticipant.email"]}</div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>

              {/* Submit Button */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex justify-center pt-8">
                <button
                  type="submit"
                  className="inline-flex items-center px-10 py-4 border-2 border-transparent text-xl font-bold rounded-lg shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition-all duration-300 hover:scale-105"
                >
                  <FaCheckCircle className="w-6 h-6 mr-3" />
                  Submit Order
                </button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default FillBookingForm;

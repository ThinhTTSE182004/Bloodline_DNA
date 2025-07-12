import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../../hooks/useServices';
import { useServicePackages } from '../../hooks/useServicePackages';
import { usePatients } from '../../hooks/usePatients';
import { useRelationships } from '../../hooks/useRelationships';
import { useTestTypes } from '../../hooks/useTestTypes';
import { useSampleTypes } from '../../hooks/useSampleTypes';
import { useSampleCollectionMethods } from '../../hooks/useSampleCollectionMethods';

const FillBookingForm = () => {
  const navigate = useNavigate();
  const { services } = useServices();
  const { servicePackages } = useServicePackages();
  const { patients } = usePatients();
  const { relationships } = useRelationships();
  const { testTypes } = useTestTypes();
  const { sampleTypes } = useSampleTypes();
  const { sampleCollectionMethods } = useSampleCollectionMethods();

  const [formData, setFormData] = useState({
    testType: '',
    sampleType: '',
    sampleCollectionMethod: '',
    bookingDate: '',
    address: '',
    relationshipToPatient: '',
    mainParticipant: {
      fullName: '',
      gender: '',
      dateOfBirth: '',
      phoneNumber: '',
      email: '',
    },
    relatedParticipant: {
      fullName: '',
      gender: '',
      dateOfBirth: '',
      phoneNumber: '',
      email: '',
    },
  });

  const [selectedServices, setSelectedServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedData = sessionStorage.getItem('bookingFormData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setFormData(parsedData);
      setSelectedServices(parsedData.details.map(d => ({
        servicePackageId: d.servicePackageId,
        price: servicePackages.find(sp => sp.id === d.servicePackageId)?.price || 0
      })));
      setTotal(parsedData.payment.total);
    }
  }, [servicePackages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceSelect = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedServices(prev => {
        const index = prev.findIndex(s => s.servicePackageId === serviceId);
        if (index === -1) {
          return [...prev, { servicePackageId: serviceId, price: service.price }];
        } else {
          return prev.map((s, i) => i === index ? { ...s, price: service.price } : s);
        }
      });
    }
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices(prev => prev.filter(s => s.servicePackageId !== serviceId));
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Fill Booking Form</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label htmlFor="testType" className="block text-sm font-medium text-gray-700">Test Type</label>
          <select
            id="testType"
            name="testType"
            value={formData.testType}
            onChange={handleSelectChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a test type</option>
            {testTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
          {errors.testType && (
            <div className="text-red-500 text-sm mt-1">{errors.testType}</div>
          )}
        </div>

        <div>
          <label htmlFor="sampleType" className="block text-sm font-medium text-gray-700">Sample Type</label>
          <select
            id="sampleType"
            name="sampleType"
            value={formData.sampleType}
            onChange={handleSelectChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a sample type</option>
            {sampleTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
          {errors.sampleType && (
            <div className="text-red-500 text-sm mt-1">{errors.sampleType}</div>
          )}
        </div>

        <div>
          <label htmlFor="sampleCollectionMethod" className="block text-sm font-medium text-gray-700">Sample Collection Method</label>
          <select
            id="sampleCollectionMethod"
            name="sampleCollectionMethod"
            value={formData.sampleCollectionMethod}
            onChange={handleSelectChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a method</option>
            {sampleCollectionMethods.map(method => (
              <option key={method.id} value={method.name}>{method.name}</option>
            ))}
          </select>
          {errors.sampleCollectionMethod && (
            <div className="text-red-500 text-sm mt-1">{errors.sampleCollectionMethod}</div>
          )}
        </div>

        <div>
          <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700">Booking Date</label>
          <input
            type="datetime-local"
            id="bookingDate"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.bookingDate && (
            <div className="text-red-500 text-sm mt-1">{errors.bookingDate}</div>
          )}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address (for home collection)</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter address"
          />
          {errors.address && (
            <div className="text-red-500 text-sm mt-1">{errors.address}</div>
          )}
        </div>

        <div>
          <label htmlFor="relationshipToPatient" className="block text-sm font-medium text-gray-700">Relationship to Patient</label>
          <select
            id="relationshipToPatient"
            name="relationshipToPatient"
            value={formData.relationshipToPatient}
            onChange={handleSelectChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select relationship</option>
            {relationships.map(rel => (
              <option key={rel.id} value={rel.name}>{rel.name}</option>
            ))}
          </select>
          {errors.relationshipToPatient && (
            <div className="text-red-500 text-sm mt-1">{errors.relationshipToPatient}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Main Participant</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="mainParticipant.fullName"
              value={formData.mainParticipant.fullName}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Full Name"
            />
            {errors["mainParticipant.fullName"] && (
              <div className="text-red-500 text-sm mt-1">{errors["mainParticipant.fullName"]}</div>
            )}
            <select
              name="mainParticipant.gender"
              value={formData.mainParticipant.gender}
              onChange={handleSelectChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors["mainParticipant.gender"] && (
              <div className="text-red-500 text-sm mt-1">{errors["mainParticipant.gender"]}</div>
            )}
            <input
              type="date"
              name="mainParticipant.dateOfBirth"
              value={formData.mainParticipant.dateOfBirth}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors["mainParticipant.dateOfBirth"] && (
              <div className="text-red-500 text-sm mt-1">{errors["mainParticipant.dateOfBirth"]}</div>
            )}
            <input
              type="tel"
              name="mainParticipant.phoneNumber"
              value={formData.mainParticipant.phoneNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Phone Number"
            />
            {errors["mainParticipant.phoneNumber"] && (
              <div className="text-red-500 text-sm mt-1">{errors["mainParticipant.phoneNumber"]}</div>
            )}
            <input
              type="email"
              name="mainParticipant.email"
              value={formData.mainParticipant.email}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email Address"
            />
            {errors["mainParticipant.email"] && (
              <div className="text-red-500 text-sm mt-1">{errors["mainParticipant.email"]}</div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Related Participant (if applicable)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="relatedParticipant.fullName"
              value={formData.relatedParticipant.fullName}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Full Name"
            />
            {errors["relatedParticipant.fullName"] && (
              <div className="text-red-500 text-sm mt-1">{errors["relatedParticipant.fullName"]}</div>
            )}
            <select
              name="relatedParticipant.gender"
              value={formData.relatedParticipant.gender}
              onChange={handleSelectChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors["relatedParticipant.gender"] && (
              <div className="text-red-500 text-sm mt-1">{errors["relatedParticipant.gender"]}</div>
            )}
            <input
              type="date"
              name="relatedParticipant.dateOfBirth"
              value={formData.relatedParticipant.dateOfBirth}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors["relatedParticipant.dateOfBirth"] && (
              <div className="text-red-500 text-sm mt-1">{errors["relatedParticipant.dateOfBirth"]}</div>
            )}
            <input
              type="tel"
              name="relatedParticipant.phoneNumber"
              value={formData.relatedParticipant.phoneNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Phone Number"
            />
            {errors["relatedParticipant.phoneNumber"] && (
              <div className="text-red-500 text-sm mt-1">{errors["relatedParticipant.phoneNumber"]}</div>
            )}
            <input
              type="email"
              name="relatedParticipant.email"
              value={formData.relatedParticipant.email}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email Address"
            />
            {errors["relatedParticipant.email"] && (
              <div className="text-red-500 text-sm mt-1">{errors["relatedParticipant.email"]}</div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Selected Services</label>
          <div className="grid gap-2">
            {selectedServices.map(service => (
              <div key={service.servicePackageId} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                <span>{servicePackages.find(sp => sp.id === service.servicePackageId)?.name}</span>
                <span>${service.price}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveService(service.servicePackageId)}
                  className="text-red-500 hover:text-red-700"
                >
                  X
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <strong>Total: ${total}</strong>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Submit Booking
        </button>
      </form>
    </div>
  );
};

export default FillBookingForm; 
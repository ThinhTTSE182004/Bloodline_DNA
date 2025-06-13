import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ServiceDetail = ({ service, onClose }) => {
  if (!service) {
    return null; // Don't render the modal if no service is selected
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 focus:outline-none"
        >
          <FaTimes className="w-6 h-6" />
        </button>
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-blue-600 mb-2">{service.name}</h1>
            <p className="text-gray-600">{service.description}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="md:w-1/2 flex justify-center">
              <img src={service.image} alt={service.name} className="w-full h-auto max-w-xs rounded-lg shadow-md" />
            </div>
            <div className="md:w-1/2 space-y-4 text-gray-700">
              <p className="text-2xl font-bold text-blue-600">${service.price.toFixed(2)}</p>
              <p className="text-base">**More Details:** {service.details}</p>
              <div className="flex gap-4 mt-6">
                <button
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 text-center"
                >
                  Add to Cart
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-300 text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail; 
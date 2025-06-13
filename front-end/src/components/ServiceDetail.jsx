import React from 'react';
import { FaTimes, FaShoppingCart } from 'react-icons/fa';

const ServiceDetail = ({ service, onClose, onAddToCart }) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        <div className="h-64 w-full overflow-hidden rounded-lg mb-6">
          <img
            src={`https://source.unsplash.com/800x400/?dna,${service.serviceName.toLowerCase().replace(/\s+/g, ',')}`}
            alt={service.serviceName}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">{service.serviceName}</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Details</h3>
            <p className="text-gray-600">{service.description || 'No description available'}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What's Included</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Professional DNA Analysis</li>
              <li>Detailed Report</li>
              <li>Expert Consultation</li>
              <li>Secure Data Storage</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <p className="text-2xl font-bold text-blue-600 mb-4">
              ${service.price.toLocaleString()}
            </p>
            <button
              onClick={() => {
                onAddToCart(service);
                onClose();
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
            >
              <FaShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail; 
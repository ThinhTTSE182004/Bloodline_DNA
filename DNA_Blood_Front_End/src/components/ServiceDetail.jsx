import React, { useEffect } from 'react';
import { FaTimes, FaShoppingCart } from 'react-icons/fa';

const ServiceDetail = ({ service, onClose, onAddToCart }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 relative animate-slideIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transform transition-all duration-300 hover:scale-110"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 transform transition-all duration-300 hover:scale-105">
              {service.serviceName}
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto mb-4 transition-all duration-300 hover:w-32"></div>
          </div>
          
          <div className="space-y-6">
            <div className="transform transition-all duration-300 hover:scale-105">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Details</h3>
              <p className="text-gray-600 leading-relaxed">{service.description || 'No description available'}</p>
            </div>

            <div className="transform transition-all duration-300 hover:scale-105">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">What's Included</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-3">
                <li className="transform transition-all duration-300 hover:translate-x-2">Professional DNA Analysis</li>
                <li className="transform transition-all duration-300 hover:translate-x-2">Detailed Report</li>
                <li className="transform transition-all duration-300 hover:translate-x-2">Expert Consultation</li>
                <li className="transform transition-all duration-300 hover:translate-x-2">Secure Data Storage</li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-6">
                <p className="text-3xl font-bold text-blue-600 transform transition-all duration-300 hover:scale-105">
                  ${service.price.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  onAddToCart(service);
                  onClose();
                }}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                <FaShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail; 
import React, { useEffect } from 'react';
import { FaTimes, FaShoppingCart } from 'react-icons/fa';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../ui/card';

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
      <Card className="max-w-2xl w-full mx-4 relative animate-slideIn bg-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transform transition-all duration-300 hover:scale-110 z-10"
        >
          <FaTimes className="w-6 h-6" />
        </button>
        <CardHeader className="items-center">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2 text-center cursor-default hover:text-black">
            {service.serviceName}
          </CardTitle>
          <div className="w-20 h-1 bg-blue-500 mx-auto mb-4 transition-all duration-300 hover:w-32"></div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center">
            <img
              src="/img/DNA.png"
              alt={service.serviceName}
              className="w-32 h-32 object-cover rounded mb-4"
            />
            <CardDescription className="mb-4 text-center text-gray-600 leading-relaxed">
              {service.description || 'No description available'}
            </CardDescription>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 cursor-default">Service Details</h3>
            <p className="text-gray-600 leading-relaxed">{service.description || 'No description available'}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 cursor-default">What's Included</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-3">
              <li>Professional DNA Analysis</li>
              <li>Detailed Report</li>
              <li>Expert Consultation</li>
              <li>Secure Data Storage</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex-col border-t pt-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-3xl font-bold text-blue-600 cursor-default hover:text-blue-700">
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default ServiceDetail; 
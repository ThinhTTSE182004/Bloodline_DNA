import React from 'react';
import { FaDna } from 'react-icons/fa6';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useServices } from '../context/ServiceContext';
import { Link } from 'react-router-dom';

const Services = () => {
  const { services, loading, error } = useServices();
  const { addToCart } = useCart();

  const handleAddToCart = (service) => {
    addToCart(service);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>Error loading services: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <FaDna className="w-8 h-8 mr-3 text-blue-600" />
            Our Services
          </h2>
          <p className="text-lg text-gray-600">Discover our comprehensive DNA testing services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.length > 0 ? (
            services.map((service) => (
              <div key={service.servicePackageId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src="/img/DNA.png"
                    alt={service.serviceName}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <Link 
                    to={`/fill-booking-form?service=${service.servicePackageId}`}
                    className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors duration-300 block"
                  >
                    {service.serviceName}
                  </Link>
                  <div className="text-blue-600 font-semibold mb-4">
                    ${service.price.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleAddToCart(service)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    <FaShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center col-span-full">No services available at the moment.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Services; 
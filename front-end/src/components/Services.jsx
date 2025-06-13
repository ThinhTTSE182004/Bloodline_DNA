import React from 'react';
import { FaDna } from 'react-icons/fa6';

const Services = ({ services }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h4 className="text-blue-600 font-semibold mb-4">Our Services</h4>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">We Provide Best Services</h1>
          <p className="text-lg text-gray-600">
            Explore our comprehensive DNA testing services designed to help you understand your ancestry, health predispositions, and genetic traits.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services && services.length > 0 ? (
            services.map((service) => (
              <div key={service.ServicePackageId} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                <div className="relative">
                  <img 
                    src="/img/blog-4.png" 
                    alt={service.ServiceName} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white p-3 rounded-full">
                    <FaDna className="h-6 w-6" />
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{service.ServiceName}</h4>
                  <p className="text-gray-600 mb-4">{service.Description}</p>
                  <div className="text-blue-600 font-semibold mb-4" data-id={service.ServicePackageId}>
                    Loading...
                  </div>
                  <button 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition"
                    data-id={service.ServicePackageId}
                    data-name={service.ServiceName}
                  >
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
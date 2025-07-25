import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaDna, FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { useServices } from '../../context/ServiceContext';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import ServiceDetail from '../customer/ServiceDetail';

const Services = () => {
  const { services, loading, error } = useServices();
  const { addToCart } = useCart();
  const [startIndex, setStartIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleAddToCart = (service) => {
    addToCart(service);
  };

  const handleViewDetails = (service) => {
    setSelectedService(service);
  };

  const closeModal = () => {
    setSelectedService(null);
  };

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setStartIndex((prevIndex) => 
      prevIndex + 1 >= services.length ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setStartIndex((prevIndex) => 
      prevIndex === 0 ? services.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>Error loading services: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Create a circular array by duplicating services
  const circularServices = [...services, ...services.slice(0, 3)];

  // Gom className cho card dịch vụ để dễ chỉnh sửa
  const cardClass = [
    "flex-none w-[320px] h-[320px] bg-white rounded-2xl shadow-lg overflow-hidden",
    "hover:scale-105 transition-transform duration-300 flex flex-col"
  ].join(' ');

  return (
    <section id="services" className="py-16 bg-gray-50 w-full">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center cursor-default">
            <FaDna className="w-8 h-8 mr-3 text-blue-600" />
            Our Services
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            Discover our comprehensive DNA testing services
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative w-full">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors duration-300"
          >
            <FaChevronLeft className="w-6 h-6 text-blue-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors duration-300"
          >
            <FaChevronRight className="w-6 h-6 text-blue-600" />
          </button>

          {/* Services Carousel */}
          <div className="relative w-full overflow-hidden px-4 py-6">
            <div 
              className={`flex gap-6 transition-transform duration-500 ease-in-out ${isTransitioning ? 'transform-gpu' : ''}`}
              style={{
                transform: `translateX(-${startIndex * 424}px)`,
                width: 'fit-content'
              }}
            >
              {circularServices.map((service, index) => (
                <div
                  key={`${service.servicePackageId}-${index}`}
                  className={cardClass}
                >
                  {/* Ảnh dịch vụ */}
                  <div className="w-full aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src="/img/DNA.png"
                      alt={service.serviceName}
                      className="w-full h-full object-cover transition-transform duration-300"
                    />
                  </div>
                  {/* Nội dung dịch vụ */}
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <span
                      onClick={() => handleViewDetails(service)}
                      className="text-base font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors duration-300 block cursor-pointer"
                      role="button"
                      tabIndex={0}
                    >
                      {service.serviceName}
                    </span>
                    <div className="text-blue-600 font-semibold text-base mb-2 cursor-default">
                      ${service.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 mb-2 line-clamp-2 min-h-[36px]">
                      {service.description || "Professional DNA testing service with accurate results and detailed analysis."}
                    </div>
                    <button
                      onClick={() => handleAddToCart(service)}
                      className="w-full bg-blue-600 text-white py-2 px-3 rounded-full hover:bg-blue-700 transition text-sm font-semibold mt-auto"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* More Services Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-center mt-12"
          >
            <Link
              to="/services"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View All Services
              <FaArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal hiển thị chi tiết service */}
      {selectedService && (
        <ServiceDetail
          service={selectedService}
          onClose={closeModal}
          onAddToCart={handleAddToCart}
        />
      )}
    </section>
  );
};

export default Services; 
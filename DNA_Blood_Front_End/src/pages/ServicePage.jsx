import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaSearch, FaCalendarAlt, FaFilter, FaDna, FaShoppingCart } from 'react-icons/fa';
import ServiceDetail from '../components/ServiceDetail';
import { useCart } from '../context/CartContext';
import { useServices } from '../context/ServiceContext';

const ServicePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const { addToCart } = useCart();
  const { services, loading, error, setServices } = useServices();

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = services.filter(service => 
      service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setServices(filtered);
  };

  const handleOpenDetailModal = (service) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedService(null);
  };

  const handleAddToCart = (service) => {
    addToCart(service);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center text-red-600">
            <p>Error loading services: {error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Search and Filter Section */}
          <div className="bg-white shadow rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
            >
              <FaFilter className="w-5 h-5 mr-2" />
              Filter
            </button>
          </div>

          {/* Our Services Section */}
          <div>
            <h2 className="text-2xl font-bold text-blue-600 text-center mb-8 flex items-center justify-center">
              <FaDna className="w-7 h-7 mr-3" />
              Our Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service.servicePackageId} className="bg-white shadow rounded-lg overflow-hidden">
                  {/* Service Image */}
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src="\img\DNA.png"
                      alt={service.serviceName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.serviceName}</h3>
                    <p className="text-lg font-bold text-blue-600 mb-4">${service.price.toLocaleString()}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleOpenDetailModal(service)}
                        className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-300"
                      >
                        More Details
                      </button>
                      <button
                        onClick={() => handleAddToCart(service)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
                      >
                        <FaShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      {showDetailModal && (
        <ServiceDetail 
          service={selectedService} 
          onClose={handleCloseDetailModal}
          onAddToCart={handleAddToCart}
        />
      )}
      <Footer />
    </div>
  );
};

export default ServicePage;

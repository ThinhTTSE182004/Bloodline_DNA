import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import dnaImage from '/img/adn.png'; // Assuming adn.png is in public/img
import ServiceDetail from './ServiceDetail'; // Import ServiceDetail as a modal component
import { FaSearch, FaCalendarAlt, FaFilter, FaDna, FaShoppingCart } from 'react-icons/fa';

const Service = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [displayServices, setDisplayServices] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false); // State để quản lý modal
  const [selectedService, setSelectedService] = useState(null); // State để lưu dịch vụ được chọn

  // Dữ liệu dịch vụ giả định
  const staticServices = [
    {
      id: 1,
      name: "Maternal Ancestry Test",
      description: "Test to determine maternal lineage based on mitochondrial DNA (mtDNA)",
      price: 3000.00,
      image: dnaImage,
      details: "Comprehensive maternal lineage report, access to mtDNA database, and personalized historical migration map."
    },
    {
      id: 2,
      name: "Paternal Ancestry Test",
      description: "Test to determine paternal lineage based on Y-chromosome DNA (Y-STR)",
      price: 2500.00,
      image: dnaImage,
      details: "Detailed paternal lineage report, Y-DNA haplogroup analysis, and connection to potential paternal relatives."
    },
    {
      id: 3,
      name: "Family Ancestry Test",
      description: "DNA analysis to identify family relationships within a household",
      price: 4000.00,
      image: dnaImage,
      details: "Autosomal DNA analysis, ethnicity estimates, relative matching, and family tree building tools."
    },
    {
      id: 4,
      name: "Sibling Relationship Test",
      description: "Determine if two individuals share common parents",
      price: 3500.00,
      image: dnaImage,
      details: "Statistical analysis of shared DNA markers, high accuracy for full and half-sibling relationships."
    },
    {
      id: 5,
      name: "Grandparentage Test",
      description: "Establish biological relationships between a child and their grandparents",
      price: 2800.00,
      image: dnaImage,
      details: "Indirect verification of grandparent-grandchild biological relationship with comprehensive report."
    },
    {
      id: 6,
      name: "Avuncular Test",
      description: "Determine if an individual is biologically related to a sibling of a tested parent",
      price: 2700.00,
      image: dnaImage,
      details: "Confirmation of avuncular relationship, ideal for cases where direct parental testing is not possible."
    },
  ];

  useEffect(() => {
    // TODO: Tích hợp API để tải tất cả các gói dịch vụ tại đây
    /*
    fetch('/api/services')
      .then(response => response.json())
      .then(data => setDisplayServices(data))
      .catch(error => console.error('Error fetching services:', error));
    */

    // Giả định tải dữ liệu tĩnh sau một khoảng thời gian ngắn
    const timer = setTimeout(() => {
      setDisplayServices(staticServices);
    }, 500); // Giả lập độ trễ 500ms

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search Term:', searchTerm, 'Filter Date:', filterDate);
    // TODO: Tích hợp API để tìm kiếm và lọc dịch vụ tại đây
    /*
    fetch('/api/services/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchTerm, filterDate }),
    })
    .then(response => response.json())
    .then(data => {
      setDisplayServices(data);
    })
    .catch(error => console.error('Error searching services:', error));
    */

    // Giả lập lọc dữ liệu tĩnh
    const filtered = staticServices.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
      // Thêm logic lọc theo ngày nếu cần
    );
    setDisplayServices(filtered);
  };

  const handleOpenDetailModal = (service) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedService(null);
  };

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
              {displayServices.map((service) => (
                <div key={service.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <img src={service.image} alt={service.name} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                    <p className="text-lg font-bold text-blue-600 mb-4">${service.price.toFixed(2)}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleOpenDetailModal(service)}
                        className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-300 text-center"
                      >
                        Details
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
                      >
                        <FaShoppingCart className="w-5 h-5 mr-2" />Add to Cart
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
        <ServiceDetail service={selectedService} onClose={handleCloseDetailModal} />
      )}
      <Footer />
    </div>
  );
};

export default Service;

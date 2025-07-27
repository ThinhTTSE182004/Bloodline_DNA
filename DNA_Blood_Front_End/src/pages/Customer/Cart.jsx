import React, { useState } from 'react';
import Navbar from '../../components/customer/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingBag, FaShieldAlt, FaTruck, FaHeadphones } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import ServiceDetail from '../../components/customer/ServiceDetail';
import { motion } from 'framer-motion';

const Cart = () => {
  const [selectedItems, setSelectedItems] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();
  const { cartItems, removeFromCart } = useCart();

  const handleSelectItem = (id) => {
    setSelectedItems(prevSelected => {
      if (prevSelected[id]) {
        const newSelected = { ...prevSelected };
        delete newSelected[id];
        return newSelected;
      }
      return { [id]: true };
    });
  };

  const handleDeleteItem = (serviceId) => {
    removeFromCart(serviceId);
    setSelectedItems(prevSelected => {
      const newSelected = { ...prevSelected };
      delete newSelected[serviceId];
      return newSelected;
    });
  };

  const handleOpenDetailModal = (service) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedService(null);
  };

  const selectedItemsCount = Object.values(selectedItems).filter(Boolean).length;
  const subtotal = cartItems.reduce((sum, item) => {
    return selectedItems[item.servicePackageId] ? sum + item.price : sum;
  }, 0);
  const total = subtotal;

  const handlePlaceOrder = () => {
    const itemsToOrder = cartItems.filter(item => selectedItems[item.servicePackageId]);
    if (itemsToOrder.length === 0) {
      alert('Please select one service to place an order.');
      return;
    }
    if (itemsToOrder.length > 1) {
      alert('You can only select one service at a time for booking.');
      return;
    }

    sessionStorage.setItem('selectedServices', JSON.stringify(itemsToOrder));
    navigate('/fill-booking');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-lg p-6 text-center">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl font-bold text-blue-700 mb-4 hover:text-blue-600 hover:cursor-default">
                  YOUR SHOPPING CART
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="w-24 h-1 bg-blue-500 mx-auto mb-4">
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-lg text-gray-700 hover:text-gray-900 hover:cursor-default">
                  Review your selected services and proceed to checkout
              </motion.p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Services List Section */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white border-3 border-gray-300 rounded-lg p-6">
                <div className="mb-4">
                  <motion.h2 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-2xl font-bold text-gray-900 hover:text-black cursor-default">
                      Selected Services
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-base text-gray-600 hover:text-gray-800 hover:cursor-default ">
                      Review and manage your selected services
                  </motion.p>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="border-3 border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-base font-semibold text-gray-700 uppercase border-b-2 border-gray-300 hover:text-black cursor-default">
                          Service Name
                        </th>
                        <th scope="col" className="px-4 py-3 text-center text-base font-semibold text-gray-700 uppercase border-b-2 border-gray-300 hover:text-black cursor-default">
                          Price
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-base font-semibold text-gray-700 uppercase border-b-2 border-gray-300 hover:text-black cursor-default">
                          Select
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-base font-semibold text-gray-700 uppercase border-b-2 border-gray-300 hover:text-black cursor-default">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cartItems.map((item) => (
                        <tr key={item.servicePackageId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-lg mr-3 border-2 border-blue-200">
                                <FaShoppingBag className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <button
                                  onClick={() => handleOpenDetailModal(item)}
                                  className="text-base font-medium text-gray-900 hover:text-blue-600"
                                >
                                  {item.serviceName}
                                </button>
                                <div className="text-sm text-gray-500">Service ID: {item.servicePackageId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-200 text-center group">
                            <div className="text-base text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full inline-block border-2 border-blue-200 text-center group-hover:bg-blue-100 group-hover:border-blue-400 group-hover:text-blue-700 group-hover:cursor-default">
                              ${item.price.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center group hover:cursor-pointer">
                              <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600 rounded border-2 orderb-gray-300 transition-colors duration-200 group-hover:text-gray-500 cursor-pointer"
                                checked={selectedItems[item.servicePackageId] || false}
                                onChange={() => handleSelectItem(item.servicePackageId)}
                              />
                              <span className="ml-2 text-base text-gray-600 transition-colors duration-200 group-hover:text-gray-800 cursor-pointer">
                                {selectedItems[item.servicePackageId] ? 'Selected' : 'Select (Only 1 allowed)'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-200">
                            <button
                              onClick={() => handleDeleteItem(item.servicePackageId)}
                              className="text-red-600 hover:text-red-500 bg-red-50 p-2 rounded-full border-2 border-red-200"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {cartItems.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-6 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <FaShoppingBag className="w-12 h-12 mb-3 text-gray-400" />
                              <p className="text-xl font-medium hover:cursor-default">Your cart is empty</p>
                              <p className="text-base mt-1 hover:cursor-default">Add some services to get started</p>
                              <Link
                                to="/services"
                                className="mt-3 px-4 py-2 bg-blue-600 text-white text-base rounded-md hover:bg-blue-700 border-2 border-blue-700 hover:cursor-pointer"
                              >
                                Browse Services
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              </motion.div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1 space-y-4">
              {/* Order Summary Card */}
              <motion.div 
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white border-3 border-gray-300 rounded-lg p-6">
                <motion.h2 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-2xl font-bold text-gray-800 mb-4 hover:text-gray-900 hover:cursor-default">
                    Order Summary
                </motion.h2>
                <div className="space-y-3">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex justify-between text-base text-gray-700 border-b-2 border-gray-200 pb-2 cursor-default hover:text-gray-900">
                    <span className="cursor-default">Selected Item:</span>
                    <span className="font-semibold cursor-default">{selectedItemsCount === 1 ? '1 Service' : 'No Service Selected'}</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex justify-between text-base text-gray-700 border-b-2 border-gray-200 pb-2 cursor-default hover:text-gray-900">
                    <span className="cursor-default">Subtotal:</span>
                    <span className="font-semibold cursor-default">${subtotal.toLocaleString()}</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex justify-between text-lg font-bold text-blue-700 pt-2 cursor-default hover:text-blue-600">
                    <span className="cursor-default">Total:</span>
                    <span className="cursor-default">${total.toLocaleString()}</span>
                  </motion.div>
                </div>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  onClick={handlePlaceOrder}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white text-base rounded-md hover:bg-blue-700 flex items-center justify-center font-semibold border-2 border-blue-700"
                >
                  <FaShoppingBag className="w-5 h-5 mr-2" />
                  Place Order
                </motion.button>
                <motion.Link
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  to="/services"
                  className="mt-3 w-full px-4 py-2 border-3 border-blue-600 text-blue-600 text-base rounded-md hover:bg-blue-50 flex items-center justify-center font-semibold"
                >
                  Add More Services
                </motion.Link>
              </motion.div>

              {/* Trust Features Card */}
              <motion.div 
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white border-3 border-gray-300 rounded-lg p-6">
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex items-center gap-3 border-b-2 border-gray-200 pb-3">
                    <div className="bg-blue-100 p-2 rounded-lg border-2 border-blue-200">
                      <FaShieldAlt className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 hover:cursor-default hover:text-gray-900">Secure Payment</h3>
                      <p className="text-sm text-gray-600 hover:cursor-default hover:text-gray-800">Your payment information is protected</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex items-center gap-3 border-b-2 border-gray-200 pb-3">
                    <div className="bg-blue-100 p-2 rounded-lg border-2 border-blue-200">
                      <FaTruck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 hover:cursor-default hover:text-gray-900">Fast Delivery</h3>
                      <p className="text-sm text-gray-600 hover:cursor-default hover:text-gray-800">Quick and reliable service delivery</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg border-2 border-blue-200">
                      <FaHeadphones className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 hover:cursor-default hover:text-gray-900">24/7 Support</h3>
                      <p className="text-sm text-gray-600 hover:cursor-default hover:text-gray-800">We're here to help you anytime</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      {showDetailModal && (
        <ServiceDetail 
          service={selectedService} 
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default Cart; 
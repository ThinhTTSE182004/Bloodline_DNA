import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingBag, FaShieldAlt, FaTruck, FaHeadphones } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import ServiceDetail from '../components/ServiceDetail';

const Cart = () => {
  const [selectedItems, setSelectedItems] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();
  const { cartItems, removeFromCart } = useCart();

  const handleSelectItem = (id) => {
    setSelectedItems(prevSelected => ({
      ...prevSelected,
      [id]: !prevSelected[id]
    }));
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
      alert('Please select at least one service to place an order.');
      return;
    }
    // Save selected items to localStorage
    localStorage.setItem('selectedServices', JSON.stringify(itemsToOrder));
    navigate('/fill-booking-form');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">YOUR SHOPPING CART</h1>
            <div className="w-24 h-1 bg-blue-500 mx-auto mb-8"></div>
            <p className="text-gray-600">Review your selected services and proceed to checkout</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white shadow rounded-lg p-6 md:p-8">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Service Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Select
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={item.servicePackageId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src="\img\DNA.png"
                            alt={item.serviceName}
                            className="h-10 w-10 rounded-full object-cover mr-4"
                          />
                          <div>
                            <button
                              onClick={() => handleOpenDetailModal(item)}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-300 text-left"
                            >
                              {item.serviceName}
                            </button>
                            <div className="text-sm text-gray-500">Service ID: {item.servicePackageId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        ${item.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                          checked={selectedItems[item.servicePackageId] || false}
                          onChange={() => handleSelectItem(item.servicePackageId)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteItem(item.servicePackageId)}
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                        >
                          <FaTrash className="w-6 h-6" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cartItems.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        Your cart is empty.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:col-span-1 space-y-6">
              {/* Order Summary */}
              <div className="bg-white shadow rounded-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Selected Items:</span>
                    <span>{selectedItemsCount}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between text-xl font-bold text-blue-600">
                    <span>Total:</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center text-lg font-semibold"
                >
                  <FaShoppingBag className="w-6 h-6 mr-3" />
                  Place Order
                </button>
                <Link
                  to="/services"
                  className="mt-4 w-full px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center text-lg font-semibold"
                >
                  Add More Services
                </Link>
              </div>

              {/* Secure Payment / Fast Delivery / 24/7 Support */}
              <div className="bg-white shadow rounded-lg p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-4">
                  <FaShieldAlt className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Secure Payment</h3>
                    <p className="text-sm text-gray-600">Your payment information is protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <FaTruck className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Fast Delivery</h3>
                    <p className="text-sm text-gray-600">Quick and reliable service delivery</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <FaHeadphones className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">24/7 Support</h3>
                    <p className="text-sm text-gray-600">We're here to help you anytime</p>
                  </div>
                </div>
              </div>
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
      <Footer />
    </div>
  );
};

export default Cart; 
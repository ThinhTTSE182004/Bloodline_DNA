import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import dnaImage from '/img/adn.png'; // Reusing the DNA image for cart items
import { FaTrash, FaShoppingBag, FaPlus, FaShieldAlt, FaTruck, FaHeadphones } from 'react-icons/fa';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const navigate = useNavigate();

  // Static cart data for demonstration
  const staticCartItems = [
    {
      id: 5,
      name: "Parentage Verification Test",
      price: 2000.00,
      serviceId: 5,
      image: dnaImage
    },
    {
      id: 2,
      name: "Paternal Ancestry Test",
      price: 2500.00,
      serviceId: 2,
      image: dnaImage
    },
    {
      id: 7, // Unique ID for demonstration of multiple same services
      name: "Paternal Ancestry Test",
      price: 2500.00,
      serviceId: 2,
      image: dnaImage
    },
    {
      id: 3,
      name: "Family Ancestry Test",
      price: 4000.00,
      serviceId: 3,
      image: dnaImage
    },
    {
      id: 8, // Unique ID for demonstration of multiple same services
      name: "Family Ancestry Test",
      price: 4000.00,
      serviceId: 3,
      image: dnaImage
    },
    {
      id: 4,
      name: "Sibling Relationship Test",
      price: 6000.00,
      serviceId: 4,
      image: dnaImage
    },
    {
      id: 1,
      name: "Maternal Ancestry Test",
      price: 3000.00,
      serviceId: 1,
      image: dnaImage
    },
  ];

  useEffect(() => {
    // TODO: Tích hợp API để tải các sản phẩm trong giỏ hàng
    /*
    fetch('/api/cart/items')
      .then(response => response.json())
      .then(data => {
        setCartItems(data);
        const initialSelected = {};
        data.forEach(item => {
          initialSelected[item.id] = false; // Or true if items should be selected by default
        });
        setSelectedItems(initialSelected);
      })
      .catch(error => console.error('Error fetching cart items:', error));
    */
    
    // Simulate loading static data
    setCartItems(staticCartItems);
    const initialSelected = {};
    staticCartItems.forEach(item => {
      initialSelected[item.id] = false;
    });
    setSelectedItems(initialSelected);

  }, []);

  const handleSelectItem = (id) => {
    setSelectedItems(prevSelected => ({
      ...prevSelected,
      [id]: !prevSelected[id]
    }));
  };

  const handleDeleteItem = (id) => {
    // TODO: Tích hợp API để xóa sản phẩm khỏi giỏ hàng
    /*
    fetch(`/api/cart/items/${id}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (response.ok) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
        setSelectedItems(prevSelected => {
          const newSelected = { ...prevSelected };
          delete newSelected[id];
          return newSelected;
        });
      } else {
        console.error('Failed to delete item');
      }
    })
    .catch(error => console.error('Error deleting cart item:', error));
    */

    // Simulate deleting static data
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    setSelectedItems(prevSelected => {
      const newSelected = { ...prevSelected };
      delete newSelected[id];
      return newSelected;
    });
  };

  const selectedItemsCount = Object.values(selectedItems).filter(Boolean).length;
  const subtotal = cartItems.reduce((sum, item) => {
    return selectedItems[item.id] ? sum + item.price : sum;
  }, 0);
  const total = subtotal; // Assuming total is the same as subtotal for now

  const handlePlaceOrder = () => {
    const itemsToOrder = cartItems.filter(item => selectedItems[item.id]);
    if (itemsToOrder.length === 0) {
      alert('Please select at least one service to place an order.');
      return;
    }
    localStorage.setItem('cartItems', JSON.stringify(itemsToOrder));
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
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={item.image} alt={item.name} className="h-10 w-10 rounded-full object-cover mr-4" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">Service ID: {item.serviceId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        đ{item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                          checked={selectedItems[item.id] || false}
                          onChange={() => handleSelectItem(item.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
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
                    <span>đ{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between text-xl font-bold text-blue-600">
                    <span>Total:</span>
                    <span>đ{total.toFixed(2)}</span>
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
                  <FaPlus className="w-6 h-6 mr-3" />
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
      <Footer />
    </div>
  );
};

export default Cart; 
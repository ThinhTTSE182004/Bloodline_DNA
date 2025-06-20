import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Initialize cart items from localStorage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [cartCount, setCartCount] = useState(() => {
    // Initialize cart count from localStorage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart).length : 0;
  });

  const { addNotification, showAlert } = useNotification();
  const addNotificationTimeoutRef = useRef(null);
  const removeNotificationTimeoutRef = useRef(null);

  // Update localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    setCartCount(cartItems.length);
  }, [cartItems]);

  const addToCart = (service) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.servicePackageId === service.servicePackageId);
      if (existingItem) {
        showAlert('This service is already in your cart. Each service can only be added once.');
        return prevItems;
      }

      // Clear any existing notification timeout
      if (addNotificationTimeoutRef.current) {
        clearTimeout(addNotificationTimeoutRef.current);
      }

      // Set a new timeout for the notification
      addNotificationTimeoutRef.current = setTimeout(() => {
        addNotification(`Added ${service.serviceName} to your cart`, 'success');
      }, 100);

      const newItems = [...prevItems, { ...service, quantity: 1 }];
      return newItems;
    });
  };

  const removeFromCart = (serviceId) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.servicePackageId === serviceId);
      if (itemToRemove) {
        // Clear any existing notification timeout
        if (removeNotificationTimeoutRef.current) {
          clearTimeout(removeNotificationTimeoutRef.current);
        }

        // Set a new timeout for the notification
        removeNotificationTimeoutRef.current = setTimeout(() => {
          addNotification(`Removed ${itemToRemove.serviceName} from your cart`, 'success');
        }, 100);
      }
      return prevItems.filter(item => item.servicePackageId !== serviceId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    addNotification('Cart cleared successfully', 'success');
  };

  const updateQuantity = (serviceId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.servicePackageId === serviceId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const refreshCart = () => {
    const savedCart = localStorage.getItem('cart');
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (addNotificationTimeoutRef.current) {
        clearTimeout(addNotificationTimeoutRef.current);
      }
      if (removeNotificationTimeoutRef.current) {
        clearTimeout(removeNotificationTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 
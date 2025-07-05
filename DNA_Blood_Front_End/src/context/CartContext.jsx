import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

// Helper function to get user ID from JWT token
const getUserIdFromToken = () => {
  try {
    const token = sessionStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) return null;
    
    const tokenParts = token.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

// Helper function to get cart key for specific user
const getCartKey = (userId) => {
  return userId ? `cart_${userId}` : 'cart_guest';
};

// Helper function to get storage for user (localStorage for logged-in users, sessionStorage for guests)
const getStorage = (userId) => {
  return userId ? localStorage : sessionStorage;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [userId, setUserId] = useState(null);

  const { addNotification, showAlert } = useNotification();
  const addNotificationTimeoutRef = useRef(null);
  const removeNotificationTimeoutRef = useRef(null);

  // Initialize cart based on user authentication
  useEffect(() => {
    const currentUserId = getUserIdFromToken();
    setUserId(currentUserId);
    
    // Check if user should be logged out (sessionStorage token missing but localStorage token exists)
    const sessionToken = sessionStorage.getItem('token');
    const localToken = localStorage.getItem('token');
    
    if (localToken && !sessionToken) {
      // User has localStorage token but no sessionStorage token - auto logout
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      setUserId(null);
      // Load guest cart
      const savedCart = sessionStorage.getItem('cart_guest');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
        setCartCount(JSON.parse(savedCart).length);
      } else {
        setCartItems([]);
        setCartCount(0);
      }
      return;
    }
    
    if (currentUserId) {
      // User is logged in - load cart from localStorage for this user
      const cartKey = getCartKey(currentUserId);
      const storage = getStorage(currentUserId);
      const savedCart = storage.getItem(cartKey);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
        setCartCount(JSON.parse(savedCart).length);
      } else {
        // User doesn't have a saved cart, check for guest cart
        const guestCart = sessionStorage.getItem('cart_guest');
        if (guestCart) {
          // Transfer guest cart to user cart
          const guestItems = JSON.parse(guestCart);
          setCartItems(guestItems);
          setCartCount(guestItems.length);
          storage.setItem(cartKey, guestCart);
          sessionStorage.removeItem('cart_guest');
        } else {
          // No cart data, start with empty cart
          setCartItems([]);
          setCartCount(0);
        }
      }
    } else {
      // Guest user - load guest cart from sessionStorage
      const savedCart = sessionStorage.getItem('cart_guest');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
        setCartCount(JSON.parse(savedCart).length);
      } else {
        setCartItems([]);
        setCartCount(0);
      }
    }
  }, []);

  // Update storage whenever cartItems changes
  useEffect(() => {
    const cartKey = getCartKey(userId);
    const storage = getStorage(userId);
    storage.setItem(cartKey, JSON.stringify(cartItems));
    setCartCount(cartItems.length);
  }, [cartItems, userId]);

  // Listen for login/logout events
  useEffect(() => {
    const handleUserLogin = () => {
      const newUserId = getUserIdFromToken();
      setUserId(newUserId);
      
      if (newUserId) {
        // User logged in - load their cart from localStorage
        const cartKey = getCartKey(newUserId);
        const storage = getStorage(newUserId);
        const savedCart = storage.getItem(cartKey);
        if (savedCart) {
          // User has a saved cart, load it
          setCartItems(JSON.parse(savedCart));
          setCartCount(JSON.parse(savedCart).length);
        } else {
          // User doesn't have a saved cart, but keep current cart items
          // This allows guest cart items to be preserved when user logs in
          const currentCartItems = cartItems;
          if (currentCartItems.length > 0) {
            // Save current cart items to user's cart in localStorage
            storage.setItem(cartKey, JSON.stringify(currentCartItems));
            // Keep the current cart items, don't clear them
          } else {
            // No current items, set empty cart
            setCartItems([]);
            setCartCount(0);
          }
        }
      }
    };

    const handleUserLogout = () => {
      // Clear cart when user logs out
      setCartItems([]);
      setCartCount(0);
      setUserId(null);
      
      // Clear all cart data from sessionStorage (guest carts)
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cart_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    };

    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('userLogout', handleUserLogout);

    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
      window.removeEventListener('userLogout', handleUserLogout);
    };
  }, [cartItems]); // Add cartItems to dependency array so we can access current cart state

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
    const cartKey = getCartKey(userId);
    const storage = getStorage(userId);
    storage.removeItem(cartKey);
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
    const cartKey = getCartKey(userId);
    const storage = getStorage(userId);
    const savedCart = storage.getItem(cartKey);
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
    refreshCart,
    userId
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 
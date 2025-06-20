import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NotificationContainer, Alert } from '../components/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [alert, setAlert] = useState(null);

  const addNotification = (message, type = 'success', duration = 3000) => {
    const id = uuidv4();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showAlert = (message, type = 'error') => {
    setAlert({ message, type });
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const value = {
    addNotification,
    removeNotification,
    showAlert,
    hideAlert
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={hideAlert}
        />
      )}
    </NotificationContext.Provider>
  );
}; 
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  // Nếu bạn vẫn muốn giữ alert toàn cục, giữ lại logic này, nếu không thì bỏ luôn:
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'error') => {
    setAlert({ message, type });
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const value = {
    showAlert,
    hideAlert
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Nếu muốn giữ Alert toàn cục thì giữ lại đoạn dưới, nếu không thì bỏ luôn */}
      {/* {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={hideAlert}
        />
      )} */}
    </NotificationContext.Provider>
  );
}; 
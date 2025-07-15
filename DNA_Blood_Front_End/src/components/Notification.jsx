import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaTimes, FaFileAlt } from 'react-icons/fa';

const Notification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const variants = {
    initial: { opacity: 0, y: 50, scale: 0.3 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="w-6 h-6 text-red-500" />;
      case 'result':
        return <FaFileAlt className="w-6 h-6 text-blue-500" />;
      default:
        return <FaCheckCircle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'result':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg border ${getBackgroundColor()} z-50 min-w-[300px] max-w-md`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      <AnimatePresence>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
            duration={notification.duration}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const Alert = ({ message, type = 'error', onClose }) => {
  const variants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      default:
        return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`fixed top-0 left-0 right-0 p-4 ${getBackgroundColor()} border-b text-center z-50`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-sm font-medium hover:opacity-75 focus:outline-none"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Notification; 
import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import './ToastNotification.css';

const ToastNotification = ({ message, type = 'success', onClose }) => {
  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-icon">
        {type === 'success' ? (
          <FiCheckCircle size={24} />
        ) : (
          <FiAlertCircle size={24} />
        )}
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close" onClick={onClose}>
        <FiX size={18} />
      </button>
    </div>
  );
};

export default ToastNotification;

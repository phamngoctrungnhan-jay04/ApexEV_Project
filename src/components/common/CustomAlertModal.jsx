import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './CustomAlertModal.css';

const CustomAlertModal = ({ show, type = 'success', message, onClose }) => {
  return (
    show && (
      <div className="custom-alert-modal-overlay" onClick={onClose}>
        <div className={`custom-alert-modal ${type}`} onClick={(e) => e.stopPropagation()}>
          <div className="alert-icon-wrapper">
            {type === 'success' ? (
              <FiCheckCircle size={32} />
            ) : (
              <FiAlertCircle size={32} />
            )}
          </div>
          <div className="alert-message">{message}</div>
          <button className="alert-close-btn" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    )
  );
};

export default CustomAlertModal;

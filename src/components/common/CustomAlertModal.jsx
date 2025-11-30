import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './CustomAlertModal.css';

const CustomAlertModal = ({ show, type = 'success', message, onClose }) => {
  return (
    show && (
      <div className="custom-alert-modal-overlay">
        <div className={`custom-alert-modal ${type}`}>
          <div className="icon">
            {type === 'success' ? (
              <FiCheckCircle size={40} color="var(--success-color)" />
            ) : (
              <FiAlertCircle size={40} color="var(--danger-color)" />
            )}
          </div>
          <div className="message">{message}</div>
          <button className="close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    )
  );
};

export default CustomAlertModal;

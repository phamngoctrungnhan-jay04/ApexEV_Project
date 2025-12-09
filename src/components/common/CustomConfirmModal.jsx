import { FiAlertTriangle } from 'react-icons/fi';
import './CustomConfirmModal.css';

const CustomConfirmModal = ({ 
  show, 
  onConfirm, 
  onCancel, 
  title = 'Xác nhận', 
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?' 
}) => {
  if (!show) return null;

  return (
    <div className="custom-confirm-modal-overlay" onClick={onCancel}>
      <div className="custom-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrapper">
          <FiAlertTriangle size={32} />
        </div>
        <h4 className="confirm-title">{title}</h4>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Hủy
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomConfirmModal;

// File: src/components/features/QuoteRejectedAlert.jsx
// Component hiển thị alert khi customer từ chối báo giá và cho advisor chọn hành động

import React, { useState } from 'react';
import { Alert, Button, Modal, Spinner } from 'react-bootstrap';
import { FiAlertTriangle, FiRefreshCw, FiCheckCircle, FiPhone, FiEdit } from 'react-icons/fi';
import { reopenQuote, skipPartsAndComplete } from '../../services/partService';
import './QuoteRejectedAlert.css';

const QuoteRejectedAlert = ({ orderId, onActionComplete, rejectionReason }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'reopen' hoặc 'skip'
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleAction = (type) => {
    setActionType(type);
    setShowConfirmModal(true);
    setError('');
  };

  const executeAction = async () => {
    try {
      setProcessing(true);
      setError('');

      if (actionType === 'reopen') {
        // Gọi API để mở lại quote (QUOTE_REJECTED -> QUOTING)
        await reopenQuote(orderId);
        setShowConfirmModal(false);
        
        // Gọi callback với orderId để parent mở modal edit
        if (onActionComplete) {
          onActionComplete(actionType, orderId);
        }
      } else if (actionType === 'skip') {
        await skipPartsAndComplete(orderId);
        setShowConfirmModal(false);
        if (onActionComplete) {
          onActionComplete(actionType, orderId);
        }
      }
    } catch (err) {
      console.error(`Error ${actionType} quote:`, err);
      const errorMsg = err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Alert variant="warning" className="quote-rejected-alert">
        <div className="alert-header">
          <FiAlertTriangle className="alert-icon" />
          <div className="alert-content">
            <h5 className="alert-title">Khách hàng đã từ chối báo giá</h5>
            {rejectionReason && (
              <p className="alert-reason">
                <strong>Lý do:</strong> {rejectionReason}
              </p>
            )}
            <p className="alert-instruction">
              <FiPhone className="me-2" />
              Vui lòng liên hệ khách hàng qua số điện thoại để tư vấn phương án khác.
            </p>
          </div>
        </div>

        <div className="alert-actions">
          <Button
            variant="primary"
            className="action-btn reopen-btn"
            onClick={() => handleAction('reopen')}
          >
            <FiEdit className="me-2" />
            Chỉnh sửa báo giá
          </Button>
          <Button
            variant="success"
            className="action-btn skip-btn"
            onClick={() => handleAction('skip')}
          >
            <FiCheckCircle className="me-2" />
            Hoàn tất đơn (Bỏ qua phụ tùng)
          </Button>
        </div>
      </Alert>

      {/* Confirm Modal */}
      <Modal
        show={showConfirmModal}
        onHide={() => !processing && setShowConfirmModal(false)}
        centered
        backdrop={processing ? 'static' : true}
        className="quote-confirm-modal"
      >
        <Modal.Header closeButton={!processing}>
          <Modal.Title>
            {actionType === 'reopen' ? 'Xác nhận chỉnh sửa báo giá' : 'Xác nhận hoàn tất đơn'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          {actionType === 'reopen' && (
            <div>
              <p><strong>Bạn muốn chỉnh sửa báo giá và gửi lại cho khách hàng?</strong></p>
              <ul>
                <li>Hệ thống sẽ mở lại trạng thái báo giá (QUOTING)</li>
                <li>Bạn có thể chỉnh sửa, thêm hoặc xóa phụ tùng</li>
                <li>Sau khi hoàn tất, gửi báo giá mới cho khách hàng</li>
                <li>Khách hàng sẽ nhận email thông báo báo giá đã được cập nhật</li>
              </ul>
            </div>
          )}

          {actionType === 'skip' && (
            <div>
              <p><strong>Khách hàng đồng ý hoàn tất đơn hàng không thay phụ tùng?</strong></p>
              <ul>
                <li>Các yêu cầu phụ tùng sẽ bị hủy (không tính vào hóa đơn)</li>
                <li>Đơn hàng chỉ tính chi phí dịch vụ ban đầu</li>
                <li>Kỹ thuật viên sẽ hoàn tất công việc</li>
              </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
            disabled={processing}
          >
            Hủy
          </Button>
          <Button
            variant={actionType === 'reopen' ? 'primary' : 'success'}
            onClick={executeAction}
            disabled={processing}
          >
            {processing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                {actionType === 'reopen' ? (
                  <>
                    <FiEdit className="me-2" />
                    Chỉnh sửa báo giá
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="me-2" />
                    Xác nhận hoàn tất
                  </>
                )}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default QuoteRejectedAlert;

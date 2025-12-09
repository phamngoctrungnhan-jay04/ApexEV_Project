// File: src/pages/advisor/QuoteRejected.jsx
// Trang quản lý đơn hàng bị từ chối báo giá cho Advisor

import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiPhone, FiMail, FiUser, FiCheckCircle } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { Card, Spinner, Alert, Badge, Modal, Button } from 'react-bootstrap';
import AdvisorLayout from './AdvisorLayout';
import QuoteRejectedAlert from '../../components/features/QuoteRejectedAlert';
import EditPartsModal from '../../components/features/EditPartsModal';
import appointmentService from '../../services/appointmentService';
import './QuoteRejected.css';

function QuoteRejected() {
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showEditPartsModal, setShowEditPartsModal] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  useEffect(() => {
    fetchRejectedOrders();
  }, []);

  const fetchRejectedOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Lấy appointments và filter ra những đơn có status QUOTE_REJECTED
      const appointments = await appointmentService.getMyAdvisorAppointments();
      
      console.log('📋 Total appointments:', appointments.length);
      console.log('📋 All appointments:', appointments);
      
      // Filter: Chỉ kiểm tra serviceOrderStatus (backend trả về string, không phải object)
      const rejected = appointments.filter(apt => 
        apt.serviceOrderStatus === 'QUOTE_REJECTED'
      );
      
      console.log('✅ Filtered rejected orders:', rejected.length);
      setRejectedOrders(rejected);
    } catch (err) {
      console.error('Error fetching rejected orders:', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionComplete = (actionType, orderId) => {
    if (actionType === 'reopen') {
      // Mở modal chỉnh sửa phụ tùng
      setEditingOrderId(orderId);
      setShowEditPartsModal(true);
    } else {
      // Skip parts - Reload và hiện thông báo
      fetchRejectedOrders();
      setSelectedOrder(null);
      setSuccessMessage('Đã hoàn tất đơn hàng. Kỹ thuật viên sẽ tiếp tục công việc.');
      setShowSuccessModal(true);
    }
  };

  const handleEditPartsComplete = () => {
    // Sau khi chỉnh sửa phụ tùng xong
    setShowEditPartsModal(false);
    setEditingOrderId(null);
    fetchRejectedOrders();
    setSuccessMessage('Đã cập nhật báo giá thành công!');
    setShowSuccessModal(true);
  };

  return (
    <AdvisorLayout>
      <div className="quote-rejected-page">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">
              <FiAlertTriangle className="me-2" />
              Đơn hàng từ chối báo giá
            </h1>
            <p className="page-subtitle">Quản lý các đơn hàng mà khách hàng đã từ chối báo giá phụ tùng</p>
          </div>
          <button className="refresh-btn" onClick={fetchRejectedOrders} disabled={loading}>
            <FiRefreshCw className={loading ? 'spinning' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spinner animation="border" variant="primary" />
            <p>Đang tải danh sách...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : rejectedOrders.length === 0 ? (
          <Card className="empty-state">
            <Card.Body className="text-center py-5">
              <FiAlertTriangle size={64} className="text-muted mb-3" />
              <h5>Không có đơn hàng nào bị từ chối báo giá</h5>
              <p className="text-muted">Tất cả đơn hàng đang trong trạng thái bình thường</p>
            </Card.Body>
          </Card>
        ) : (
          <div className="orders-list">
            {rejectedOrders.map(apt => {
              // Lấy orderId từ serviceOrderId
              const orderId = apt.serviceOrderId;
              
              // Lấy thông tin từ flat fields (đã được populate từ backend)
              const customerName = apt.customerFullName || 'Không xác định';
              const customerPhone = apt.customerPhone || 'Không có';
              const customerEmail = apt.customerEmail || 'Không có';
              
              // Lấy thông tin xe từ flat fields
              const vehiclePlate = apt.vehicleLicensePlate || 'N/A';
              const vehicleBrand = apt.vehicleBrand || 'N/A';
              const vehicleModel = apt.vehicleModel || 'N/A';
              const vehicleInfo = vehiclePlate !== 'N/A' 
                ? `${vehicleBrand} ${vehicleModel} - ${vehiclePlate}`
                : 'Không xác định';
              
              return (
                <Card key={apt.id} className="order-card">
                  <Card.Body>
                    <div className="order-header">
                      <div>
                        <h5 className="order-title">Đơn hàng #{orderId}</h5>
                        <Badge bg="danger">Đã từ chối báo giá</Badge>
                      </div>
                    </div>

                    <div className="order-info">
                      <div className="info-row">
                        <FiUser className="info-icon" />
                        <div>
                          <span className="info-label">Khách hàng:</span>
                          <span className="info-value">{customerName}</span>
                        </div>
                      </div>
                      <div className="info-row">
                        <FiPhone className="info-icon" />
                        <div>
                          <span className="info-label">Điện thoại:</span>
                          <span className="info-value phone-number">{customerPhone}</span>
                        </div>
                      </div>
                      <div className="info-row">
                        <FiMail className="info-icon" />
                        <div>
                          <span className="info-label">Email:</span>
                          <span className="info-value">{customerEmail}</span>
                        </div>
                      </div>
                      <div className="info-row">
                        <FaCar className="info-icon" />
                        <div>
                          <span className="info-label">Xe:</span>
                          <span className="info-value">{vehicleInfo}</span>
                        </div>
                      </div>
                    </div>

                    <QuoteRejectedAlert
                      orderId={orderId}
                      onActionComplete={handleActionComplete}
                      rejectionReason={null}
                    />
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Success Modal */}
      <Modal 
        show={showSuccessModal} 
        onHide={() => setShowSuccessModal(false)}
        centered
        className="success-modal"
      >
        <Modal.Body className="text-center py-5">
          <div className="success-icon mb-3">
            <FiCheckCircle size={64} className="text-success" />
          </div>
          <h4 className="mb-3">Thành công!</h4>
          <p className="text-muted mb-4">{successMessage}</p>
          <Button 
            variant="primary" 
            onClick={() => setShowSuccessModal(false)}
            className="px-4"
          >
            Đóng
          </Button>
        </Modal.Body>
      </Modal>

      {/* Edit Parts Modal */}
      {showEditPartsModal && (
        <EditPartsModal
          orderId={editingOrderId}
          show={showEditPartsModal}
          onHide={() => {
            setShowEditPartsModal(false);
            setEditingOrderId(null);
          }}
          onComplete={handleEditPartsComplete}
        />
      )}
    </AdvisorLayout>
  );
}

export default QuoteRejected;

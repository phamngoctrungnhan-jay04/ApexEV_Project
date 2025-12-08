// File: src/pages/customer/OrderTracking.jsx
// Giao diện mới: Soft, Clean, Elegant - APEX EV

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiTool,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFileText
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { getOrderDetail } from '../../services/customerOrderService';
import { getServiceChecklistItemsForOrder } from '../../services/checklistService';
import OrderTimeline from '../../components/features/OrderTimeline';
import InvoicePreview from '../../components/features/InvoicePreview';
import { CustomButton } from '../../components/common';
import ToastNotification from '../../components/common/ToastNotification';
import './OrderTracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [isChecklistCompleted, setIsChecklistCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModalUrl, setImageModalUrl] = useState(null);
  const [serviceCompletionStatus, setServiceCompletionStatus] = useState({});
  const [previousChecklistItems, setPreviousChecklistItems] = useState([]);
  const [toastNotification, setToastNotification] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
    fetchChecklistItems();
    // Auto refresh mỗi 5s để cập nhật real-time
    const interval = setInterval(() => {
      fetchChecklistItems();
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Detect service completion or issues found
  useEffect(() => {
    if (checklistItems.length === 0 || previousChecklistItems.length === 0) {
      setPreviousChecklistItems(checklistItems);
      return;
    }

    // Group items theo service
    const groupByService = (items) => {
      return items.reduce((acc, item) => {
        const serviceId = item.serviceId || 'unknown';
        const serviceName = item.serviceName || 'Dịch vụ';
        
        if (!acc[serviceId]) {
          acc[serviceId] = {
            serviceName,
            items: []
          };
        }
        acc[serviceId].items.push(item);
        return acc;
      }, {});
    };

    const currentServices = groupByService(checklistItems);
    const previousServices = groupByService(previousChecklistItems);

    // Check từng service
    Object.entries(currentServices).forEach(([serviceId, { serviceName, items: currentItems }]) => {
      const previousItems = previousServices[serviceId]?.items || [];
      
      // Tính toán status
      const currentPending = currentItems.filter(i => !i.status || i.status === 'PENDING').length;
      const previousPending = previousItems.filter(i => !i.status || i.status === 'PENDING').length;
      
      const currentFailed = currentItems.filter(i => 
        i.status === 'FAILED' || 
        i.status === 'NEEDS_ATTENTION' || 
        i.status === 'NEEDS_REPLACEMENT'
      ).length;
      
      const previousFailed = previousItems.filter(i => 
        i.status === 'FAILED' || 
        i.status === 'NEEDS_ATTENTION' || 
        i.status === 'NEEDS_REPLACEMENT'
      ).length;

      // Case 1: Service vừa hoàn thành (pending: 0, trước đó còn pending)
      if (currentPending === 0 && previousPending > 0) {
        console.log(`🎉 Service "${serviceName}" đã hoàn thành!`);
        
        // Tạo notification
        const hasIssues = currentFailed > 0;
        const message = hasIssues 
          ? `Dịch vụ "${serviceName}" đã hoàn thành nhưng phát hiện ${currentFailed} vấn đề cần xử lý!`
          : `Dịch vụ "${serviceName}" đã hoàn thành xuất sắc! Tất cả các mục đều đạt yêu cầu.`;
        
        // Show toast notification
        showToast(message, hasIssues ? 'warning' : 'success');
        
        // Update service completion status
        setServiceCompletionStatus(prev => ({
          ...prev,
          [serviceId]: {
            completed: true,
            hasIssues,
            timestamp: new Date().toISOString(),
            message
          }
        }));
      }
      
      // Case 2: Phát hiện lỗi mới (failed tăng lên)
      if (currentFailed > previousFailed) {
        const newIssuesCount = currentFailed - previousFailed;
        console.log(`⚠️ Service "${serviceName}" phát hiện ${newIssuesCount} vấn đề mới!`);
        
        const message = `Kỹ thuật viên phát hiện ${newIssuesCount} vấn đề trong dịch vụ "${serviceName}". Vui lòng xem chi tiết!`;
        
        // Show notification
        showToast(message, 'warning');
      }
    });

    // Update previous state
    setPreviousChecklistItems(checklistItems);
  }, [checklistItems]);

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToastNotification({ message, type });
    // Auto hide after 5 seconds
    setTimeout(() => {
      setToastNotification(null);
    }, 5000);
  };

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderDetail(orderId);
      console.log('🔍 Order Data from API:', data);
      console.log('📋 Available fields:', Object.keys(data));
      setOrder(data);
    } catch (err) {
      console.error('Fetch order error:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchChecklistItems = async () => {
    try {
      console.log('🔄 Fetching service checklist items for orderId:', orderId);
      const response = await getServiceChecklistItemsForOrder(orderId);
      console.log('✅ Service checklist response:', response);
      
      // Response mới có cấu trúc: { isCompleted: boolean, items: [] }
      const items = response.items || [];
      const isCompleted = response.isCompleted || false;
      
      console.log('📊 Items status breakdown:', {
        total: items.length,
        passed: items.filter(i => i.status === 'PASSED').length,
        failed: items.filter(i => i.status === 'FAILED').length,
        attention: items.filter(i => i.status === 'NEEDS_ATTENTION').length,
        replacement: items.filter(i => i.status === 'NEEDS_REPLACEMENT').length,
        pending: items.filter(i => !i.status || i.status === 'PENDING').length,
        isCompleted: isCompleted
      });
      
      // Debug: Show first item structure
      if (items.length > 0) {
        console.log('🔍 First item structure:', items[0]);
        console.log('🔍 All statuses:', items.map(i => ({ name: i.itemName, status: i.status })));
      }
      
      setChecklistItems(items);
      setIsChecklistCompleted(isCompleted);
    } catch (err) {
      console.error('❌ Error fetching service checklist items:', err);
      // Nếu lỗi 404 (chưa có items), set empty array
      if (err.response?.status === 404 || err.response?.status === 204) {
        setChecklistItems([]);
        setIsChecklistCompleted(false);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    
    // Nếu là array từ Spring Boot: [year, month, day, hour, minute, second, nano]
    if (Array.isArray(dateString)) {
      const [year, month, day, hour, minute] = dateString;
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    // Nếu là string thông thường
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Chưa cập nhật';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format time for checklist items
  const formatTime = (dateString) => {
    if (!dateString) return null;
    
    // Nếu là array từ Spring Boot
    if (Array.isArray(dateString)) {
      const [, , , hour, minute] = dateString;
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    // Nếu là string thông thường
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      RECEPTION: { bg: 'info', text: 'Tiếp nhận' },
      INSPECTION: { bg: 'primary', text: 'Đang kiểm tra' },
      QUOTING: { bg: 'warning', text: 'Báo giá' },
      WAITING_FOR_PARTS: { bg: 'warning', text: 'Chờ phụ tùng' },
      IN_PROGRESS: { bg: 'primary', text: 'Đang thực hiện' },
      READY_FOR_INVOICE: { bg: 'success', text: 'Hoàn thành' },
      COMPLETED: { bg: 'success', text: 'Đã giao xe' },
      CANCELLED: { bg: 'danger', text: 'Đã hủy' }
    };
    return statusMap[status] || { bg: 'secondary', text: status };
  };

  // Get status config for checklist items
  if (loading) {
    return (
      <div className="order-tracking-fullscreen loading-screen">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking-fullscreen error-screen">
        <Alert variant="danger">
          <FiAlertCircle className="me-2" />
          {error}
        </Alert>
        <CustomButton variant="outline-primary" onClick={() => navigate('/customer/history')}>
          <FiArrowLeft className="me-2" />
          Quay lại
        </CustomButton>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-tracking-fullscreen empty-screen">
        <p className="text-muted">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  return (
    <div className="tracking-page-soft">
      {/* Toast Notification */}
      {toastNotification && (
        <ToastNotification
          message={toastNotification.message}
          type={toastNotification.type}
          onClose={() => setToastNotification(null)}
        />
      )}

      {/* Redesigned Compact Header */}
      <div className="tracking-header-compact">
        <Container>
          <div className="header-wrapper-compact">
            {/* Back Button */}
            <button className="btn-back-compact" onClick={() => navigate('/customer/history')}>
              <FiArrowLeft size={18} />
              <span>Quay lại</span>
            </button>

            {/* Status Badge - Moved to top right */}
            <div className={`status-badge-compact ${order.status.toLowerCase()}`}>
              {getStatusBadge(order.status).text}
            </div>
          </div>

          {/* Main Title Bar */}
          <div className="title-bar-compact">
            <div className="title-left">
              <div className="icon-compact">
                <FiTool size={20} />
              </div>
              <h1 className="title-compact">Theo dõi bảo dưỡng</h1>
            </div>
          </div>

          {/* Info Row - Compact 3 columns */}
          <div className="info-row-compact">
            <div className="info-col-compact">
              <span className="label-compact">Mã đơn</span>
              <span className="value-compact">{order.orderCode || `#${order.id}`}</span>
            </div>
            <div className="info-col-compact">
              <span className="label-compact">Thời gian</span>
              <span className="value-compact">{formatDate(order.createdAt)}</span>
            </div>
            {order.customerFullName && (
              <div className="info-col-compact">
                <span className="label-compact">Khách hàng</span>
                <span className="value-compact">{order.customerFullName}</span>
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="tracking-content-soft">
        {/* Quote Approval Banner - Chỉ hiện khi status = QUOTING */}
        {order.status === 'QUOTING' && (
          <Alert variant="warning" className="quote-approval-banner mb-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <FiFileText size={32} />
                <div>
                  <h5 className="mb-1">Báo giá phụ tùng đang chờ duyệt</h5>
                  <p className="mb-0 text-muted">
                    Đơn hàng của bạn có phụ tùng cần thay thế. Vui lòng xem và duyệt báo giá để tiếp tục.
                  </p>
                </div>
              </div>
              <CustomButton 
                variant="warning" 
                onClick={() => navigate(`/customer/quote-approval/${orderId}`)}
              >
                <FiFileText className="me-2" />
                Xem báo giá
              </CustomButton>
            </div>
          </Alert>
        )}

        <Row className="g-4">
          {/* Left Column - Timeline */}
          <Col xxl={8} xl={7} lg={7}>
            {/* Timeline Section */}
            <Card className="timeline-card-soft">
              <Card.Body>
                <OrderTimeline 
                  currentStatus={order.status} 
                  checklists={[]}
                  checklistItems={checklistItems}
                  isChecklistCompleted={isChecklistCompleted}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Info Cards */}
          <Col xxl={4} xl={5} lg={5}>
            <div className="info-sidebar-soft">
              {/* Vehicle Info */}
              <Card className="info-card-soft mb-3">
                <Card.Header className="info-card-header-soft">
                  <FaCar size={16} />
                  <span>Thông tin xe</span>
                </Card.Header>
                <Card.Body className="info-card-body-soft">
                  <div className="info-row-soft">
                    <FaCar size={16} className="info-icon-soft" />
                    <div>
                      <small>Xe</small>
                      <p>
                        {order.vehicleBrand && order.vehicleModel 
                          ? `${order.vehicleBrand} ${order.vehicleModel}` 
                          : 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                  <div className="info-row-soft">
                    <FiMapPin size={16} className="info-icon-soft" />
                    <div>
                      <small>Biển số</small>
                      <p>{order.vehicleLicensePlate || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Contact Info */}
              <Card className="info-card-soft mb-3">
                <Card.Header className="info-card-header-soft">
                  <FiUser size={16} />
                  <span>Thông tin liên hệ</span>
                </Card.Header>
                <Card.Body className="info-card-body-soft">
                  <div className="info-row-soft">
                    <FiUser size={16} className="info-icon-soft" />
                    <div>
                      <small>Khách hàng</small>
                      <p>{order.customerFullName || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  <div className="info-row-soft">
                    <FiPhone size={16} className="info-icon-soft" />
                    <div>
                      <small>Điện thoại</small>
                      <p>{order.customerPhone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  {order.customerEmail && (
                    <div className="info-row-soft">
                      <FiMail size={16} className="info-icon-soft" />
                      <div>
                        <small>Email</small>
                        <p>{order.customerEmail}</p>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Time Info */}
              <Card className="info-card-soft">
                <Card.Header className="info-card-header-soft">
                  <FiCalendar size={16} />
                  <span>Thời gian</span>
                </Card.Header>
                <Card.Body className="info-card-body-soft">
                  <div className="info-row-soft">
                    <FiCalendar size={16} className="info-icon-soft" />
                    <div>
                      <small>Tiếp nhận</small>
                      <p>{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  {order.completedAt && (
                    <div className="info-row-soft">
                      <FiCalendar size={16} className="info-icon-soft" />
                      <div>
                        <small>Hoàn thành</small>
                        <p>{formatDate(order.completedAt)}</p>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Notes Section */}
        {(order.customerDescription || order.advisorNotes || order.technicianNotes) && (
          <Row className="mt-4">
            <Col lg={12}>
              <Card className="notes-card-soft">
                <Card.Header className="notes-card-header-soft">
                  <FiTool size={16} />
                  <span>Ghi chú</span>
                </Card.Header>
                <Card.Body className="notes-card-body-soft">
                  {order.customerDescription && (
                    <div className="note-item-soft mb-3">
                      <div className="note-label-soft primary">
                        Yêu cầu của bạn
                      </div>
                      <p>{order.customerDescription}</p>
                    </div>
                  )}
                  {order.advisorNotes && (
                    <div className="note-item-soft mb-3">
                      <div className="note-label-soft success">
                        Ghi chú từ cố vấn
                      </div>
                      <p>{order.advisorNotes}</p>
                    </div>
                  )}
                  {order.technicianNotes && (
                    <div className="note-item-soft">
                      <div className="note-label-soft info">
                        Ghi chú từ kỹ thuật viên
                      </div>
                      <p>{order.technicianNotes}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Invoice Section */}
        <Row className="mt-4">
          <Col lg={12}>
            <InvoicePreview 
              invoice={order.invoice}
              orderItems={order.orderItems || []}
            />
          </Col>
        </Row>
      </Container>

      {/* Image Modal */}
      {imageModalUrl && (
        <div className="modal-overlay-soft" onClick={() => setImageModalUrl(null)}>
          <div className="modal-content-soft" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-soft" onClick={() => setImageModalUrl(null)}>
              <FiXCircle size={24} />
            </button>
            <img src={imageModalUrl} alt="Evidence Full" className="modal-image-soft" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;

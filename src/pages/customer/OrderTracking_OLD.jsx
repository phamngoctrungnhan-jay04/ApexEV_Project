// File: src/pages/customer/OrderTracking.jsx
// Trang theo dõi quy trình bảo dưỡng chi tiết (APEX Modern UI - Full Layout)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Accordion } from 'react-bootstrap';
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
  FiImage,
  FiFileText
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { getOrderDetail } from '../../services/customerOrderService';
import { getChecklistByOrderId } from '../../services/checklistService';
import OrderTimeline from '../../components/features/OrderTimeline';
import InvoicePreview from '../../components/features/InvoicePreview';
import { CustomButton } from '../../components/common';
import './OrderTracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    fetchOrderDetail();
    fetchChecklists();
    // Auto refresh mỗi 10s để cập nhật real-time
    const interval = setInterval(() => {
      fetchChecklists();
    }, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderDetail(orderId);
      setOrder(data);
    } catch (err) {
      console.error('Fetch order error:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchChecklists = async () => {
    try {
      const data = await getChecklistByOrderId(orderId);
      setChecklists(data || []);
    } catch (err) {
      console.error('Fetch checklists error:', err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải thông tin...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <FiAlertCircle className="me-2" />
          {error}
        </Alert>
        <CustomButton variant="outline-primary" onClick={() => navigate('/customer/history')}>
          <FiArrowLeft className="me-2" />
          Quay lại
        </CustomButton>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5 text-center">
        <p className="text-muted">Không tìm thấy đơn hàng</p>
      </Container>
    );
  }

  return (
    <Container fluid className="order-tracking-page">
      {/* Header */}
      <div className="page-header mb-4">
        <CustomButton 
          variant="ghost" 
          onClick={() => navigate('/customer/history')}
          className="mb-3"
        >
          <FiArrowLeft className="me-2" />
          Quay lại danh sách
        </CustomButton>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>Theo dõi quy trình bảo dưỡng</h2>
            <p className="text-muted mb-0">
              Mã đơn: <strong>{order.orderCode || `#${order.orderId}`}</strong>
            </p>
          </div>
          <div>
            {getStatusBadge(order.status)}
          </div>
        </div>
      </div>

      <Row>
        {/* Timeline */}
        <Col lg={8} className="mb-4">
          <Card className="timeline-card">
            <Card.Header>
              <h5>Quy trình thực hiện</h5>
            </Card.Header>
            <Card.Body>
              <OrderTimeline currentStatus={order.status} />
            </Card.Body>
          </Card>
        </Col>

        {/* Thông tin tổng quan */}
        <Col lg={4} className="mb-4">
          <Card className="info-card mb-3">
            <Card.Header>
              <h6><FaCar className="me-2" />Thông tin xe</h6>
            </Card.Header>
            <Card.Body>
              <div className="info-item">
                <FaCar className="info-icon" />
                <div>
                  <small className="text-muted">Xe</small>
                  <p className="mb-0 fw-bold">{order.vehicleBrand} {order.vehicleModel}</p>
                </div>
              </div>
              <div className="info-item">
                <FiMapPin className="info-icon" />
                <div>
                  <small className="text-muted">Biển số</small>
                  <p className="mb-0 fw-bold">{order.licensePlate}</p>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="info-card mb-3">
            <Card.Header>
              <h6><FiUser className="me-2" />Thông tin liên hệ</h6>
            </Card.Header>
            <Card.Body>
              {order.customerPhone && (
                <div className="info-item">
                  <FiPhone className="info-icon" />
                  <div>
                    <small className="text-muted">Điện thoại</small>
                    <p className="mb-0">{order.customerPhone}</p>
                  </div>
                </div>
              )}
              {order.customerEmail && (
                <div className="info-item">
                  <FiMail className="info-icon" />
                  <div>
                    <small className="text-muted">Email</small>
                    <p className="mb-0">{order.customerEmail}</p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="info-card">
            <Card.Header>
              <h6><FiCalendar className="me-2" />Thời gian</h6>
            </Card.Header>
            <Card.Body>
              <div className="info-item">
                <FiCalendar className="info-icon" />
                <div>
                  <small className="text-muted">Tiếp nhận</small>
                  <p className="mb-0">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              {order.completedAt && (
                <div className="info-item">
                  <FiCalendar className="info-icon" />
                  <div>
                    <small className="text-muted">Hoàn thành</small>
                    <p className="mb-0">{formatDate(order.completedAt)}</p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Hóa đơn */}
      <Row>
        <Col lg={12}>
          <InvoicePreview 
            invoice={order.invoice}
            orderItems={order.orderItems || []}
          />
        </Col>
      </Row>

      {/* Ghi chú */}
      {(order.customerDescription || order.advisorNotes || order.technicianNotes) && (
        <Row className="mt-4">
          <Col lg={12}>
            <Card className="notes-card">
              <Card.Header>
                <h6><FiTool className="me-2" />Ghi chú</h6>
              </Card.Header>
              <Card.Body>
                {order.customerDescription && (
                  <div className="note-section mb-3">
                    <strong className="text-primary">Yêu cầu của bạn:</strong>
                    <p className="mb-0 mt-1">{order.customerDescription}</p>
                  </div>
                )}
                {order.advisorNotes && (
                  <div className="note-section mb-3">
                    <strong className="text-success">Ghi chú từ cố vấn:</strong>
                    <p className="mb-0 mt-1">{order.advisorNotes}</p>
                  </div>
                )}
                {order.technicianNotes && (
                  <div className="note-section">
                    <strong className="text-info">Ghi chú từ kỹ thuật viên:</strong>
                    <p className="mb-0 mt-1">{order.technicianNotes}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default OrderTracking;

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
import { getChecklistsByOrder, getChecklistResults, getTemplateById } from '../../services/checklistService';
import { getFileViewUrl } from '../../services/uploadService';
import OrderTimeline from '../../components/features/OrderTimeline';
import InvoicePreview from '../../components/features/InvoicePreview';
import { CustomButton } from '../../components/common';
import './OrderTracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [checklistsWithItems, setChecklistsWithItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [imageModalUrl, setImageModalUrl] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
    fetchChecklists();
    // Auto refresh mỗi 5s để cập nhật real-time
    const interval = setInterval(() => {
      fetchChecklists();
    }, 5000);
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
      console.log('Fetching checklists for orderId:', orderId);
      const checklistsData = await getChecklistsByOrder(orderId);
      console.log('Checklists fetched:', checklistsData);
      setChecklists(checklistsData || []);
      
      // Fetch template items và results cho mỗi checklist
      if (checklistsData && checklistsData.length > 0) {
        const checklistsWithFullData = await Promise.all(
          checklistsData.map(async (checklist) => {
            try {
              // Fetch template và results song song
              const [template, results] = await Promise.all([
                getTemplateById(checklist.templateId),
                getChecklistResults(checklist.checklistId)
              ]);

              // Map template items với results
              const allItems = await Promise.all(
                template.items.map(async (templateItem) => {
                  const result = results.find(r => r.templateItemId === templateItem.id);
                  
                  // Nếu có evidence image, lấy presigned URL
                  let evidenceUrl = null;
                  if (result?.s3Key) {
                    try {
                      evidenceUrl = await getFileViewUrl(result.s3Key, 60);
                    } catch (err) {
                      console.error('Error fetching evidence URL:', err);
                    }
                  }

                  return {
                    templateItemId: templateItem.id,
                    itemName: templateItem.itemName,
                    itemDescription: templateItem.itemDescription,
                    estimatedTime: templateItem.estimatedTime,
                    isRequired: templateItem.isRequired,
                    status: result?.status || 'PENDING',
                    technicianNotes: result?.technicianNotes || null,
                    s3Key: result?.s3Key || null,
                    mediaType: result?.mediaType || null,
                    evidenceUrl: evidenceUrl,
                    createdAt: result?.createdAt || null
                  };
                })
              );

              return {
                ...checklist,
                items: allItems
              };
            } catch (err) {
              console.error('Error fetching checklist details:', err);
              return checklist;
            }
          })
        );
        
        setChecklistsWithItems(checklistsWithFullData);
        console.log('Checklists with full items:', checklistsWithFullData);
      } else {
        setChecklistsWithItems([]);
      }
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

  // Format time for checklist items
  const formatTime = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleTimeString('vi-VN', {
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
  const getItemStatusConfig = (status) => {
    const statusConfig = {
      PENDING: { 
        icon: <FiClock />, 
        className: 'item-pending', 
        text: 'Chờ kiểm tra',
        bgColor: '#FEF3C7',
        textColor: '#92400E'
      },
      PASSED: { 
        icon: <FiCheckCircle />, 
        className: 'item-passed', 
        text: 'Đạt',
        bgColor: '#D1FAE5',
        textColor: '#065F46'
      },
      FAILED: { 
        icon: <FiXCircle />, 
        className: 'item-failed', 
        text: 'Lỗi',
        bgColor: '#FEE2E2',
        textColor: '#991B1B'
      },
      NEEDS_ATTENTION: { 
        icon: <FiAlertCircle />, 
        className: 'item-attention', 
        text: 'Cần chú ý',
        bgColor: '#FED7AA',
        textColor: '#9A3412'
      },
      NEEDS_REPLACEMENT: { 
        icon: <FiTool />, 
        className: 'item-replacement', 
        text: 'Cần thay',
        bgColor: '#DBEAFE',
        textColor: '#1E40AF'
      }
    };
    return statusConfig[status] || statusConfig.PENDING;
  };

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
    <div className="order-tracking-fullscreen">
      {/* Header Full Width */}
      <div className="tracking-header">
        <Container fluid>
          <div className="header-content">
            <CustomButton 
              variant="ghost" 
              onClick={() => navigate('/customer/history')}
              className="back-btn"
            >
              <FiArrowLeft className="me-2" />
              Quay lại
            </CustomButton>
            <div className="header-title">
              <h1>Theo dõi quy trình bảo dưỡng</h1>
              <div className="order-meta">
                <span className="order-code">Mã đơn: <strong>{order.orderCode || `#${order.orderId}`}</strong></span>
                <Badge bg={getStatusBadge(order.status).bg} className="status-badge-modern">
                  {getStatusBadge(order.status).text}
                </Badge>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content Full Width */}
      <Container fluid className="tracking-content">
        <Row className="g-4">
          {/* Left Column - Timeline & Checklist */}
          <Col xxl={8} xl={7} lg={7}>
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                <FiFileText className="me-2" />
                Quy trình thực hiện
              </button>
              <button 
                className={`tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
                onClick={() => setActiveTab('checklist')}
              >
                <FiCheckCircle className="me-2" />
                Kiểm tra chi tiết
                {checklists.length > 0 && (
                  <Badge bg="primary" className="ms-2">{checklists.length}</Badge>
                )}
              </button>
            </div>

            {/* Timeline Section */}
            {activeTab === 'timeline' && (
              <Card className="timeline-card-modern">
                <Card.Body className="p-4">
                  <OrderTimeline currentStatus={order.status} checklists={checklists} />
                </Card.Body>
              </Card>
            )}

            {/* Checklist Section - Real-time */}
            {activeTab === 'checklist' && (
              <div className="checklist-section-modern">
                {checklistsWithItems.length === 0 ? (
                  <Card className="empty-checklist-modern">
                    <Card.Body className="text-center py-5">
                      <div className="empty-icon-wrapper">
                        <FiFileText size={80} />
                      </div>
                      <h4 className="empty-title">Chưa có dữ liệu kiểm tra</h4>
                      <p className="empty-description">
                        Checklist sẽ xuất hiện khi kỹ thuật viên bắt đầu kiểm tra xe của bạn
                      </p>
                    </Card.Body>
                  </Card>
                ) : (
                  <div className="checklists-container">
                    {checklistsWithItems.map((checklist, idx) => {
                      const passedCount = checklist.items?.filter(i => i.status === 'PASSED').length || 0;
                      const failedCount = checklist.items?.filter(i => i.status === 'FAILED').length || 0;
                      const attentionCount = checklist.items?.filter(i => i.status === 'NEEDS_ATTENTION').length || 0;
                      const replacementCount = checklist.items?.filter(i => i.status === 'NEEDS_REPLACEMENT').length || 0;
                      const pendingCount = checklist.items?.filter(i => i.status === 'PENDING').length || 0;
                      const totalItems = checklist.items?.length || 0;
                      const completedItems = totalItems - pendingCount;
                      const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

                      return (
                        <Card key={checklist.checklistId} className="checklist-card-modern mb-4">
                          <Card.Header className="checklist-card-header">
                            <div className="checklist-header-content">
                              <div className="checklist-title-section">
                                <FiFileText className="checklist-icon" />
                                <div>
                                  <h5 className="checklist-title">
                                    {checklist.templateName || `Checklist #${idx + 1}`}
                                  </h5>
                                  <div className="checklist-meta">
                                    <span className="meta-item">
                                      <FiCalendar className="me-1" />
                                      {formatDate(checklist.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="checklist-stats-badges">
                                {passedCount > 0 && (
                                  <Badge bg="success" className="stat-badge">
                                    <FiCheckCircle className="me-1" />
                                    {passedCount} Đạt
                                  </Badge>
                                )}
                                {failedCount > 0 && (
                                  <Badge bg="danger" className="stat-badge">
                                    <FiXCircle className="me-1" />
                                    {failedCount} Lỗi
                                  </Badge>
                                )}
                                {attentionCount > 0 && (
                                  <Badge bg="warning" className="stat-badge">
                                    <FiAlertCircle className="me-1" />
                                    {attentionCount} Chú ý
                                  </Badge>
                                )}
                                {replacementCount > 0 && (
                                  <Badge bg="info" className="stat-badge">
                                    <FiTool className="me-1" />
                                    {replacementCount} Thay
                                  </Badge>
                                )}
                                {pendingCount > 0 && (
                                  <Badge bg="secondary" className="stat-badge">
                                    <FiClock className="me-1" />
                                    {pendingCount} Chờ
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="checklist-progress">
                              <div className="progress-info">
                                <span className="progress-label">Tiến độ kiểm tra</span>
                                <span className="progress-percentage">{progressPercentage}%</span>
                              </div>
                              <div className="progress-bar-container">
                                <div 
                                  className="progress-bar-fill" 
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                            </div>
                          </Card.Header>

                          <Card.Body className="checklist-card-body">
                            <div className="checklist-items-grid-modern">
                              {checklist.items && checklist.items.length > 0 ? (
                                checklist.items.map((item, itemIdx) => {
                                  const statusConfig = getItemStatusConfig(item.status);
                                  
                                  return (
                                    <div 
                                      key={itemIdx} 
                                      className={`checklist-item-card-modern ${statusConfig.className}`}
                                      style={{
                                        borderLeftColor: statusConfig.textColor
                                      }}
                                    >
                                      {/* Item Header */}
                                      <div className="item-header-modern">
                                        <div className="item-number-badge">{itemIdx + 1}</div>
                                        <div className="item-status-badge" style={{
                                          backgroundColor: statusConfig.bgColor,
                                          color: statusConfig.textColor
                                        }}>
                                          {statusConfig.icon}
                                          <span className="status-text">{statusConfig.text}</span>
                                        </div>
                                      </div>

                                      {/* Item Title */}
                                      <h6 className="item-title-modern">
                                        {item.itemName}
                                        {item.isRequired && <span className="required-badge">Bắt buộc</span>}
                                      </h6>

                                      {/* Item Description */}
                                      {item.itemDescription && (
                                        <p className="item-description-modern">
                                          <FiFileText className="me-1" />
                                          {item.itemDescription}
                                        </p>
                                      )}

                                      {/* Estimated Time */}
                                      {item.estimatedTime && (
                                        <div className="item-estimate">
                                          <FiClock className="me-1" />
                                          <span>Thời gian ước tính: {item.estimatedTime} phút</span>
                                        </div>
                                      )}

                                      {/* Technician Notes */}
                                      {item.technicianNotes && (
                                        <div className="item-notes-modern">
                                          <div className="notes-label">
                                            <FiAlertCircle className="me-1" />
                                            Ghi chú kỹ thuật viên:
                                          </div>
                                          <p className="notes-content">{item.technicianNotes}</p>
                                        </div>
                                      )}

                                      {/* Evidence Image */}
                                      {item.evidenceUrl && (
                                        <div className="item-evidence-modern">
                                          <div className="evidence-label">
                                            <FiImage className="me-1" />
                                            Hình ảnh minh chứng:
                                          </div>
                                          <div 
                                            className="evidence-thumbnail"
                                            onClick={() => setImageModalUrl(item.evidenceUrl)}
                                          >
                                            <img src={item.evidenceUrl} alt="Evidence" />
                                            <div className="evidence-overlay">
                                              <FiImage size={24} />
                                              <span>Xem ảnh</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Timestamp */}
                                      {item.createdAt && (
                                        <div className="item-timestamp">
                                          <FiClock className="me-1" />
                                          Kiểm tra lúc: {formatTime(item.createdAt)}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-muted">Chưa có mục kiểm tra</p>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </Col>

          {/* Right Column - Info Cards */}
          <Col xxl={4} xl={5} lg={5}>
            <div className="info-sidebar">
              {/* Vehicle Info */}
              <Card className="info-card-modern mb-3">
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

              {/* Contact Info */}
              <Card className="info-card-modern mb-3">
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

              {/* Time Info */}
              <Card className="info-card-modern">
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
            </div>
          </Col>
        </Row>

        {/* Notes Section */}
        {(order.customerDescription || order.advisorNotes || order.technicianNotes) && (
          <Row className="mt-4">
            <Col lg={12}>
              <Card className="notes-card-modern">
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
        <div className="image-modal-overlay" onClick={() => setImageModalUrl(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setImageModalUrl(null)}>
              <FiXCircle size={32} />
            </button>
            <img src={imageModalUrl} alt="Evidence Full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;

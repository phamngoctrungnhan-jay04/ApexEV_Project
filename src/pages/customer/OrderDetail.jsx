// src/pages/customer/OrderDetail.jsx
// Giao diện mới: Soft, Clean, Modern - APEX EV

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { 
  FiArrowLeft, FiClock, FiUser, FiTool, FiCheckCircle, 
  FiXCircle, FiAlertTriangle, FiRefreshCw, FiImage,
  FiZap, FiEye, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { getServiceChecklistItemsForOrder } from '../../services/checklistService';
import { getFileViewUrl } from '../../services/uploadService';
import './OrderDetail.css';

// Backend OrderStatus mapping
const STATUS_LABELS = {
  CONFIRMED: 'Đã xác nhận',
  RECEPTION: 'Tiếp nhận',
  INSPECTION: 'Kiểm tra',
  QUOTING: 'Báo giá',
  WAITING_APPROVAL: 'Chờ duyệt',
  WAITING_FOR_PARTS: 'Chờ phụ tùng',
  IN_PROGRESS: 'Đang thực hiện',
  READY_FOR_INVOICE: 'Sẵn sàng xuất hóa đơn',
  INVOICED: 'Đã xuất hóa đơn',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy'
};

const STATUS_CLASSES = {
  CONFIRMED: 'status-confirmed',
  RECEPTION: 'status-reception',
  INSPECTION: 'status-inspection',
  QUOTING: 'status-quoting',
  WAITING_APPROVAL: 'status-waiting',
  WAITING_FOR_PARTS: 'status-waiting-parts',
  IN_PROGRESS: 'status-in-progress',
  READY_FOR_INVOICE: 'status-ready',
  INVOICED: 'status-invoiced',
  COMPLETED: 'status-completed',
  CANCELLED: 'status-cancelled'
};

// Checklist item status
const ITEM_STATUS_LABELS = {
  PENDING: 'Chờ kiểm tra',
  PASSED: 'Đạt',
  FAILED: 'Lỗi',
  NEEDS_ATTENTION: 'Cần chú ý',
  NEEDS_REPLACEMENT: 'Cần thay thế'
};

const ITEM_STATUS_CLASSES = {
  PENDING: 'item-pending',
  PASSED: 'item-passed',
  FAILED: 'item-failed',
  NEEDS_ATTENTION: 'item-attention',
  NEEDS_REPLACEMENT: 'item-replacement'
};

const ITEM_STATUS_ICONS = {
  PENDING: FiClock,
  PASSED: FiCheckCircle,
  FAILED: FiXCircle,
  NEEDS_ATTENTION: FiAlertTriangle,
  NEEDS_REPLACEMENT: FiRefreshCw
};

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [orderStatus, setOrderStatus] = useState('INSPECTION');
  const [checklists, setChecklists] = useState([]);
  const [checklistResults, setChecklistResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [imageModal, setImageModal] = useState(null);
  const [expandedChecklist, setExpandedChecklist] = useState(null);

  // Fetch checklists và results (dùng API mới)
  const fetchChecklistData = async () => {
    try {
      console.log('🔄 [OrderDetail] Fetching checklist for orderId:', orderId);
      
      // API mới: Lấy tất cả service checklist items kèm results
      const itemsWithResults = await getServiceChecklistItemsForOrder(orderId);
      
      console.log('✅ [OrderDetail] API Response:', itemsWithResults);
      
      // Kiểm tra dữ liệu trả về
      if (!itemsWithResults || itemsWithResults.length === 0) {
        console.warn('⚠️ [OrderDetail] No checklist items found');
        setChecklists([]);
        setChecklistResults({});
        setLastUpdated(new Date());
        setError('');
        setLoading(false);
        return;
      }
      
      // Group items theo serviceId để hiển thị theo service
      const servicesMap = {};
      itemsWithResults.forEach(item => {
        if (!servicesMap[item.serviceId]) {
          servicesMap[item.serviceId] = {
            serviceId: item.serviceId,
            serviceName: item.serviceName,
            items: []
          };
        }
        
        servicesMap[item.serviceId].items.push({
          id: item.resultId, // resultId (nếu đã submit)
          itemId: item.itemId, // service_checklist_item id
          itemName: item.itemName,
          itemDescription: item.itemDescription,
          status: item.status || 'PENDING',
          technicianNotes: item.technicianNotes || null,
          s3Key: item.s3Key || null,
          mediaUrl: item.mediaUrl || null,
          mediaType: item.mediaType || null,
          category: item.category,
          stepOrder: item.stepOrder
        });
      });
      
      // Convert map to array và sort items theo stepOrder
      const servicesArray = Object.values(servicesMap).map(service => ({
        ...service,
        items: service.items.sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0))
      }));
      
      setChecklists(servicesArray);
      
      // Build resultsMap for expandedChecklist (dùng serviceId làm key)
      const resultsMap = {};
      servicesArray.forEach(service => {
        resultsMap[service.serviceId] = service.items;
      });
      
      console.log('🔍 [Customer OrderDetail] Fetched data:', { servicesArray, resultsMap });
      console.log('🔍 Sample item:', servicesArray[0]?.items[0]);
      
      setChecklistResults(resultsMap);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      console.error('❌ [OrderDetail] fetchChecklistData error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers
        }
      });
      
      // Hiển thị error message chi tiết hơn
      let errorMessage = 'Không thể tải dữ liệu checklist';
      if (err.response) {
        // Server responded with error
        errorMessage = `Lỗi ${err.response.status}: ${err.response.data?.message || err.response.statusText || 'Server error'}`;
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchChecklistData();
  }, [orderId]);

  // Auto-refresh mỗi 5 giây
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchChecklistData();
    }, 5000); // 5 giây

    return () => clearInterval(interval);
  }, [autoRefresh, orderId]);

  const renderStatusBadge = (status) => {
    const Icon = ITEM_STATUS_ICONS[status] || FiClock;
    return (
      <Badge bg="secondary" className={`${ITEM_STATUS_CLASSES[status]} me-2`}>
        <Icon size={14} className="me-1" />
        {ITEM_STATUS_LABELS[status] || status}
      </Badge>
    );
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="order-detail-container py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Đang tải thông tin...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="order-detail-page-new">
      {/* Soft Header */}
      <div className="soft-header">
        <Container>
          <div className="header-wrapper">
            <button className="btn-back-soft" onClick={() => navigate(-1)}>
              <FiArrowLeft />
              <span>Quay lại</span>
            </button>
            
            <div className="header-info">
              <div className="order-badge">
                <FiZap className="badge-icon" />
                <div>
                  <span className="badge-label">Đơn hàng</span>
                  <h2>#{orderId}</h2>
                </div>
              </div>
              
              <div className="header-actions">
                <Badge className={`status-soft ${STATUS_CLASSES[orderStatus]}`}>
                  {STATUS_LABELS[orderStatus] || orderStatus}
                </Badge>
                
                <button
                  className={`btn-auto-refresh ${autoRefresh ? 'active' : ''}`}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  title={autoRefresh ? 'Tắt tự động cập nhật' : 'Bật tự động cập nhật'}
                >
                  <FiRefreshCw className={autoRefresh ? 'spinning' : ''} />
                </button>
              </div>
            </div>
            
            {lastUpdated && (
              <div className="last-update">
                <FiClock />
                <span>Cập nhật: {formatDateTime(lastUpdated)}</span>
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="content-wrapper">

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Checklists */}
      <Row>
        <Col>
          {checklists.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <FiTool size={48} className="text-muted mb-3" />
                <h5 className="text-muted">Chưa có checklist nào</h5>
                <p className="text-muted">Kỹ thuật viên sẽ tạo checklist khi bắt đầu kiểm tra</p>
              </Card.Body>
            </Card>
          ) : (
            checklists.map(service => {
              const isExpanded = expandedChecklist === service.serviceId;
              const results = checklistResults[service.serviceId] || [];
              const totalItems = results.length;
              const completedItems = results.filter(r => r.status !== 'PENDING').length;
              const progressPercent = totalItems > 0 ? (completedItems / totalItems * 100).toFixed(0) : 0;

              return (
                <Card key={service.serviceId} className="checklist-card-soft">
                  <Card.Header 
                    className="card-header-soft"
                    onClick={() => setExpandedChecklist(isExpanded ? null : service.serviceId)}
                  >
                    <div className="header-main">
                      <div className="header-left">
                        <div className="icon-circle">
                          <FiTool />
                        </div>
                        <div>
                          <h5 className="checklist-title">{service.serviceName}</h5>
                          <p className="technician-name">
                            <FiUser size={14} />
                            Kỹ thuật viên
                          </p>
                        </div>
                      </div>
                      
                      <div className="header-right">
                        <div className="progress-number">
                          <span className="current">{completedItems}</span>
                          <span className="divider">/</span>
                          <span className="total">{totalItems}</span>
                        </div>
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </div>
                    </div>
                    
                    {/* Soft Progress Bar */}
                    <div className="progress-wrapper">
                      <div className="progress-bar-soft">
                        <div 
                          className="progress-fill-soft" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="progress-text">{progressPercent}%</span>
                    </div>
                    
                    {/* Status Summary */}
                    <div className="status-summary-soft">
                      {results.filter(r => r.status === 'PASSED').length > 0 && (
                        <div className="status-chip success">
                          <FiCheckCircle size={14} />
                          <span>{results.filter(r => r.status === 'PASSED').length}</span>
                        </div>
                      )}
                      {results.filter(r => r.status === 'FAILED').length > 0 && (
                        <div className="status-chip error">
                          <FiXCircle size={14} />
                          <span>{results.filter(r => r.status === 'FAILED').length}</span>
                        </div>
                      )}
                      {results.filter(r => r.status === 'NEEDS_ATTENTION').length > 0 && (
                        <div className="status-chip warning">
                          <FiAlertTriangle size={14} />
                          <span>{results.filter(r => r.status === 'NEEDS_ATTENTION').length}</span>
                        </div>
                      )}
                      {results.filter(r => r.status === 'PENDING').length > 0 && (
                        <div className="status-chip pending">
                          <FiClock size={14} />
                          <span>{results.filter(r => r.status === 'PENDING').length}</span>
                        </div>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body className={`card-body-soft ${isExpanded ? 'expanded' : ''}`}>
                    {results.length === 0 ? (
                      <div className="empty-state-soft">
                        <FiClock className="empty-icon" />
                        <h6>Chưa bắt đầu kiểm tra</h6>
                        <p>Kỹ thuật viên sẽ cập nhật kết quả sớm thôi</p>
                      </div>
                    ) : (
                      <div className="items-grid-soft">
                        {results.map((item, index) => {
                          const Icon = ITEM_STATUS_ICONS[item.status] || FiClock;
                          const statusClass = ITEM_STATUS_CLASSES[item.status] || 'item-pending';
                          
                          return (
                            <div key={item.id} className={`item-card-soft ${statusClass}`}>
                              {/* Item Header */}
                              <div className="item-header-soft">
                                <span className="item-number">{index + 1}</span>
                                <div className={`status-badge-soft ${statusClass}`}>
                                  <Icon size={16} />
                                  <span>{ITEM_STATUS_LABELS[item.status]}</span>
                                </div>
                              </div>
                              
                              {/* Item Body */}
                              <div className="item-body-soft">
                                <h6 className="item-title">{item.itemName}</h6>
                                
                                {item.itemDescription && (
                                  <p className="item-desc">
                                    <FiEye size={14} />
                                    {item.itemDescription}
                                  </p>
                                )}
                                
                                {item.technicianNotes && (
                                  <div className="notes-box-soft">
                                    <div className="notes-label">
                                      <FiAlertTriangle size={14} />
                                      <span>Ghi chú</span>
                                    </div>
                                    <p>{item.technicianNotes}</p>
                                  </div>
                                )}
                                
                                {item.s3Key && (
                                  <div className="image-preview-soft"
                                    onClick={() => setImageModal(getFileViewUrl(item.s3Key))}
                                  >
                                    <img src={getFileViewUrl(item.s3Key)} alt="Evidence" />
                                    <div className="image-overlay">
                                      <FiImage size={24} />
                                      <span>Xem ảnh</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })
          )}
        </Col>
      </Row>
      </Container>

      {/* Image Modal Soft */}
      {imageModal && (
        <div className="modal-overlay-soft" onClick={() => setImageModal(null)}>
          <div className="modal-content-soft" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-soft" onClick={() => setImageModal(null)}>
              <FiXCircle size={24} />
            </button>
            <img src={imageModal} alt="Evidence Full" />
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;

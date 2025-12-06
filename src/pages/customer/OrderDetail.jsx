// src/pages/customer/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { 
  FiArrowLeft, FiClock, FiUser, FiTool, FiCheckCircle, 
  FiXCircle, FiAlertTriangle, FiRefreshCw, FiImage 
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { getChecklistsByOrder, getChecklistResults, getTemplateById } from '../../services/checklistService';
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

  // Fetch checklists, templates và results
  const fetchChecklistData = async () => {
    try {
      const checklistsData = await getChecklistsByOrder(orderId);
      setChecklists(checklistsData);

      // Fetch template và results cho từng checklist
      const dataPromises = checklistsData.map(async (cl) => {
        const [template, results] = await Promise.all([
          getTemplateById(cl.templateId),
          getChecklistResults(cl.id)
        ]);
        
        // Map template items với results
        const allItems = template.items.map(templateItem => {
          const result = results.find(r => r.templateItemId === templateItem.id);
          return {
            id: result?.id || null,
            templateItemId: templateItem.id,
            itemName: templateItem.itemName,
            itemDescription: templateItem.itemDescription,
            status: result?.status || 'PENDING',
            technicianNotes: result?.technicianNotes || null,
            s3Key: result?.s3Key || null,
            mediaUrl: result?.mediaUrl || null,
            mediaType: result?.mediaType || null
          };
        });
        
        return { checklistId: cl.id, items: allItems };
      });
      
      const allData = await Promise.all(dataPromises);
      
      const resultsMap = {};
      allData.forEach(({ checklistId, items }) => {
        resultsMap[checklistId] = items;
      });
      
      setChecklistResults(resultsMap);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      console.error('fetchChecklistData error:', err);
      setError(err.message || 'Không thể tải dữ liệu checklist');
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
    <Container className="order-detail-container py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate(-1)}
              >
                <FiArrowLeft className="me-2" />
                Quay lại
              </button>
              <div>
                <h2 className="mb-1">Chi tiết đơn hàng #{orderId}</h2>
                <Badge bg="info" className={STATUS_CLASSES[orderStatus]}>
                  {STATUS_LABELS[orderStatus] || orderStatus}
                </Badge>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className={`btn btn-sm ${autoRefresh ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <FiRefreshCw className={autoRefresh ? 'spinner-icon' : ''} />
                <span className="ms-2">
                  {autoRefresh ? 'Tự động cập nhật' : 'Đã tắt tự động'}
                </span>
              </button>
              {lastUpdated && (
                <small className="text-muted">
                  Cập nhật lúc: {formatDateTime(lastUpdated)}
                </small>
              )}
            </div>
          </div>
        </Col>
      </Row>

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
            checklists.map(checklist => {
              const results = checklistResults[checklist.id] || [];
              const totalItems = results.length;
              const completedItems = results.filter(r => r.status !== 'PENDING').length;
              const progressPercent = totalItems > 0 ? (completedItems / totalItems * 100).toFixed(0) : 0;

              return (
                <Card key={checklist.id} className="checklist-card mb-4 shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">
                          <FiTool className="me-2" />
                          {checklist.templateName}
                        </h5>
                        <small>Kỹ thuật viên: {checklist.technicianName}</small>
                      </div>
                      <div className="text-end">
                        <div className="progress-text">
                          {completedItems}/{totalItems} mục
                        </div>
                        <div className="progress mt-1" style={{ width: '150px', height: '8px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            role="progressbar" 
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {results.length === 0 ? (
                      <div className="text-center text-muted py-3">
                        <FiClock size={32} className="mb-2" />
                        <p>Kỹ thuật viên chưa bắt đầu kiểm tra</p>
                      </div>
                    ) : (
                      <div className="checklist-items">
                        {results.map((item, index) => (
                          <div key={item.id} className="checklist-item-row mb-3 pb-3 border-bottom">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="item-info flex-grow-1">
                                <div className="d-flex align-items-center mb-2">
                                  <span className="item-number me-2">{index + 1}</span>
                                  <h6 className="mb-0">{item.itemName}</h6>
                                </div>
                                {item.itemDescription && (
                                  <div className="item-description mt-1 mb-2">
                                    <small className="text-muted">{item.itemDescription}</small>
                                  </div>
                                )}
                                {item.technicianNotes && (
                                  <div className="item-notes mt-2">
                                    <small className="text-muted">
                                      <strong>Ghi chú:</strong> {item.technicianNotes}
                                    </small>
                                  </div>
                                )}
                                {item.s3Key && (
                                  <div className="item-image mt-2">
                                    <img 
                                      src={getFileViewUrl(item.s3Key)} 
                                      alt="Evidence"
                                      className="evidence-thumbnail"
                                      onClick={() => window.open(getFileViewUrl(item.s3Key), '_blank')}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="item-status">
                                {renderStatusBadge(item.status)}
                              </div>
                            </div>
                          </div>
                        ))}
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
  );
}

export default OrderDetail;

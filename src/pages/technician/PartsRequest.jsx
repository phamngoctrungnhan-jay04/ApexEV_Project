import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Table, Modal, Badge, Toast, ToastContainer, Spinner, Alert } from 'react-bootstrap';
import { FiSearch, FiPlus, FiTrash2, FiSend, FiPackage, FiAlertCircle, FiCheck, FiInfo, FiClock, FiX, FiList, FiRepeat, FiTool, FiImage } from 'react-icons/fi';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAllParts, searchParts, createPartRequest, getMyPartRequests, cancelPartRequest } from '../../services/partService';
import './PartsRequest.css';

const PartsRequest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  // State
  const [parts, setParts] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParts, setSelectedParts] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('NORMAL');
  const [replacementItems, setReplacementItems] = useState([]); // Items được đánh dấu thay thế từ checklist
  
  // Loading states
  const [loadingParts, setLoadingParts] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  // Load parts and replacement items on mount
  useEffect(() => {
    loadParts();
    loadMyRequests();
    loadReplacementItems();
  }, []);

  // Load replacement items từ localStorage
  const loadReplacementItems = () => {
    try {
      const saved = localStorage.getItem('replacementItems');
      if (saved) {
        const items = JSON.parse(saved);
        setReplacementItems(items);
        // Không xóa localStorage ngay để user có thể quay lại trang
      }
    } catch (error) {
      console.error('Load replacement items error:', error);
    }
  };

  // Xóa một replacement item
  const handleRemoveReplacementItem = (itemId) => {
    const updated = replacementItems.filter(item => item.itemId !== itemId);
    setReplacementItems(updated);
    localStorage.setItem('replacementItems', JSON.stringify(updated));
  };

  // Xóa tất cả replacement items
  const handleClearReplacementItems = () => {
    setReplacementItems([]);
    localStorage.removeItem('replacementItems');
  };

  const loadParts = async () => {
    try {
      setLoadingParts(true);
      const data = await getAllParts();
      setParts(data);
    } catch (error) {
      console.error('Load parts error:', error);
      showToast('Không thể tải danh sách phụ tùng', 'danger');
    } finally {
      setLoadingParts(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      setLoadingRequests(true);
      const data = await getMyPartRequests();
      setMyRequests(data);
    } catch (error) {
      console.error('Load requests error:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadParts();
      return;
    }
    try {
      setLoadingParts(true);
      const data = await searchParts(searchTerm);
      setParts(data);
    } catch (error) {
      console.error('Search error:', error);
      showToast('Lỗi tìm kiếm', 'danger');
    } finally {
      setLoadingParts(false);
    }
  };

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  // Check if part is already added
  const isPartAdded = (partId) => {
    return selectedParts.some(p => p.id === partId);
  };

  // Add part to selected list
  const handleAddPart = (part) => {
    if (!isPartAdded(part.id)) {
      setSelectedParts([...selectedParts, {
        ...part,
        requestedQuantity: 1,
        note: ''
      }]);
    }
  };

  // Remove part from selected list
  const handleRemovePart = (partId) => {
    setSelectedParts(selectedParts.filter(p => p.id !== partId));
  };

  // Update quantity
  const handleQuantityChange = (partId, quantity) => {
    const qty = parseInt(quantity) || 0;
    if (qty >= 0) {
      setSelectedParts(selectedParts.map(p => 
        p.id === partId ? { ...p, requestedQuantity: qty } : p
      ));
    }
  };

  // Update note for specific part
  const handlePartNoteChange = (partId, note) => {
    setSelectedParts(selectedParts.map(p => 
      p.id === partId ? { ...p, note: note } : p
    ));
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    return selectedParts.reduce((total, part) => 
      total + (parseFloat(part.price) * part.requestedQuantity), 0
    );
  };

  // Handle send request
  const handleSendRequest = async () => {
    // Validate
    if (selectedParts.length === 0) {
      showToast('Vui lòng chọn ít nhất một phụ tùng', 'warning');
      return;
    }

    if (!orderId) {
      showToast('Vui lòng chọn đơn hàng trước khi yêu cầu phụ tùng', 'warning');
      return;
    }

    const hasInvalidQuantity = selectedParts.some(p => p.requestedQuantity <= 0);
    if (hasInvalidQuantity) {
      showToast('Vui lòng nhập số lượng hợp lệ cho tất cả phụ tùng', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Gửi từng request
      for (const part of selectedParts) {
        const combinedNotes = part.note 
          ? `${requestNote ? requestNote + ' | ' : ''}${part.note}` 
          : requestNote;
        
        await createPartRequest(
          parseInt(orderId),
          part.id,
          part.requestedQuantity,
          urgencyLevel,
          combinedNotes || null
        );
      }

      showToast(`Đã gửi ${selectedParts.length} yêu cầu phụ tùng thành công!`, 'success');
      setShowSendModal(false);
      
      // Reset form
      setSelectedParts([]);
      setRequestNote('');
      setUrgencyLevel('NORMAL');
      
      // Reload requests
      loadMyRequests();
    } catch (error) {
      console.error('Send request error:', error);
      showToast(error.response?.data?.message || 'Không thể gửi yêu cầu', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel request
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Bạn có chắc muốn hủy yêu cầu này?')) return;

    try {
      await cancelPartRequest(requestId);
      showToast('Đã hủy yêu cầu', 'success');
      loadMyRequests();
    } catch (error) {
      console.error('Cancel request error:', error);
      showToast(error.response?.data?.message || 'Không thể hủy yêu cầu', 'danger');
    }
  };

  // Get urgency badge
  const getUrgencyBadge = (urgency) => {
    const badges = {
      'URGENT': { bg: 'danger', text: 'Khẩn cấp' },
      'HIGH': { bg: 'warning', text: 'Cao' },
      'NORMAL': { bg: 'info', text: 'Bình thường' },
      'LOW': { bg: 'secondary', text: 'Thấp' }
    };
    return badges[urgency] || badges.NORMAL;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': { bg: 'warning', text: 'Chờ duyệt', icon: <FiClock className="me-1" /> },
      'APPROVED': { bg: 'success', text: 'Đã duyệt', icon: <FiCheck className="me-1" /> },
      'REJECTED': { bg: 'danger', text: 'Từ chối', icon: <FiX className="me-1" /> },
      'FULFILLED': { bg: 'primary', text: 'Đã cấp', icon: <FiPackage className="me-1" /> },
      'CANCELLED': { bg: 'secondary', text: 'Đã hủy', icon: <FiX className="me-1" /> }
    };
    return badges[status] || badges.PENDING;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container fluid className="parts-request-page">
      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          show={toast.show} 
          onClose={() => setToast({ ...toast, show: false })} 
          delay={3000} 
          autohide
          bg={toast.variant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">
              {toast.variant === 'success' ? <FiCheck className="me-2" /> : <FiAlertCircle className="me-2" />}
              Thông báo
            </strong>
          </Toast.Header>
          <Toast.Body className={toast.variant === 'danger' || toast.variant === 'success' ? 'text-white' : ''}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Yêu Cầu Phụ Tùng</h2>
          <p className="text-muted">
            {orderId ? `Đơn hàng #${orderId} - ` : ''}
            Tìm kiếm và yêu cầu phụ tùng cần thiết
          </p>
        </div>
        <div className="header-actions">
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={() => setShowHistoryModal(true)}
          >
            <FiList className="me-2" />
            Lịch sử ({myRequests.length})
          </Button>
          <Button 
            variant="primary" 
            size="lg"
            disabled={selectedParts.length === 0 || !orderId}
            onClick={() => setShowSendModal(true)}
          >
            <FiSend className="me-2" />
            Gửi yêu cầu ({selectedParts.length})
          </Button>
        </div>
      </div>

      {/* Warning if no orderId */}
      {!orderId && (
        <div className="alert alert-warning mb-4">
          <FiAlertCircle className="me-2" />
          <strong>Lưu ý:</strong> Vui lòng chọn đơn hàng từ danh sách công việc trước khi yêu cầu phụ tùng.
          <Button 
            variant="link" 
            className="p-0 ms-2"
            onClick={() => navigate('/technician/jobs')}
          >
            Quay lại danh sách công việc
          </Button>
        </div>
      )}

      {/* Replacement Items Section - Các mục cần thay thế từ checklist */}
      {replacementItems.length > 0 && (
        <Card className="replacement-items-card mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FiRepeat className="me-2 text-primary" />
              <strong>Các hạng mục cần thay thế ({replacementItems.length})</strong>
            </div>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={handleClearReplacementItems}
            >
              <FiTrash2 className="me-1" />
              Xóa tất cả
            </Button>
          </Card.Header>
          <Card.Body>
            <Alert variant="info" className="mb-3">
              <FiInfo className="me-2" />
              Đây là các hạng mục được đánh dấu <strong>"Thay thế"</strong> trong checklist. 
              Hãy tìm kiếm phụ tùng phù hợp để thêm vào yêu cầu.
            </Alert>
            <div className="replacement-items-list">
              {replacementItems.map((item, index) => (
                <div key={item.itemId || index} className="replacement-item">
                  <div className="replacement-item-icon">
                    <FiTool />
                  </div>
                  <div className="replacement-item-info">
                    <div className="replacement-item-name">{item.itemName}</div>
                    <div className="replacement-item-service">
                      <Badge bg="secondary">{item.serviceName}</Badge>
                    </div>
                    {item.notes && (
                      <div className="replacement-item-notes">
                        <FiInfo className="me-1" />
                        <span className="notes-label">Ghi chú KTV:</span> {item.notes}
                      </div>
                    )}
                    {/* Hiển thị hình ảnh của KTV */}
                    {item.images && item.images.length > 0 && (
                      <div className="replacement-item-images">
                        <div className="images-header">
                          <FiImage className="me-1" />
                          <span className="images-label">Hình ảnh KTV ({item.images.length}):</span>
                        </div>
                        <div className="images-gallery">
                          {item.images.map((img, imgIndex) => (
                            <div key={imgIndex} className="image-thumb">
                              <img 
                                src={img.url} 
                                alt={img.name || `Ảnh ${imgIndex + 1}`}
                                onClick={() => window.open(img.url, '_blank')}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleRemoveReplacementItem(item.itemId)}
                  >
                    <FiX />
                  </Button>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      <Row>
        {/* Search & Parts List */}
        <Col lg={7} className="mb-4">
          <Card className="search-card">
            <Card.Body>
              <h5 className="mb-3">Tìm kiếm phụ tùng</h5>

              {/* Search Box */}
              <InputGroup className="mb-3">
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo tên phụ tùng, mã SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="primary" onClick={handleSearch}>
                  Tìm kiếm
                </Button>
              </InputGroup>

              {/* Parts List */}
              <div className="parts-list">
                {loadingParts ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-2">Đang tải danh sách phụ tùng...</p>
                  </div>
                ) : parts.length === 0 ? (
                  <div className="empty-state">
                    <FiPackage size={48} className="text-muted mb-3" />
                    <p className="text-muted">Không tìm thấy phụ tùng</p>
                  </div>
                ) : (
                  <div className="parts-grid">
                    {parts.map(part => (
                      <Card key={part.id} className="part-card">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{part.partName}</h6>
                              <Badge bg="secondary" className="mb-2">{part.sku || 'N/A'}</Badge>
                            </div>
                            <Button
                              variant={isPartAdded(part.id) ? 'success' : 'outline-primary'}
                              size="sm"
                              onClick={() => handleAddPart(part)}
                              disabled={isPartAdded(part.id)}
                            >
                              {isPartAdded(part.id) ? <FiCheck /> : <FiPlus />}
                            </Button>
                          </div>
                          
                          <div className="part-info">
                            <div className="info-item">
                              <small className="text-muted">Giá:</small>
                              <strong className="ms-2">{formatCurrency(part.price)}</strong>
                            </div>
                            <div className="info-item">
                              <small className="text-muted">Tồn kho:</small>
                              <Badge 
                                bg={part.quantityInStock > 10 ? 'success' : part.quantityInStock > 0 ? 'warning' : 'danger'}
                                className="ms-2"
                              >
                                {part.quantityInStock}
                              </Badge>
                            </div>
                          </div>

                          {part.description && (
                            <small className="text-muted d-block mt-2">
                              {part.description}
                            </small>
                          )}
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Selected Parts */}
        <Col lg={5}>
          <Card className="selected-card sticky-card">
            <Card.Body>
              <h5 className="mb-3">
                <FiPackage className="me-2" />
                Phụ tùng đã chọn ({selectedParts.length})
              </h5>

              {selectedParts.length === 0 ? (
                <div className="empty-state-small">
                  <FiAlertCircle size={32} className="text-muted mb-2" />
                  <p className="text-muted mb-0">Chưa có phụ tùng nào được chọn</p>
                  <small className="text-muted">Chọn phụ tùng từ danh sách bên trái</small>
                </div>
              ) : (
                <>
                  <div className="selected-parts-list">
                    {selectedParts.map((part) => (
                      <Card key={part.id} className="selected-part-item mb-3">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{part.partName}</h6>
                              <Badge bg="secondary" className="mb-2">{part.sku || 'N/A'}</Badge>
                            </div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleRemovePart(part.id)}
                            >
                              <FiTrash2 size={14} />
                            </Button>
                          </div>

                          {/* Quantity Input */}
                          <Form.Group className="mb-2">
                            <Form.Label className="small">Số lượng</Form.Label>
                            <Form.Control
                              type="number"
                              min="1"
                              max={part.quantityInStock}
                              value={part.requestedQuantity}
                              onChange={(e) => handleQuantityChange(part.id, e.target.value)}
                              size="sm"
                            />
                            {part.requestedQuantity > part.quantityInStock && (
                              <Form.Text className="text-danger">
                                Vượt quá tồn kho ({part.quantityInStock})
                              </Form.Text>
                            )}
                          </Form.Group>

                          {/* Note Input */}
                          <Form.Group className="mb-2">
                            <Form.Label className="small">Ghi chú (tùy chọn)</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              placeholder="Ghi chú cho phụ tùng này..."
                              value={part.note}
                              onChange={(e) => handlePartNoteChange(part.id, e.target.value)}
                              size="sm"
                            />
                          </Form.Group>

                          {/* Subtotal */}
                          <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                            <small className="text-muted">Tạm tính:</small>
                            <strong className="text-primary">
                              {formatCurrency(parseFloat(part.price) * part.requestedQuantity)}
                            </strong>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>

                  {/* Total Summary */}
                  <Card className="total-summary">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Tổng số phụ tùng:</span>
                        <strong>{selectedParts.length}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Tổng số lượng:</span>
                        <strong>
                          {selectedParts.reduce((sum, p) => sum + p.requestedQuantity, 0)}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <strong>Tổng chi phí:</strong>
                        <strong className="text-primary fs-5">
                          {formatCurrency(calculateTotalCost())}
                        </strong>
                      </div>
                    </Card.Body>
                  </Card>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Send Request Modal */}
      <Modal 
        show={showSendModal} 
        onHide={() => setShowSendModal(false)} 
        size="lg"
        centered
        className="send-modal"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <FiSend className="me-2" />
            Xác nhận gửi yêu cầu
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Summary */}
          <Card className="mb-3 bg-light">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <small className="text-muted d-block">Đơn hàng</small>
                  <h4 className="mb-0">#{orderId}</h4>
                </Col>
                <Col md={4}>
                  <small className="text-muted d-block">Tổng số lượng</small>
                  <h4 className="mb-0">
                    {selectedParts.reduce((sum, p) => sum + p.requestedQuantity, 0)}
                  </h4>
                </Col>
                <Col md={4}>
                  <small className="text-muted d-block">Tổng chi phí</small>
                  <h4 className="mb-0 text-primary">
                    {formatCurrency(calculateTotalCost())}
                  </h4>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Parts List */}
          <div className="mb-3">
            <h6 className="mb-2">Danh sách phụ tùng:</h6>
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th>Phụ tùng</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedParts.map(part => (
                  <tr key={part.id}>
                    <td>
                      <div>{part.partName}</div>
                      <small className="text-muted">{part.sku || 'N/A'}</small>
                    </td>
                    <td>{part.requestedQuantity}</td>
                    <td>{formatCurrency(part.price)}</td>
                    <td className="fw-bold">
                      {formatCurrency(parseFloat(part.price) * part.requestedQuantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Urgency Level */}
          <Form.Group className="mb-3">
            <Form.Label>Mức độ khẩn cấp</Form.Label>
            <div className="d-flex gap-2">
              {['URGENT', 'HIGH', 'NORMAL', 'LOW'].map(level => {
                const badge = getUrgencyBadge(level);
                return (
                  <Button
                    key={level}
                    variant={urgencyLevel === level ? badge.bg : `outline-${badge.bg}`}
                    size="sm"
                    onClick={() => setUrgencyLevel(level)}
                    className="flex-grow-1"
                  >
                    {badge.text}
                  </Button>
                );
              })}
            </div>
          </Form.Group>

          {/* Note */}
          <Form.Group className="mb-3">
            <Form.Label>Ghi chú chung (tùy chọn)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nhập ghi chú cho yêu cầu phụ tùng này..."
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
            />
          </Form.Group>

          <div className="alert alert-info mb-0">
            <FiAlertCircle className="me-2" />
            Yêu cầu sẽ được gửi đến cố vấn dịch vụ và quản lý để xem xét phê duyệt.
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowSendModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSendRequest} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang gửi...
              </>
            ) : (
              <>
                <FiSend className="me-2" />
                Gửi yêu cầu
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* History Modal */}
      <Modal 
        show={showHistoryModal} 
        onHide={() => setShowHistoryModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FiList className="me-2" />
            Lịch sử yêu cầu phụ tùng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loadingRequests ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-4">
              <FiPackage size={48} className="text-muted mb-3" />
              <p className="text-muted">Chưa có yêu cầu nào</p>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Phụ tùng</th>
                  <th>SL</th>
                  <th>Đơn hàng</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map(req => {
                  const statusBadge = getStatusBadge(req.status);
                  return (
                    <tr key={req.id}>
                      <td>
                        <div>{req.partName}</div>
                        <small className="text-muted">{req.partSku || 'N/A'}</small>
                      </td>
                      <td>{req.quantityRequested}</td>
                      <td>
                        <small>#{req.serviceOrderId}</small>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {req.vehicleLicensePlate}
                        </div>
                      </td>
                      <td>
                        <Badge bg={statusBadge.bg}>
                          {statusBadge.icon}
                          {statusBadge.text}
                        </Badge>
                      </td>
                      <td>
                        <small>{formatDate(req.createdAt)}</small>
                      </td>
                      <td>
                        {req.status === 'PENDING' && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleCancelRequest(req.id)}
                          >
                            <FiX size={14} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PartsRequest;

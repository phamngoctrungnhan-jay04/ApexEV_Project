import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Table, Modal, Badge, Alert } from 'react-bootstrap';
import { FiSearch, FiPlus, FiTrash2, FiSend, FiPackage, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { parts } from '../../mockData';
import './PartsRequest.css';

const PartsRequest = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedParts, setSelectedParts] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('normal');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Get unique categories from parts
  const categories = ['all', ...new Set(parts.map(part => part.category))];

  // Filter parts based on search and category
  const filteredParts = parts.filter(part => {
    const matchSearch = searchTerm === '' || 
      part.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCategory = selectedCategory === 'all' || part.category === selectedCategory;
    
    return matchSearch && matchCategory;
  });

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
      total + (part.price * part.requestedQuantity), 0
    );
  };

  // Handle send request
  const handleSendRequest = () => {
    // Validate
    if (selectedParts.length === 0) {
      alert('Vui lòng chọn ít nhất một phụ tùng');
      return;
    }

    const hasInvalidQuantity = selectedParts.some(p => p.requestedQuantity <= 0);
    if (hasInvalidQuantity) {
      alert('Vui lòng nhập số lượng hợp lệ cho tất cả phụ tùng');
      return;
    }

    // Show success
    console.log('Parts Request:', {
      parts: selectedParts,
      note: requestNote,
      urgency: urgencyLevel,
      totalCost: calculateTotalCost(),
      requestDate: new Date().toISOString()
    });

    setShowSendModal(false);
    setShowSuccessAlert(true);
    
    // Reset form
    setTimeout(() => {
      setSelectedParts([]);
      setRequestNote('');
      setUrgencyLevel('normal');
      setShowSuccessAlert(false);
    }, 3000);
  };

  // Get category display name
  const getCategoryName = (category) => {
    const categoryNames = {
      'all': 'Tất cả',
      'battery': 'Pin',
      'motor': 'Động cơ',
      'brake': 'Phanh',
      'suspension': 'Giảm xóc',
      'electrical': 'Điện',
      'tire': 'Lốp',
      'filter': 'Lọc',
      'fluid': 'Dầu',
      'interior': 'Nội thất',
      'exterior': 'Ngoại thất',
      'hvac': 'Điều hòa',
      'lighting': 'Đèn'
    };
    return categoryNames[category] || category;
  };

  // Get urgency badge
  const getUrgencyBadge = (urgency) => {
    const badges = {
      'urgent': { bg: 'danger', text: 'Khẩn cấp' },
      'high': { bg: 'warning', text: 'Cao' },
      'normal': { bg: 'info', text: 'Bình thường' },
      'low': { bg: 'secondary', text: 'Thấp' }
    };
    return badges[urgency] || badges.normal;
  };

  return (
    <Container fluid className="parts-request-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Tạo Yêu Cầu Phụ Tùng</h2>
          <p className="text-muted">Tìm kiếm và yêu cầu phụ tùng cần thiết cho quá trình bảo dưỡng</p>
        </div>
        <div className="header-actions">
          <Button 
            variant="primary" 
            size="lg"
            disabled={selectedParts.length === 0}
            onClick={() => setShowSendModal(true)}
          >
            <FiSend className="me-2" />
            Gửi yêu cầu ({selectedParts.length})
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert variant="success" className="success-alert" dismissible onClose={() => setShowSuccessAlert(false)}>
          <FiCheck className="me-2" />
          <strong>Thành công!</strong> Yêu cầu phụ tùng đã được gửi đến cố vấn dịch vụ.
        </Alert>
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
                  placeholder="Tìm theo tên phụ tùng, mã phụ tùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              {/* Category Filter */}
              <div className="category-filters mb-3">
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    bg={selectedCategory === cat ? 'primary' : 'light'}
                    text={selectedCategory === cat ? 'white' : 'dark'}
                    className="category-badge"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {getCategoryName(cat)}
                  </Badge>
                ))}
              </div>

              {/* Parts List */}
              <div className="parts-list">
                {filteredParts.length === 0 ? (
                  <div className="empty-state">
                    <FiPackage size={48} className="text-muted mb-3" />
                    <p className="text-muted">Không tìm thấy phụ tùng</p>
                  </div>
                ) : (
                  <div className="parts-grid">
                    {filteredParts.map(part => (
                      <Card key={part.id} className="part-card">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{part.nameVi}</h6>
                              <p className="text-muted small mb-1">{part.nameEn}</p>
                              <Badge bg="secondary" className="mb-2">{part.partNumber}</Badge>
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
                              <strong className="ms-2">{part.price.toLocaleString('vi-VN')}đ</strong>
                            </div>
                            <div className="info-item">
                              <small className="text-muted">Tồn kho:</small>
                              <Badge 
                                bg={part.stock > 10 ? 'success' : part.stock > 0 ? 'warning' : 'danger'}
                                className="ms-2"
                              >
                                {part.stock}
                              </Badge>
                            </div>
                          </div>

                          {part.supplier && (
                            <small className="text-muted d-block mt-2">
                              Nhà cung cấp: {part.supplier}
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
                    {selectedParts.map((part, index) => (
                      <Card key={part.id} className="selected-part-item mb-3">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{part.nameVi}</h6>
                              <Badge bg="secondary" className="mb-2">{part.partNumber}</Badge>
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
                              value={part.requestedQuantity}
                              onChange={(e) => handleQuantityChange(part.id, e.target.value)}
                              size="sm"
                            />
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
                              {(part.price * part.requestedQuantity).toLocaleString('vi-VN')}đ
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
                          {calculateTotalCost().toLocaleString('vi-VN')}đ
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
                  <small className="text-muted d-block">Tổng phụ tùng</small>
                  <h4 className="mb-0">{selectedParts.length}</h4>
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
                    {calculateTotalCost().toLocaleString('vi-VN')}đ
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
                      <div>{part.nameVi}</div>
                      <small className="text-muted">{part.partNumber}</small>
                    </td>
                    <td>{part.requestedQuantity}</td>
                    <td>{part.price.toLocaleString('vi-VN')}đ</td>
                    <td className="fw-bold">
                      {(part.price * part.requestedQuantity).toLocaleString('vi-VN')}đ
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
              {['urgent', 'high', 'normal', 'low'].map(level => {
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

          <Alert variant="info" className="mb-0">
            <FiAlertCircle className="me-2" />
            Yêu cầu sẽ được gửi đến cố vấn dịch vụ và quản lý để xem xét phê duyệt.
          </Alert>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowSendModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSendRequest}>
            <FiSend className="me-2" />
            Gửi yêu cầu
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PartsRequest;

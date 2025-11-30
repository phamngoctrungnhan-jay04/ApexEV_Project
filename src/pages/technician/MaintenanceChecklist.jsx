import { FaCar } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, ProgressBar, Modal, InputGroup } from 'react-bootstrap';
import { 
  FiCheckCircle, FiCircle, FiFileText, FiFilter, FiSave, FiX, 
  FiAlertCircle, FiClock, FiTruck, FiCheck
} from 'react-icons/fi';
import { 
  checklistTemplates, 
  checklistCategories, 
  vehicleTypes, 
  getTemplateById 
} from '../../mockData';
import './MaintenanceChecklist.css';

const MaintenanceChecklist = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [itemNotes, setItemNotes] = useState({});
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [showTemplateModal, setShowTemplateModal] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Calculate progress
  const calculateProgress = () => {
    if (!selectedTemplate) return 0;
    const requiredItems = selectedTemplate.items.filter(item => item.isRequired);
    const checkedRequiredItems = requiredItems.filter(item => checkedItems[item.id]);
    return requiredItems.length > 0 
      ? Math.round((checkedRequiredItems.length / requiredItems.length) * 100)
      : 0;
  };

  const progress = calculateProgress();

  // Handle template selection
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setCheckedItems({});
    setItemNotes({});
    setShowTemplateModal(false);
  };

  // Handle checkbox change
  const handleCheckItem = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Handle note change
  const handleNoteChange = (itemId, note) => {
    setItemNotes(prev => ({
      ...prev,
      [itemId]: note
    }));
  };

  // Group items by category
  const groupedItems = selectedTemplate?.items.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Get category info
  const getCategoryInfo = (categoryId) => {
    return checklistCategories.find(c => c.id === categoryId) || {};
  };

  // Handle save checklist
  const handleSaveChecklist = () => {
    // In real app, save to backend
    console.log('Saving checklist:', {
      template: selectedTemplate,
      checkedItems,
      itemNotes,
      progress
    });
    setShowSaveModal(false);
    alert('Đã lưu checklist thành công!');
  };

  // Filtered templates
  const filteredTemplates = vehicleTypeFilter === 'all' 
    ? checklistTemplates 
    : checklistTemplates.filter(t => 
        t.vehicleType === vehicleTypeFilter || t.vehicleType === 'all'
      );

  return (
    <div className="maintenance-checklist-page">
      <Container fluid>
        {/* Header */}
        <div className="page-header">
          <div>
            <h2>Quy trình bảo dưỡng</h2>
            <p className="text-muted">
              {selectedTemplate 
                ? `${selectedTemplate.name} - ${selectedTemplate.estimatedDuration} phút`
                : 'Chọn mẫu checklist để bắt đầu'
              }
            </p>
          </div>
          <div className="header-actions">
            {selectedTemplate && (
              <>
                <Button 
                  variant="outline-primary"
                  onClick={() => setShowTemplateModal(true)}
                >
                  <FiFilter className="me-2" />
                  Đổi mẫu
                </Button>
                <Button 
                  variant="success"
                  onClick={() => setShowSaveModal(true)}
                  disabled={progress < 100}
                >
                  <FiSave className="me-2" />
                  Lưu checklist
                </Button>
              </>
            )}
          </div>
        </div>

        {selectedTemplate ? (
          <>
            {/* Progress Card */}
            <Card className="progress-card mb-4">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="progress-info">
                      <h5>Tiến độ hoàn thành</h5>
                      <div className="progress-stats">
                        <span className="stat-item">
                          <FiCheckCircle className="text-success me-1" />
                          {Object.values(checkedItems).filter(Boolean).length}/{selectedTemplate.items.length} items
                        </span>
                        <span className="stat-item ms-3">
                          <FiClock className="text-primary me-1" />
                          ~{selectedTemplate.estimatedDuration} phút
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="progress-bar-wrapper">
                      <ProgressBar 
                        now={progress} 
                        label={`${progress}%`}
                        variant={progress === 100 ? 'success' : 'primary'}
                        className="progress-bar-custom"
                      />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Checklist Items by Category */}
            <div className="checklist-content">
              {Object.entries(groupedItems || {}).map(([categoryId, items]) => {
                const categoryInfo = getCategoryInfo(categoryId);
                return (
                  <Card key={categoryId} className="category-card mb-4">
                    <Card.Header className="category-header" style={{ borderLeftColor: categoryInfo.color }}>
                      <div className="category-title">
                        <span className="category-icon">{categoryInfo.icon}</span>
                        <h5>{categoryInfo.name}</h5>
                        <Badge bg="secondary" className="ms-2">
                          {items.filter(i => checkedItems[i.id]).length}/{items.length}
                        </Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div className="checklist-items">
                        {items.map((item, index) => (
                          <div 
                            key={item.id} 
                            className={`checklist-item ${checkedItems[item.id] ? 'checked' : ''}`}
                          >
                            <div className="item-main">
                              <Form.Check
                                type="checkbox"
                                id={`item-${item.id}`}
                                checked={checkedItems[item.id] || false}
                                onChange={() => handleCheckItem(item.id)}
                                label={
                                  <div className="item-label">
                                    <span className="item-number">{index + 1}.</span>
                                    <span className="item-task">
                                      {item.task}
                                      {item.isRequired && (
                                        <Badge bg="danger" className="ms-2 required-badge">
                                          Bắt buộc
                                        </Badge>
                                      )}
                                    </span>
                                    <span className="item-time text-muted">
                                      <FiClock size={14} className="me-1" />
                                      ~{item.estimatedTime} phút
                                    </span>
                                  </div>
                                }
                                className="item-checkbox"
                              />
                            </div>
                            
                            {/* Notes section */}
                            <div className="item-notes">
                              <InputGroup size="sm">
                                <InputGroup.Text>
                                  <FiFileText />
                                </InputGroup.Text>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  placeholder="Ghi chú (nếu có)..."
                                  value={itemNotes[item.id] || ''}
                                  onChange={(e) => handleNoteChange(item.id, e.target.value)}
                                  className="notes-input"
                                />
                              </InputGroup>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>

            {/* Complete Button */}
            <div className="text-center mt-4 mb-4">
              <Button 
                variant="success" 
                size="lg"
                onClick={() => setShowSaveModal(true)}
                disabled={progress < 100}
                className="complete-button"
              >
                <FiCheck size={20} className="me-2" />
                {progress === 100 ? 'Hoàn thành checklist' : `Còn ${selectedTemplate.items.filter(i => i.isRequired && !checkedItems[i.id]).length} mục bắt buộc`}
              </Button>
            </div>
          </>
        ) : (
          <Card className="empty-state-card">
            <Card.Body className="text-center py-5">
              <FiFileText size={64} className="text-muted mb-3" />
              <h4>Chưa chọn mẫu checklist</h4>
              <p className="text-muted">Vui lòng chọn mẫu checklist để bắt đầu</p>
              <Button 
                variant="primary"
                onClick={() => setShowTemplateModal(true)}
              >
                Chọn mẫu checklist
              </Button>
            </Card.Body>
          </Card>
        )}

        {/* Template Selection Modal */}
        <Modal 
          show={showTemplateModal} 
          onHide={() => !selectedTemplate ? null : setShowTemplateModal(false)}
          size="lg"
          centered
          backdrop={selectedTemplate ? true : 'static'}
          className="template-modal"
        >
          <Modal.Header closeButton={!!selectedTemplate}>
            <Modal.Title>Chọn mẫu checklist</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Vehicle Type Filter */}
            <div className="mb-4">
              <Form.Label>Lọc theo loại xe:</Form.Label>
              <div className="vehicle-type-filters">
                {vehicleTypes.map(type => (
                  <Button
                    key={type.id}
                    variant={vehicleTypeFilter === type.id ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setVehicleTypeFilter(type.id)}
                    className="me-2 mb-2"
                  >
                    {type.id !== 'all' && <FaCar className="me-1" />}
                    {type.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Template Cards */}
            <Row>
              {filteredTemplates.map(template => (
                <Col md={6} key={template.id} className="mb-3">
                  <Card 
                    className="template-card"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <Card.Body>
                      <div className="template-info">
                        <h5>{template.name}</h5>
                        <p className="text-muted">{template.description}</p>
                        <div className="template-meta">
                          <Badge bg="info">
                            <FiClock className="me-1" />
                            {template.estimatedDuration} phút
                          </Badge>
                          <Badge bg="secondary" className="ms-2">
                            {template.items.length} items
                          </Badge>
                          <Badge bg="warning" className="ms-2">
                            {template.items.filter(i => i.isRequired).length} bắt buộc
                          </Badge>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-4">
                <FiAlertCircle size={48} className="text-muted mb-3" />
                <p className="text-muted">Không tìm thấy mẫu checklist phù hợp</p>
              </div>
            )}
          </Modal.Body>
        </Modal>

        {/* Save Confirmation Modal */}
        <Modal 
          show={showSaveModal} 
          onHide={() => setShowSaveModal(false)}
          centered
          className="save-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận hoàn thành</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="save-summary">
              <div className="text-center mb-4">
                <FiCheckCircle size={64} className="text-success" />
              </div>
              <h5 className="text-center mb-3">Bạn đã hoàn thành checklist!</h5>
              <div className="summary-stats">
                <div className="stat-row">
                  <span>Mẫu checklist:</span>
                  <strong>{selectedTemplate?.name}</strong>
                </div>
                <div className="stat-row">
                  <span>Tổng số mục:</span>
                  <strong>{selectedTemplate?.items.length}</strong>
                </div>
                <div className="stat-row">
                  <span>Đã hoàn thành:</span>
                  <strong className="text-success">
                    {Object.values(checkedItems).filter(Boolean).length}
                  </strong>
                </div>
                <div className="stat-row">
                  <span>Có ghi chú:</span>
                  <strong>{Object.keys(itemNotes).length}</strong>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
              Hủy
            </Button>
            <Button variant="success" onClick={handleSaveChecklist}>
              <FiSave className="me-2" />
              Lưu checklist
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default MaintenanceChecklist;

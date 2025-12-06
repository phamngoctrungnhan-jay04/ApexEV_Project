import { FaCar } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Form, Button, Badge, ProgressBar, 
  Modal, InputGroup, Alert, Spinner, Toast, ToastContainer 
} from 'react-bootstrap';
import { 
  FiCheckCircle, FiCircle, FiFileText, FiFilter, FiSave, FiX, 
  FiAlertCircle, FiClock, FiCheck, FiXCircle, FiAlertTriangle,
  FiArrowLeft, FiCamera, FiUpload
} from 'react-icons/fi';
import { 
  getTemplates, 
  getTemplateById,
  getTemplateByServiceId,
  createChecklistForOrder, 
  getChecklistsByOrder,
  submitChecklistItem 
} from '../../services/checklistService';
import { uploadTechnicianFile } from '../../services/uploadService';
import { getWorkDetail } from '../../services/technicianService';
import './MaintenanceChecklist.css';

const MaintenanceChecklist = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const serviceOrderId = searchParams.get('orderId');
  const serviceId = searchParams.get('serviceId');
  const serviceName = searchParams.get('serviceName');

  // Data states
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentChecklist, setCurrentChecklist] = useState(null);
  const [serviceOrder, setServiceOrder] = useState(null);
  
  // Item states
  const [itemResults, setItemResults] = useState({}); // { itemId: { status, notes, s3Key, mediaUrl } }
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [error, setError] = useState(null);

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all templates (fallback)
        const templatesData = await getTemplates();
        setTemplates(templatesData);

        // Fetch service order info
        if (serviceOrderId) {
          try {
            const orderDetail = await getWorkDetail(serviceOrderId);
            setServiceOrder(orderDetail);
          } catch (err) {
            console.log('Error fetching service order:', err);
          }
        }

        // Nếu có serviceId → tự động lấy template theo service
        if (serviceId) {
          try {
            const matchedTemplate = await getTemplateByServiceId(serviceId);
            if (matchedTemplate) {
              // Tìm thấy template cho service này
              setSelectedTemplate(matchedTemplate);
              
              // Tạo hoặc lấy checklist cho order
              if (serviceOrderId) {
                await createOrLoadChecklist(matchedTemplate.id);
              }
            } else {
              // Không có template cho service này → hiện modal chọn
              setShowTemplateModal(true);
            }
          } catch (err) {
            console.log('Error fetching template by service:', err);
            setShowTemplateModal(true);
          }
        } else if (serviceOrderId) {
          // Không có serviceId → kiểm tra checklist đã có
          try {
            const existingChecklists = await getChecklistsByOrder(serviceOrderId);
            if (existingChecklists && existingChecklists.length > 0) {
              const latestChecklist = existingChecklists[existingChecklists.length - 1];
              setCurrentChecklist(latestChecklist);
              
              const template = templatesData.find(t => t.id === latestChecklist.templateId);
              setSelectedTemplate(template);
              
              loadExistingResults(latestChecklist);
            } else {
              setShowTemplateModal(true);
            }
          } catch (err) {
            setShowTemplateModal(true);
          }
        } else {
          setShowTemplateModal(true);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceOrderId, serviceId]);

  const createOrLoadChecklist = async (templateId) => {
    try {
      // Kiểm tra checklist đã có chưa
      const existingChecklists = await getChecklistsByOrder(serviceOrderId);
      const existing = existingChecklists?.find(c => c.templateId === templateId);
      
      if (existing) {
        setCurrentChecklist(existing);
        loadExistingResults(existing);
      } else {
        // Tạo mới
        const newChecklist = await createChecklistForOrder(serviceOrderId, templateId);
        setCurrentChecklist(newChecklist);
      }
    } catch (err) {
      console.error('Error creating/loading checklist:', err);
    }
  };

  const loadExistingResults = (checklist) => {
    const results = {};
    checklist.results?.forEach(result => {
      results[result.templateItemId] = {
        status: result.status,
        notes: result.technicianNotes || '',
        s3Key: result.s3Key,
        mediaUrl: result.mediaUrl
      };
    });
    setItemResults(results);
  };

  // Handle template selection
  const handleSelectTemplate = async (template) => {
    try {
      setSubmitting(true);
      
      if (serviceOrderId) {
        // Tạo checklist mới cho service order
        const newChecklist = await createChecklistForOrder(serviceOrderId, template.id);
        setCurrentChecklist(newChecklist);
      }
      
      setSelectedTemplate(template);
      setItemResults({});
      setShowTemplateModal(false);
      showToast(`✅ Đã chọn mẫu: ${template.templateName}`, 'success');
    } catch (err) {
      console.error('Error creating checklist:', err);
      showToast('❌ Không thể tạo checklist. Vui lòng thử lại.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle item status change
  const handleStatusChange = (itemId, status) => {
    setItemResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        status
      }
    }));
  };

  // Handle item notes change
  const handleNotesChange = (itemId, notes) => {
    setItemResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }));
  };

  // Submit single item
  const handleSubmitItem = async (itemId) => {
    if (!currentChecklist) return;
    
    const itemResult = itemResults[itemId];
    if (!itemResult?.status) {
      showToast('⚠️ Vui lòng chọn kết quả (Đạt/Không đạt/Cần chú ý)', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await submitChecklistItem(
        currentChecklist.id,
        itemId,
        itemResult.status,
        itemResult.notes
      );
      showToast('✅ Đã lưu kết quả kiểm tra!', 'success');
    } catch (err) {
      console.error('Error submitting item:', err);
      showToast('❌ Không thể lưu. Vui lòng thử lại.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit all items
  const handleSubmitAll = async () => {
    if (!currentChecklist || !selectedTemplate) return;

    try {
      setSubmitting(true);
      
      for (const item of selectedTemplate.items) {
        const result = itemResults[item.id];
        if (result?.status) {
          await submitChecklistItem(
            currentChecklist.id,
            item.id,
            result.status,
            result.notes
          );
        }
      }
      
      showToast('✅ Đã lưu toàn bộ checklist!', 'success');
      
      // Nếu hoàn thành 100% → quay lại trang job list
      if (progress === 100) {
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting all:', err);
      showToast('❌ Có lỗi xảy ra. Vui lòng thử lại.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!selectedTemplate?.items) return 0;
    const completed = Object.values(itemResults).filter(r => r?.status).length;
    return Math.round((completed / selectedTemplate.items.length) * 100);
  };

  const progress = calculateProgress();

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PASSED':
        return <Badge bg="success"><FiCheckCircle className="me-1" /> Đạt</Badge>;
      case 'FAILED':
        return <Badge bg="danger"><FiXCircle className="me-1" /> Không đạt</Badge>;
      case 'NEEDS_ATTENTION':
        return <Badge bg="warning"><FiAlertTriangle className="me-1" /> Cần chú ý</Badge>;
      default:
        return <Badge bg="secondary"><FiCircle className="me-1" /> Chưa kiểm tra</Badge>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="maintenance-checklist-page">
        <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="maintenance-checklist-page">
      <Container fluid>
        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
            <FiAlertCircle className="me-2" />
            {error}
          </Alert>
        )}

        {/* Header */}
        <div className="page-header">
          <div>
            <Button 
              variant="outline-secondary" 
              className="me-3"
              onClick={() => navigate(-1)}
            >
              <FiArrowLeft className="me-2" />
              Quay lại
            </Button>
            <div className="d-inline-block">
              <h2 className="mb-1">
                {serviceName ? `Checklist: ${decodeURIComponent(serviceName)}` : 'Quy trình bảo dưỡng'}
              </h2>
              <p className="text-muted mb-0">
                {serviceOrder && (
                  <>
                    <FaCar className="me-1" />
                    {serviceOrder.vehicleBrand} {serviceOrder.vehicleModel} - {serviceOrder.vehicleLicensePlate}
                  </>
                )}
                {selectedTemplate && ` | Mẫu: ${selectedTemplate.templateName}`}
              </p>
            </div>
          </div>
          <div className="header-actions">
            {selectedTemplate && (
              <>
                {!serviceId && (
                  <Button 
                    variant="outline-primary"
                    onClick={() => setShowTemplateModal(true)}
                  >
                    <FiFilter className="me-2" />
                    Đổi mẫu
                  </Button>
                )}
                <Button 
                  variant="success"
                  onClick={handleSubmitAll}
                  disabled={submitting || progress === 0}
                >
                  {submitting ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <FiSave className="me-2" />
                      Lưu tất cả
                    </>
                  )}
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
                          {Object.values(itemResults).filter(r => r?.status).length}/{selectedTemplate.items.length} hạng mục
                        </span>
                        <span className="stat-item ms-3 text-success">
                          Đạt: {Object.values(itemResults).filter(r => r?.status === 'PASSED').length}
                        </span>
                        <span className="stat-item ms-2 text-danger">
                          Không đạt: {Object.values(itemResults).filter(r => r?.status === 'FAILED').length}
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

            {/* Checklist Items */}
            <Card className="checklist-card">
              <Card.Header>
                <h5 className="mb-0">
                  <FiFileText className="me-2" />
                  Danh sách hạng mục kiểm tra
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="checklist-items">
                  {selectedTemplate.items.map((item, index) => {
                    const result = itemResults[item.id];
                    return (
                      <div 
                        key={item.id} 
                        className={`checklist-item ${result?.status ? 'checked' : ''}`}
                      >
                        <div className="item-main">
                          <div className="item-info">
                            <span className="item-number">{index + 1}.</span>
                            <div className="item-content">
                              <span className="item-name">{item.itemName}</span>
                              {item.itemDescription && (
                                <small className="item-description text-muted d-block">
                                  {item.itemDescription}
                                </small>
                              )}
                            </div>
                          </div>
                          
                          {/* Status Selection */}
                          <div className="item-status">
                            <div className="status-buttons">
                              <Button 
                                size="sm"
                                variant={result?.status === 'PASSED' ? 'success' : 'outline-success'}
                                onClick={() => handleStatusChange(item.id, 'PASSED')}
                                className="status-btn"
                              >
                                <FiCheckCircle /> Đạt
                              </Button>
                              <Button 
                                size="sm"
                                variant={result?.status === 'FAILED' ? 'danger' : 'outline-danger'}
                                onClick={() => handleStatusChange(item.id, 'FAILED')}
                                className="status-btn"
                              >
                                <FiXCircle /> Không đạt
                              </Button>
                              <Button 
                                size="sm"
                                variant={result?.status === 'NEEDS_ATTENTION' ? 'warning' : 'outline-warning'}
                                onClick={() => handleStatusChange(item.id, 'NEEDS_ATTENTION')}
                                className="status-btn"
                              >
                                <FiAlertTriangle /> Cần chú ý
                              </Button>
                            </div>
                          </div>
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
                              placeholder="Ghi chú kỹ thuật (mô tả vấn đề, đề xuất sửa chữa...)"
                              value={result?.notes || ''}
                              onChange={(e) => handleNotesChange(item.id, e.target.value)}
                              className="notes-input"
                            />
                            <Button 
                              variant="outline-primary"
                              onClick={() => handleSubmitItem(item.id)}
                              disabled={submitting || !result?.status}
                            >
                              {submitting ? <Spinner size="sm" /> : <FiSave />}
                            </Button>
                          </InputGroup>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>

            {/* Complete Button */}
            <div className="text-center mt-4 mb-4">
              <Button 
                variant="success" 
                size="lg"
                onClick={handleSubmitAll}
                disabled={submitting || progress === 0}
                className="complete-button"
              >
                {submitting ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <FiCheck size={20} className="me-2" />
                    {progress === 100 ? 'Hoàn thành và lưu' : `Lưu (${progress}% hoàn thành)`}
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <Card className="empty-state-card">
            <Card.Body className="text-center py-5">
              <FiFileText size={64} className="text-muted mb-3" />
              <h4>Chưa chọn mẫu checklist</h4>
              <p className="text-muted">Vui lòng chọn mẫu checklist để bắt đầu kiểm tra</p>
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
          onHide={() => selectedTemplate ? setShowTemplateModal(false) : null}
          size="lg"
          centered
          backdrop={selectedTemplate ? true : 'static'}
          className="template-modal"
        >
          <Modal.Header closeButton={!!selectedTemplate}>
            <Modal.Title>Chọn mẫu checklist</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {templates.length === 0 ? (
              <div className="text-center py-4">
                <FiAlertCircle size={48} className="text-muted mb-3" />
                <p>Không có mẫu checklist nào. Vui lòng liên hệ Admin.</p>
              </div>
            ) : (
              <Row>
                {templates.map(template => (
                  <Col md={6} key={template.id} className="mb-3">
                    <Card 
                      className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                      onClick={() => handleSelectTemplate(template)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body>
                        <h5>{template.templateName}</h5>
                        <p className="text-muted mb-2">{template.description || 'Không có mô tả'}</p>
                        <div className="template-stats">
                          <Badge bg="info">
                            {template.items?.length || 0} hạng mục
                          </Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            {selectedTemplate && (
              <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
                Hủy
              </Button>
            )}
          </Modal.Footer>
        </Modal>

        {/* Toast Notification */}
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
          <Toast 
            show={toast.show} 
            onClose={() => setToast({ ...toast, show: false })}
            delay={3000}
            autohide
            bg={toast.variant}
          >
            <Toast.Header>
              <strong className="me-auto">Thông báo</strong>
            </Toast.Header>
            <Toast.Body className={toast.variant === 'success' || toast.variant === 'danger' ? 'text-white' : ''}>
              {toast.message}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </div>
  );
};

export default MaintenanceChecklist;

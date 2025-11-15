import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner, Modal } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { AiFillCar } from 'react-icons/ai';
import vehicleService from '../../services/vehicleService';
import './VehicleManager.css';

function VehicleManager() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    yearManufactured: new Date().getFullYear(),
    vinNumber: ''
  });

  // Load vehicles on mount
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await vehicleService.getMyVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedVehicle(null);
    setFormData({
      licensePlate: '',
      brand: '',
      model: '',
      yearManufactured: new Date().getFullYear(),
      vinNumber: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setModalMode('edit');
    setSelectedVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      yearManufactured: vehicle.yearManufactured,
      vinNumber: vehicle.vinNumber || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVehicle(null);
    setFormData({
      licensePlate: '',
      brand: '',
      model: '',
      yearManufactured: new Date().getFullYear(),
      vinNumber: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Prepare data (remove vinNumber if empty)
      const vehicleData = {
        licensePlate: formData.licensePlate.trim(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        yearManufactured: parseInt(formData.yearManufactured),
        vinNumber: formData.vinNumber.trim() || null
      };

      if (modalMode === 'add') {
        await vehicleService.addVehicle(vehicleData);
        setSuccess('✅ Thêm xe thành công!');
      } else {
        await vehicleService.updateVehicle(selectedVehicle.id, vehicleData);
        setSuccess('✅ Cập nhật xe thành công!');
      }

      handleCloseModal();
      loadVehicles();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Bạn có chắc muốn xóa xe này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await vehicleService.deleteVehicle(vehicleId);
      setSuccess('✅ Xóa xe thành công!');
      loadVehicles();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatYear = (year) => {
    return year ? `Năm ${year}` : 'Chưa xác định';
  };

  return (
    <Container className="vehicle-manager py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-2">
                <AiFillCar className="me-2" />
                Quản lý xe của tôi
              </h2>
              <p className="text-muted">Thêm và quản lý thông tin các xe của bạn để đặt lịch bảo dưỡng</p>
            </div>
            <Button
              variant="primary"
              onClick={handleOpenAddModal}
              disabled={loading}
            >
              <FiPlus className="me-2" />
              Thêm xe mới
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Vehicles List */}
      <Row>
        <Col>
          {loading && vehicles.length === 0 && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Đang tải...</p>
            </div>
          )}

          {!loading && vehicles.length === 0 && (
            <Card className="text-center py-5 empty-state">
              <Card.Body>
                <AiFillCar size={64} className="text-muted mb-3" />
                <h4 className="text-muted mb-3">Chưa có xe nào</h4>
                <p className="text-muted mb-4">
                  Hãy thêm thông tin xe của bạn để có thể đặt lịch bảo dưỡng
                </p>
                <Button variant="primary" onClick={handleOpenAddModal}>
                  <FiPlus className="me-2" />
                  Thêm xe đầu tiên
                </Button>
              </Card.Body>
            </Card>
          )}

          {vehicles.length > 0 && (
            <div className="vehicles-grid">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="vehicle-card shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="vehicle-header">
                        <h4 className="vehicle-license mb-1">{vehicle.licensePlate}</h4>
                        <Badge bg="primary" className="brand-badge">
                          {vehicle.brand}
                        </Badge>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleOpenEditModal(vehicle)}
                          disabled={loading}
                        >
                          <FiEdit2 size={16} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={loading}
                        >
                          <FiTrash2 size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="vehicle-details">
                      <div className="detail-row">
                        <span className="detail-label">Mẫu xe:</span>
                        <span className="detail-value">{vehicle.model}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Năm sản xuất:</span>
                        <span className="detail-value">{formatYear(vehicle.yearManufactured)}</span>
                      </div>
                      {vehicle.vinNumber && (
                        <div className="detail-row">
                          <span className="detail-label">Số VIN:</span>
                          <span className="detail-value font-monospace">{vehicle.vinNumber}</span>
                        </div>
                      )}
                      <div className="detail-row mt-2 pt-2 border-top">
                        <small className="text-muted">ID xe: {vehicle.id}</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>

      {/* Add/Edit Vehicle Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'add' ? (
              <>
                <FiPlus className="me-2" />
                Thêm xe mới
              </>
            ) : (
              <>
                <FiEdit2 className="me-2" />
                Cập nhật thông tin xe
              </>
            )}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Biển số xe <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ví dụ: 29A-12345"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    required
                    maxLength={15}
                  />
                  <Form.Text className="text-muted">
                    Nhập biển số xe chính xác
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Hãng xe <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ví dụ: VinFast, Toyota, Honda..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Mẫu xe <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ví dụ: VF e34, Camry, City..."
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Năm sản xuất <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Ví dụ: 2023"
                    value={formData.yearManufactured}
                    onChange={(e) => setFormData({ ...formData, yearManufactured: e.target.value })}
                    required
                    min={1990}
                    max={new Date().getFullYear() + 1}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Số VIN (không bắt buộc)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập 17 ký tự (nếu có)"
                    value={formData.vinNumber}
                    onChange={(e) => setFormData({ ...formData, vinNumber: e.target.value })}
                    maxLength={17}
                    minLength={17}
                  />
                  <Form.Text className="text-muted">
                    Số VIN có 17 ký tự. Bạn có thể bỏ qua phần này và cập nhật sau.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="info" className="mb-0">
              <small>
                <strong>Lưu ý:</strong> Khi bạn đem xe đến bảo dưỡng, cố vấn dịch vụ sẽ đối chiếu 
                biển số và số khung (VIN) để cập nhật đầy đủ thông tin cho xe của bạn.
              </small>
            </Alert>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              <FiX className="me-2" />
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FiCheck className="me-2" />
                  {modalMode === 'add' ? 'Thêm xe' : 'Cập nhật'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default VehicleManager;

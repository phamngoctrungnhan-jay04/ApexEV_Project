import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { FiCalendar, FiClock, FiCheck, FiX, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { AiFillCar } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import vehicleService from '../../services/vehicleService';
import { ROUTES } from '../../constants/routes';
import './AppointmentManager.css';

function AppointmentManager() {
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states for creating appointment
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    appointmentTime: '',
    requestedService: '',
    notes: ''
  });

  // Reschedule modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    appointmentId: null,
    newAppointmentTime: ''
  });

  // Load appointments on mount
  useEffect(() => {
    loadAppointments();
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getMyVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Convert datetime-local to ISO format
      const appointmentData = {
        ...formData,
        vehicleId: parseInt(formData.vehicleId),
        appointmentTime: new Date(formData.appointmentTime).toISOString()
      };

      await appointmentService.createAppointment(appointmentData);
      
      setSuccess('✅ Đặt lịch hẹn thành công!');
      setShowCreateForm(false);
      setFormData({
        vehicleId: '',
        appointmentTime: '',
        requestedService: '',
        notes: ''
      });
      
      // Reload appointments
      loadAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const newTime = new Date(rescheduleData.newAppointmentTime).toISOString();
      
      await appointmentService.rescheduleAppointment(
        rescheduleData.appointmentId,
        newTime
      );
      
      setSuccess('✅ Dời lịch hẹn thành công!');
      setShowRescheduleModal(false);
      setRescheduleData({ appointmentId: null, newAppointmentTime: '' });
      
      loadAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await appointmentService.cancelAppointment(appointmentId);
      
      setSuccess('✅ Hủy lịch hẹn thành công!');
      loadAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'warning', text: 'Chờ xác nhận', icon: FiClock },
      CONFIRMED: { bg: 'success', text: 'Đã xác nhận', icon: FiCheck },
      CANCELLED: { bg: 'danger', text: 'Đã hủy', icon: FiX },
      COMPLETED: { bg: 'info', text: 'Hoàn thành', icon: FiCheck }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge bg={config.bg} className="status-badge">
        <Icon size={14} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container className="appointment-manager py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-2">
                <FiCalendar className="me-2" />
                Quản lý lịch hẹn
              </h2>
              <p className="text-muted">Xem và quản lý các lịch hẹn bảo dưỡng của bạn</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={loading}
            >
              <FiCalendar className="me-2" />
              {showCreateForm ? 'Đóng form' : 'Đặt lịch mới'}
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

      {/* Create Appointment Form */}
      {showCreateForm && (
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Đặt lịch hẹn mới</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleCreateAppointment}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <AiFillCar className="me-2" />
                      Chọn xe <span className="text-danger">*</span>
                    </Form.Label>
                    {vehicles.length === 0 ? (
                      <>
                        <Alert variant="info" className="mb-2">
                          Bạn chưa có xe nào. Hãy thêm xe trước khi đặt lịch.
                        </Alert>
                        <Link to={ROUTES.CUSTOMER.VEHICLES}>
                          <Button variant="outline-primary" size="sm">
                            <FiPlus className="me-2" />
                            Thêm xe của tôi
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Form.Select
                          value={formData.vehicleId}
                          onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                          required
                        >
                          <option value="">Chọn xe...</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.licensePlate} - {vehicle.brand} {vehicle.model} ({vehicle.yearManufactured})
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Chọn xe bạn muốn đặt lịch bảo dưỡng.{' '}
                          <Link to={ROUTES.CUSTOMER.VEHICLES}>Quản lý xe</Link>
                        </Form.Text>
                      </>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiClock className="me-2" />
                      Thời gian hẹn <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                      required
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dịch vụ yêu cầu</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: Bảo dưỡng định kỳ, Thay nhớt..."
                      value={formData.requestedService}
                      onChange={(e) => setFormData({ ...formData, requestedService: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ghi chú</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Ghi chú thêm về lịch hẹn..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading || vehicles.length === 0}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FiCheck className="me-2" />
                      Đặt lịch
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Appointments List */}
      <Row>
        <Col>
          <h4 className="mb-3">Danh sách lịch hẹn</h4>
          
          {loading && !showCreateForm && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Đang tải...</p>
            </div>
          )}

          {!loading && appointments.length === 0 && (
            <Card className="text-center py-5">
              <Card.Body>
                <FiCalendar size={48} className="text-muted mb-3" />
                <h5 className="text-muted">Chưa có lịch hẹn nào</h5>
                <p className="text-muted">Hãy đặt lịch hẹn đầu tiên của bạn!</p>
              </Card.Body>
            </Card>
          )}

          {!loading && appointments.length > 0 && (
            <div className="appointments-grid">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="appointment-card shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1">Lịch hẹn #{appointment.id}</h5>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      {appointment.status === 'PENDING' && (
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setRescheduleData({
                                appointmentId: appointment.id,
                                newAppointmentTime: ''
                              });
                              setShowRescheduleModal(true);
                            }}
                          >
                            <FiEdit2 size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleCancel(appointment.id)}
                          >
                            <FiTrash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="appointment-details">
                      <div className="detail-item">
                        <FiClock className="text-primary me-2" />
                        <span className="fw-bold">Thời gian:</span>
                        <span className="ms-2">{formatDateTime(appointment.appointmentTime)}</span>
                      </div>

                      {appointment.requestedService && (
                        <div className="detail-item">
                          <FiCheck className="text-success me-2" />
                          <span className="fw-bold">Dịch vụ:</span>
                          <span className="ms-2">{appointment.requestedService}</span>
                        </div>
                      )}

                      {appointment.vehicleLicensePlate && (
                        <div className="detail-item">
                          <AiFillCar className="text-info me-2" />
                          <span className="fw-bold">Biển số:</span>
                          <span className="ms-2">{appointment.vehicleLicensePlate}</span>
                        </div>
                      )}

                      {appointment.serviceAdvisorName && (
                        <div className="detail-item">
                          <FiCheck className="text-success me-2" />
                          <span className="fw-bold">Cố vấn:</span>
                          <span className="ms-2">{appointment.serviceAdvisorName}</span>
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="detail-item mt-2">
                          <small className="text-muted">
                            <strong>Ghi chú:</strong> {appointment.notes}
                          </small>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowRescheduleModal(false)}>
          <Card className="reschedule-modal" onClick={(e) => e.stopPropagation()}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Dời lịch hẹn</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleReschedule}>
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian mới <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={rescheduleData.newAppointmentTime}
                    onChange={(e) => setRescheduleData({
                      ...rescheduleData,
                      newAppointmentTime: e.target.value
                    })}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowRescheduleModal(false)}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Xác nhận'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      )}
    </Container>
  );
}

export default AppointmentManager;

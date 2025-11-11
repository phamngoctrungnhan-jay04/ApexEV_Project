import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Badge, Modal } from 'react-bootstrap';
import {
  FiCalendar,
  FiClock,
  FiTool,
  FiTruck,
  FiCheck,
  FiArrowRight,
  FiInfo,
} from 'react-icons/fi';
import { CustomButton, CustomInput, CustomSelect, CustomCard } from '../../components/common';
import { services, serviceCategories, vehicles, technicians } from '../../mockData';
import './Booking.css';

function Booking() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  // Simulate logged-in customer
  const currentCustomerId = 1;
  const customerVehicles = vehicles.filter(v => v.customerId === currentCustomerId);

  // Form states
  const [step, setStep] = useState(1); // 1: Select Service, 2: Select Date/Time, 3: Vehicle & Notes, 4: Confirmation
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Filter services by category
  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  // Time slots
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  // Handle service selection
  const toggleService = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.basePrice || 0);
    }, 0);
  };

  // Calculate total duration
  const calculateDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.duration || 0);
    }, 0);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Handle booking submission
  const handleSubmit = () => {
    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const confirmBooking = () => {
    // TODO: Call API to create booking
    console.log('Booking confirmed:', {
      services: selectedServices,
      vehicle: selectedVehicle,
      date: selectedDate,
      time: selectedTime,
      notes,
    });
    setShowConfirmModal(false);
    // Navigate to success page or dashboard
    navigate('/customer/dashboard');
  };

  // Get next available dates (next 30 days, excluding Sundays)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Exclude Sundays (0)
      if (date.getDay() !== 0) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  return (
    <div className="booking-page">
      <Container fluid>
        {/* Page Header */}
        <div className="page-header mb-4">
          <h2>
            <FiCalendar className="me-2" />
            {t('booking.title') || 'Đặt lịch bảo dưỡng'}
          </h2>
          <p className="text-muted">
            {t('booking.subtitle') || 'Chọn dịch vụ và thời gian phù hợp với bạn'}
          </p>
        </div>

        {/* Progress Steps */}
        <Card className="steps-card mb-4">
          <Card.Body>
            <div className="booking-steps">
              <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="step-number">
                  {step > 1 ? <FiCheck /> : '1'}
                </div>
                <div className="step-label">Chọn dịch vụ</div>
              </div>
              <div className="step-divider"></div>
              <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="step-number">
                  {step > 2 ? <FiCheck /> : '2'}
                </div>
                <div className="step-label">Chọn ngày giờ</div>
              </div>
              <div className="step-divider"></div>
              <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                <div className="step-number">
                  {step > 3 ? <FiCheck /> : '3'}
                </div>
                <div className="step-label">Thông tin xe</div>
              </div>
              <div className="step-divider"></div>
              <div className={`step ${step >= 4 ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">Xác nhận</div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Row>
          <Col lg={8}>
            {/* Step 1: Select Services */}
            {step === 1 && (
              <Card className="services-card">
                <Card.Body>
                  <h5 className="mb-3">
                    <FiTool className="me-2 text-primary" />
                    Chọn dịch vụ bảo dưỡng
                  </h5>

                  {/* Category Filter */}
                  <div className="category-filter mb-4">
                    {serviceCategories.map(cat => (
                      <Badge
                        key={cat.id}
                        bg={selectedCategory === cat.id ? 'primary' : 'light'}
                        text={selectedCategory === cat.id ? 'white' : 'dark'}
                        className="category-badge"
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {currentLang === 'en' ? cat.nameEn : cat.name}
                      </Badge>
                    ))}
                  </div>

                  {/* Services List */}
                  <div className="services-list">
                    {filteredServices.map(service => (
                      <div
                        key={service.id}
                        className={`service-item ${selectedServices.includes(service.id) ? 'selected' : ''}`}
                        onClick={() => toggleService(service.id)}
                      >
                        <div className="service-check">
                          {selectedServices.includes(service.id) && <FiCheck />}
                        </div>
                        <div className="service-details">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="service-name">
                                {currentLang === 'en' ? service.nameEn : service.name}
                                {service.popular && (
                                  <Badge bg="success" className="ms-2">Phổ biến</Badge>
                                )}
                              </h6>
                              <p className="service-description text-muted">
                                {currentLang === 'en' ? service.descriptionEn : service.description}
                              </p>
                            </div>
                            <div className="text-end">
                              <div className="service-price">{formatCurrency(service.basePrice)}</div>
                              <div className="service-duration text-muted">
                                <FiClock className="me-1" />
                                {service.duration} phút
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Next Button */}
                  <div className="d-flex justify-content-end mt-4">
                    <CustomButton
                      variant="primary"
                      onClick={() => setStep(2)}
                      disabled={selectedServices.length === 0}
                    >
                      Tiếp tục <FiArrowRight className="ms-2" />
                    </CustomButton>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && (
              <Card className="datetime-card">
                <Card.Body>
                  <h5 className="mb-3">
                    <FiCalendar className="me-2 text-primary" />
                    Chọn ngày và giờ
                  </h5>

                  {/* Date Selection */}
                  <Form.Group className="mb-4">
                    <Form.Label>Chọn ngày</Form.Label>
                    <Form.Select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      size="lg"
                    >
                      <option value="">-- Chọn ngày --</option>
                      {availableDates.map(date => {
                        const dateObj = new Date(date);
                        const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
                        const dateStr = dateObj.toLocaleDateString('vi-VN');
                        return (
                          <option key={date} value={date}>
                            {dayName}, {dateStr}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>

                  {/* Time Selection */}
                  <Form.Group className="mb-4">
                    <Form.Label>Chọn giờ</Form.Label>
                    <div className="time-slots">
                      {timeSlots.map(time => (
                        <div
                          key={time}
                          className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                          onClick={() => setSelectedTime(time)}
                        >
                          <FiClock className="me-2" />
                          {time}
                        </div>
                      ))}
                    </div>
                  </Form.Group>

                  {/* Navigation Buttons */}
                  <div className="d-flex justify-content-between mt-4">
                    <CustomButton
                      variant="outline-secondary"
                      onClick={() => setStep(1)}
                    >
                      Quay lại
                    </CustomButton>
                    <CustomButton
                      variant="primary"
                      onClick={() => setStep(3)}
                      disabled={!selectedDate || !selectedTime}
                    >
                      Tiếp tục <FiArrowRight className="ms-2" />
                    </CustomButton>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Step 3: Vehicle & Notes */}
            {step === 3 && (
              <Card className="vehicle-card">
                <Card.Body>
                  <h5 className="mb-3">
                    <FiTruck className="me-2 text-primary" />
                    Thông tin xe và ghi chú
                  </h5>

                  {/* Vehicle Selection */}
                  <Form.Group className="mb-4">
                    <Form.Label>Chọn xe</Form.Label>
                    <Form.Select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      size="lg"
                    >
                      <option value="">-- Chọn xe --</option>
                      {customerVehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Notes */}
                  <Form.Group className="mb-4">
                    <Form.Label>Ghi chú (tùy chọn)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </Form.Group>

                  {/* Navigation Buttons */}
                  <div className="d-flex justify-content-between mt-4">
                    <CustomButton
                      variant="outline-secondary"
                      onClick={() => setStep(2)}
                    >
                      Quay lại
                    </CustomButton>
                    <CustomButton
                      variant="primary"
                      onClick={() => setStep(4)}
                      disabled={!selectedVehicle}
                    >
                      Tiếp tục <FiArrowRight className="ms-2" />
                    </CustomButton>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <Card className="confirmation-card">
                <Card.Body>
                  <h5 className="mb-3">
                    <FiCheck className="me-2 text-success" />
                    Xác nhận thông tin đặt lịch
                  </h5>

                  {/* Summary */}
                  <div className="booking-summary">
                    <div className="summary-section">
                      <h6 className="summary-title">Dịch vụ đã chọn</h6>
                      {selectedServices.map(serviceId => {
                        const service = services.find(s => s.id === serviceId);
                        return (
                          <div key={serviceId} className="summary-item">
                            <span>{currentLang === 'en' ? service.nameEn : service.name}</span>
                            <span>{formatCurrency(service.basePrice)}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="summary-section">
                      <h6 className="summary-title">Thời gian</h6>
                      <div className="summary-item">
                        <span>Ngày:</span>
                        <span>{new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="summary-item">
                        <span>Giờ:</span>
                        <span>{selectedTime}</span>
                      </div>
                      <div className="summary-item">
                        <span>Thời gian dự kiến:</span>
                        <span>{calculateDuration()} phút</span>
                      </div>
                    </div>

                    <div className="summary-section">
                      <h6 className="summary-title">Xe</h6>
                      <div className="summary-item">
                        <span>
                          {(() => {
                            const vehicle = customerVehicles.find(v => v.id === parseInt(selectedVehicle));
                            return vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}` : '';
                          })()}
                        </span>
                      </div>
                    </div>

                    {notes && (
                      <div className="summary-section">
                        <h6 className="summary-title">Ghi chú</h6>
                        <p className="text-muted">{notes}</p>
                      </div>
                    )}

                    <div className="summary-total">
                      <span>Tổng chi phí dự kiến:</span>
                      <strong>{formatCurrency(calculateTotal())}</strong>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="d-flex justify-content-between mt-4">
                    <CustomButton
                      variant="outline-secondary"
                      onClick={() => setStep(3)}
                    >
                      Quay lại
                    </CustomButton>
                    <CustomButton
                      variant="success"
                      onClick={handleSubmit}
                    >
                      <FiCheck className="me-2" />
                      Xác nhận đặt lịch
                    </CustomButton>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Right Sidebar - Summary */}
          <Col lg={4}>
            <Card className="summary-card sticky-top" style={{ top: '100px' }}>
              <Card.Body>
                <h5 className="mb-3">Tóm tắt đặt lịch</h5>

                {/* Selected Services */}
                {selectedServices.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-muted mb-2">Dịch vụ ({selectedServices.length})</h6>
                    {selectedServices.map(serviceId => {
                      const service = services.find(s => s.id === serviceId);
                      return (
                        <div key={serviceId} className="selected-service-item">
                          <FiCheck className="text-success me-2" />
                          <span>{currentLang === 'en' ? service.nameEn : service.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Date & Time */}
                {(selectedDate || selectedTime) && (
                  <div className="mb-3">
                    <h6 className="text-muted mb-2">Thời gian</h6>
                    {selectedDate && (
                      <div className="summary-info-item">
                        <FiCalendar className="me-2" />
                        {new Date(selectedDate).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                    {selectedTime && (
                      <div className="summary-info-item">
                        <FiClock className="me-2" />
                        {selectedTime}
                      </div>
                    )}
                  </div>
                )}

                {/* Vehicle */}
                {selectedVehicle && (
                  <div className="mb-3">
                    <h6 className="text-muted mb-2">Xe</h6>
                    <div className="summary-info-item">
                      <FiTruck className="me-2" />
                      {(() => {
                        const vehicle = customerVehicles.find(v => v.id === parseInt(selectedVehicle));
                        return vehicle ? `${vehicle.brand} ${vehicle.model}` : '';
                      })()}
                    </div>
                  </div>
                )}

                <hr />

                {/* Total */}
                <div className="summary-total-box">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tổng thời gian:</span>
                    <strong>{calculateDuration()} phút</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Tổng chi phí:</span>
                    <strong className="text-primary">{formatCurrency(calculateTotal())}</strong>
                  </div>
                </div>

                {/* Info */}
                <div className="info-box mt-3">
                  <FiInfo className="me-2" />
                  <small className="text-muted">
                    Chi phí cuối cùng có thể thay đổi sau khi kiểm tra xe
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Confirmation Modal */}
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận đặt lịch</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Bạn có chắc chắn muốn đặt lịch bảo dưỡng?</p>
            <p className="text-muted mb-0">
              Chúng tôi sẽ gửi email xác nhận đến {'{email}'}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <CustomButton variant="outline-secondary" onClick={() => setShowConfirmModal(false)}>
              Hủy
            </CustomButton>
            <CustomButton variant="success" onClick={confirmBooking}>
              <FiCheck className="me-2" />
              Xác nhận
            </CustomButton>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default Booking;

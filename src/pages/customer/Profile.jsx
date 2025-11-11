import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Table } from 'react-bootstrap';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiPlus, FiTrash2, FiTruck, FiAward } from 'react-icons/fi';
import { getCustomerById, getVehiclesByCustomer } from '../../mockData';
import './Profile.css';

const Profile = () => {
  // Mock current user ID
  const currentUserId = 1;
  const customerData = getCustomerById(currentUserId);
  const customerVehicles = getVehiclesByCustomer(currentUserId);

  // Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: customerData?.name || '',
    email: customerData?.email || '',
    phone: customerData?.phone || '',
    address: customerData?.address || '',
    dateOfBirth: customerData?.dateOfBirth || '',
    gender: customerData?.gender || 'male'
  });

  // Vehicles state
  const [vehicles, setVehicles] = useState(customerVehicles || []);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    color: '',
    vin: ''
  });

  // Handle profile edit
  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      name: customerData?.name || '',
      email: customerData?.email || '',
      phone: customerData?.phone || '',
      address: customerData?.address || '',
      dateOfBirth: customerData?.dateOfBirth || '',
      gender: customerData?.gender || 'male'
    });
  };

  const handleSaveProfile = () => {
    // Mock save
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    alert('Cập nhật thông tin thành công!');
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handle vehicle modal
  const handleShowVehicleModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate,
        color: vehicle.color || '',
        vin: vehicle.vin || ''
      });
    } else {
      setEditingVehicle(null);
      setVehicleFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        color: '',
        vin: ''
      });
    }
    setShowVehicleModal(true);
  };

  const handleCloseVehicleModal = () => {
    setShowVehicleModal(false);
    setEditingVehicle(null);
  };

  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveVehicle = () => {
    if (editingVehicle) {
      // Update existing vehicle
      setVehicles(prev => prev.map(v => 
        v.id === editingVehicle.id ? { ...v, ...vehicleFormData } : v
      ));
      alert('Cập nhật xe thành công!');
    } else {
      // Add new vehicle
      const newVehicle = {
        id: Date.now(),
        customerId: currentUserId,
        ...vehicleFormData
      };
      setVehicles(prev => [...prev, newVehicle]);
      alert('Thêm xe mới thành công!');
    }
    handleCloseVehicleModal();
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (window.confirm('Bạn có chắc muốn xóa xe này?')) {
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      alert('Đã xóa xe!');
    }
  };

  return (
    <div className="profile-page">
      <Container fluid>
        <div className="page-header">
          <h1 className="page-title">
            <FiUser className="me-2" />
            Hồ sơ cá nhân
          </h1>
          <p className="page-subtitle">Quản lý thông tin cá nhân và danh sách xe của bạn</p>
        </div>

        <Row>
          {/* Left Column - Profile Info */}
          <Col lg={4} className="mb-4">
            <Card className="profile-card">
              <Card.Body>
                <div className="profile-avatar">
                  <div className="avatar-circle">
                    <FiUser size={48} />
                  </div>
                  <h3 className="profile-name">{profileData.name}</h3>
                  <p className="profile-role">Khách hàng</p>
                  
                  {/* Loyalty Points */}
                  <div className="loyalty-points">
                    <FiAward className="points-icon" />
                    <div>
                      <div className="points-value">1,250 điểm</div>
                      <div className="points-label">Điểm thành viên</div>
                    </div>
                  </div>
                </div>

                {!isEditing ? (
                  <Button
                    variant="primary"
                    className="w-100 mt-3"
                    onClick={handleEditProfile}
                  >
                    <FiEdit2 className="me-2" />
                    Chỉnh sửa hồ sơ
                  </Button>
                ) : (
                  <div className="d-flex gap-2 mt-3">
                    <Button
                      variant="success"
                      className="flex-fill"
                      onClick={handleSaveProfile}
                    >
                      <FiSave className="me-2" />
                      Lưu
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-fill"
                      onClick={handleCancelEdit}
                    >
                      <FiX className="me-2" />
                      Hủy
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Profile Details & Vehicles */}
          <Col lg={8}>
            {/* Profile Information */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Thông tin cá nhân</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          <FiUser className="me-2" />
                          Họ và tên
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          <FiMail className="me-2" />
                          Email
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          <FiPhone className="me-2" />
                          Số điện thoại
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Ngày sinh</Form.Label>
                        <Form.Control
                          type="date"
                          name="dateOfBirth"
                          value={profileData.dateOfBirth}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Giới tính</Form.Label>
                        <Form.Select
                          name="gender"
                          value={profileData.gender}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                        >
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          <FiMapPin className="me-2" />
                          Địa chỉ
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="address"
                          value={profileData.address}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {/* Vehicles List */}
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FiTruck className="me-2" />
                  Danh sách xe ({vehicles.length})
                </h5>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleShowVehicleModal()}
                >
                  <FiPlus className="me-2" />
                  Thêm xe
                </Button>
              </Card.Header>
              <Card.Body>
                {vehicles.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <FiTruck size={48} className="mb-3 opacity-25" />
                    <p>Chưa có xe nào. Thêm xe đầu tiên của bạn!</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Hãng xe</th>
                          <th>Model</th>
                          <th>Năm</th>
                          <th>Biển số</th>
                          <th>Màu</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map(vehicle => (
                          <tr key={vehicle.id}>
                            <td>
                              <strong>{vehicle.brand}</strong>
                            </td>
                            <td>{vehicle.model}</td>
                            <td>{vehicle.year}</td>
                            <td>
                              <span className="badge bg-primary">
                                {vehicle.licensePlate}
                              </span>
                            </td>
                            <td>{vehicle.color || '-'}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleShowVehicleModal(vehicle)}
                                >
                                  <FiEdit2 />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteVehicle(vehicle.id)}
                                >
                                  <FiTrash2 />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Vehicle Modal */}
      <Modal show={showVehicleModal} onHide={handleCloseVehicleModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiTruck className="me-2" />
            {editingVehicle ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Hãng xe *</Form.Label>
              <Form.Control
                type="text"
                name="brand"
                value={vehicleFormData.brand}
                onChange={handleVehicleInputChange}
                placeholder="VD: VinFast, Tesla, Hyundai"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Model *</Form.Label>
              <Form.Control
                type="text"
                name="model"
                value={vehicleFormData.model}
                onChange={handleVehicleInputChange}
                placeholder="VD: VF8, Model 3, IONIQ 5"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Năm sản xuất *</Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={vehicleFormData.year}
                    onChange={handleVehicleInputChange}
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Biển số *</Form.Label>
                  <Form.Control
                    type="text"
                    name="licensePlate"
                    value={vehicleFormData.licensePlate}
                    onChange={handleVehicleInputChange}
                    placeholder="VD: 30A-12345"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Màu xe</Form.Label>
              <Form.Control
                type="text"
                name="color"
                value={vehicleFormData.color}
                onChange={handleVehicleInputChange}
                placeholder="VD: Trắng, Đen, Xanh"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>VIN (Vehicle Identification Number)</Form.Label>
              <Form.Control
                type="text"
                name="vin"
                value={vehicleFormData.vin}
                onChange={handleVehicleInputChange}
                placeholder="17 ký tự"
                maxLength={17}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseVehicleModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveVehicle}>
            <FiSave className="me-2" />
            {editingVehicle ? 'Cập nhật' : 'Thêm xe'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;

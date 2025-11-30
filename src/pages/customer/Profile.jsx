import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Modal, Table } from 'react-bootstrap';

// 1. Import các icon Feather (Fi...)
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

// 2. Import icon Xe (FaCar) từ FontAwesome (Fa...)
import { FaCar } from 'react-icons/fa';

import './Profile.css';
import {
  getProfile,
  updateProfile,
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../../services/profileService';

import { useAuth } from '../../context/AuthContext';
import CustomAlertModal from '../../components/common/CustomAlertModal';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // --- State cho Alert ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMsg, setAlertMsg] = useState('');

  // --- State Backup ---
  const [originalProfile, setOriginalProfile] = useState(null);

  // Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male'
  });

  // Vehicles state
  const [vehicles, setVehicles] = useState([]);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    brand: '',
    model: '',
    yearManufactured: new Date().getFullYear(),
    licensePlate: '',
    vinNumber: '',
    color: '' 
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const profile = await getProfile();
        // Map data từ API
        const initialData = {
          name: profile.fullName || profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          dateOfBirth: profile.dateOfBirth || '',
          gender: profile.gender || 'male'
        };
        setProfileData(initialData);
        setOriginalProfile(initialData);

        const vehiclesList = await getVehicles();
        setVehicles(Array.isArray(vehiclesList) ? vehiclesList : []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (originalProfile) {
      setProfileData(originalProfile);
    }
  };

  const handleSaveProfile = () => {
    const dataToSend = {
      fullName: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      dateOfBirth: profileData.dateOfBirth,
      gender: profileData.gender,
      address: profileData.address
    };
    updateProfile(dataToSend)
      .then(() => {
        setIsEditing(false);
        setOriginalProfile(profileData);
        setAlertType('success');
        setAlertMsg('Cập nhật thông tin thành công!');
        setShowAlert(true);
      })
      .catch(() => {
        setAlertType('error');
        setAlertMsg('Lỗi cập nhật thông tin!');
        setShowAlert(true);
      });
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // --- Vehicle Logic ---
  const handleShowVehicleModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        yearManufactured: vehicle.yearManufactured,
        licensePlate: vehicle.licensePlate,
        vinNumber: vehicle.vinNumber || '',
        color: vehicle.color || ''
      });
    } else {
      setEditingVehicle(null);
      setVehicleFormData({
        brand: '',
        model: '',
        yearManufactured: new Date().getFullYear(),
        licensePlate: '',
        vinNumber: '',
        color: ''
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
      updateVehicle(editingVehicle.id, vehicleFormData)
        .then((updatedVehicle) => {
          setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? updatedVehicle : v));
          setAlertType('success');
          setAlertMsg('Cập nhật xe thành công!');
          setShowAlert(true);
          handleCloseVehicleModal();
        })
        .catch(() => {
          setAlertType('error');
          setAlertMsg('Lỗi cập nhật xe!');
          setShowAlert(true);
        });
    } else {
      createVehicle(vehicleFormData)
        .then((newVehicle) => {
          setVehicles(prev => [...prev, newVehicle]);
          setAlertType('success');
          setAlertMsg('Thêm xe mới thành công!');
          setShowAlert(true);
          handleCloseVehicleModal();
        })
        .catch(() => {
          setAlertType('error');
          setAlertMsg('Lỗi thêm xe!');
          setShowAlert(true);
        });
    }
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (window.confirm('Bạn có chắc muốn xóa xe này?')) {
      deleteVehicle(vehicleId)
        .then(() => {
          setVehicles(prev => prev.filter(v => v.id !== vehicleId));
          setAlertType('success');
          setAlertMsg('Đã xóa xe!');
          setShowAlert(true);
        })
        .catch(() => {
          setAlertType('error');
          setAlertMsg('Lỗi xóa xe!');
          setShowAlert(true);
        });
    }
  };

  return (
    <>
      <div className="profile-page">
        <Container fluid>
          <div className="page-header">
            <h1 className="page-title">
              <FiUser className="me-2" />
              Hồ sơ cá nhân
            </h1>
            <p className="page-subtitle">Quản lý thông tin cá nhân và danh sách xe của bạn</p>
          </div>

          <div className="profile-main-row">
            {/* Cột Trái */}
            <div style={{ flex: 1, minWidth: 320 }}>
              <Card className="profile-card">
                <Card.Body>
                  <div className="profile-avatar">
                    <div className="avatar-circle">
                      <FiUser size={48} />
                    </div>
                    <h3 className="profile-name">{profileData.name}</h3>
                    <p className="profile-role">Khách hàng</p>
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
            </div>

            {/* Cột Phải */}
            <div style={{ flex: 2, minWidth: 400 }}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Thông tin cá nhân</h5>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label><FiUser className="me-2" />Họ và tên</Form.Label>
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
                          <Form.Label><FiMail className="me-2" />Email</Form.Label>
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
                          <Form.Label><FiPhone className="me-2" />Số điện thoại</Form.Label>
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
                          <Form.Label><FiMapPin className="me-2" />Địa chỉ</Form.Label>
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

              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0"><FaCar className="me-2" />Danh sách xe ({vehicles.length})</h5>
                  <Button variant="primary" size="sm" onClick={() => handleShowVehicleModal()}>
                    <FiPlus className="me-2" />Thêm xe
                  </Button>
                </Card.Header>
                <Card.Body>
                  {vehicles.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <FaCar size={48} className="mb-3 opacity-25" />
                      <p>Chưa có xe nào. Thêm xe đầu tiên của bạn!</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Hãng xe</th>
                            <th>Model</th>
                            <th>Năm sản xuất</th>
                            <th>Biển số</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vehicles.map(vehicle => (
                            <tr key={vehicle.id}>
                              <td><strong>{vehicle.brand || '-'}</strong></td>
                              <td>{vehicle.model || '-'}</td>
                              <td>{vehicle.yearManufactured || '-'}</td>
                              <td>
                                <span className="badge bg-primary">{vehicle.licensePlate || '-'}</span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button variant="outline-primary" size="sm" onClick={() => handleShowVehicleModal(vehicle)}>
                                    <FiEdit2 />
                                  </Button>
                                  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteVehicle(vehicle.id)}>
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
            </div>
          </div>
        </Container>

        <Modal show={showVehicleModal} onHide={handleCloseVehicleModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaCar className="me-2" />
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
                      name="yearManufactured"
                      value={vehicleFormData.yearManufactured}
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
                  value={vehicleFormData.color || ''}
                  onChange={handleVehicleInputChange}
                  placeholder="VD: Trắng, Đen, Xanh"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>VIN (Vehicle Identification Number)</Form.Label>
                <Form.Control
                  type="text"
                  name="vinNumber"
                  value={vehicleFormData.vinNumber}
                  onChange={handleVehicleInputChange}
                  placeholder="17 ký tự"
                  maxLength={17}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseVehicleModal}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveVehicle}>
              <FiSave className="me-2" />{editingVehicle ? 'Cập nhật' : 'Thêm xe'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      
      <CustomAlertModal
        show={showAlert}
        type={alertType}
        message={alertMsg}
        onClose={() => setShowAlert(false)}
      />
    </>
  );
};

export default Profile;
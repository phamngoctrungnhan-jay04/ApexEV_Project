import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
import { 
  FiSettings, FiDroplet, FiMoon, FiSun, FiBell, FiGlobe, 
  FiLock, FiTrash2, FiCheck, FiAlertTriangle 
} from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
  // Theme settings
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [darkMode, setDarkMode] = useState(false);

  // Notification settings
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [notifTypes, setNotifTypes] = useState({
    booking: true,
    payment: true,
    promotion: true,
    news: false
  });

  // Language settings
  const [language, setLanguage] = useState('vi');

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Theme colors
  const themes = [
    { id: 'blue', name: 'Xanh dương', color: '#3b82f6' },
    { id: 'green', name: 'Xanh lá', color: '#10b981' },
    { id: 'purple', name: 'Tím', color: '#8b5cf6' },
    { id: 'orange', name: 'Cam', color: '#f59e0b' },
    { id: 'red', name: 'Đỏ', color: '#ef4444' },
    { id: 'pink', name: 'Hồng', color: '#ec4899' }
  ];

  // Handlers
  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    // TODO: Apply theme to app
    console.log('Theme changed to:', themeId);
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    // TODO: Apply dark mode
    console.log('Dark mode:', !darkMode);
  };

  const handleNotifTypeChange = (type) => {
    setNotifTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSaveSettings = () => {
    const settings = {
      theme: selectedTheme,
      darkMode,
      notifications: {
        email: emailNotif,
        sms: smsNotif,
        push: pushNotif,
        types: notifTypes
      },
      language
    };
    console.log('Saving settings:', settings);
    alert('Cài đặt đã được lưu!');
  };

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    // Mock password change
    console.log('Changing password...');
    alert('Đổi mật khẩu thành công!');
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'XÓA TÀI KHOẢN') {
      alert('Vui lòng nhập chính xác "XÓA TÀI KHOẢN" để xác nhận!');
      return;
    }

    // Mock account deletion
    console.log('Deleting account...');
    alert('Tài khoản đã được xóa. Bạn sẽ được đăng xuất.');
    setShowDeleteModal(false);
    // TODO: Logout and redirect
  };

  return (
    <div className="settings-page">
      <Container fluid>
        <div className="page-header">
          <h1 className="page-title">
            <FiSettings className="me-2" />
            Cài đặt
          </h1>
          <p className="page-subtitle">Tùy chỉnh trải nghiệm sử dụng của bạn</p>
        </div>

        <Row>
          <Col lg={8}>
            {/* Theme Settings */}
            <Card className="settings-card">
              <Card.Header>
                <h5>
                  <FiDroplet className="me-2" />
                  Giao diện
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="settings-section">
                  <label className="settings-label">Chọn màu chủ đạo</label>
                  <div className="theme-grid">
                    {themes.map(theme => (
                      <div
                        key={theme.id}
                        className={`theme-option ${selectedTheme === theme.id ? 'active' : ''}`}
                        onClick={() => handleThemeChange(theme.id)}
                      >
                        <div 
                          className="theme-color"
                          style={{ background: theme.color }}
                        >
                          {selectedTheme === theme.id && (
                            <FiCheck size={20} color="white" />
                          )}
                        </div>
                        <span className="theme-name">{theme.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="settings-section">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <label className="settings-label mb-1">Chế độ tối</label>
                      <p className="settings-description">
                        Giảm độ sáng màn hình và dễ nhìn hơn vào ban đêm
                      </p>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="darkMode"
                        checked={darkMode}
                        onChange={handleDarkModeToggle}
                      />
                      <label htmlFor="darkMode" className="toggle-label">
                        {darkMode ? <FiMoon /> : <FiSun />}
                      </label>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Notification Settings */}
            <Card className="settings-card">
              <Card.Header>
                <h5>
                  <FiBell className="me-2" />
                  Thông báo
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="settings-section">
                  <label className="settings-label">Kênh nhận thông báo</label>
                  
                  <div className="notification-channel">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <div className="channel-name">Email</div>
                        <div className="channel-description">Nhận thông báo qua email</div>
                      </div>
                      <Form.Check
                        type="switch"
                        id="emailNotif"
                        checked={emailNotif}
                        onChange={(e) => setEmailNotif(e.target.checked)}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <div className="channel-name">SMS</div>
                        <div className="channel-description">Nhận tin nhắn SMS</div>
                      </div>
                      <Form.Check
                        type="switch"
                        id="smsNotif"
                        checked={smsNotif}
                        onChange={(e) => setSmsNotif(e.target.checked)}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="channel-name">Push Notification</div>
                        <div className="channel-description">Thông báo đẩy trên trình duyệt</div>
                      </div>
                      <Form.Check
                        type="switch"
                        id="pushNotif"
                        checked={pushNotif}
                        onChange={(e) => setPushNotif(e.target.checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <label className="settings-label">Loại thông báo</label>
                  
                  <div className="notification-types">
                    <Form.Check
                      type="checkbox"
                      id="notif-booking"
                      label="Cập nhật đặt lịch và bảo dưỡng"
                      checked={notifTypes.booking}
                      onChange={() => handleNotifTypeChange('booking')}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      id="notif-payment"
                      label="Thanh toán và hóa đơn"
                      checked={notifTypes.payment}
                      onChange={() => handleNotifTypeChange('payment')}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      id="notif-promotion"
                      label="Khuyến mãi và ưu đãi"
                      checked={notifTypes.promotion}
                      onChange={() => handleNotifTypeChange('promotion')}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      id="notif-news"
                      label="Tin tức và cập nhật"
                      checked={notifTypes.news}
                      onChange={() => handleNotifTypeChange('news')}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Language Settings */}
            <Card className="settings-card">
              <Card.Header>
                <h5>
                  <FiGlobe className="me-2" />
                  Ngôn ngữ
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="settings-section">
                  <label className="settings-label">Chọn ngôn ngữ hiển thị</label>
                  <Form.Select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="language-select"
                  >
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="en">🇬🇧 English</option>
                  </Form.Select>
                </div>
              </Card.Body>
            </Card>

            {/* Save Button */}
            <div className="d-flex justify-content-end mb-4">
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleSaveSettings}
                className="save-btn"
              >
                <FiCheck className="me-2" />
                Lưu cài đặt
              </Button>
            </div>
          </Col>

          <Col lg={4}>
            {/* Security Settings */}
            <Card className="settings-card">
              <Card.Header>
                <h5>
                  <FiLock className="me-2" />
                  Bảo mật
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="security-section">
                  <h6 className="mb-3">Đổi mật khẩu</h6>
                  <p className="text-muted small mb-3">
                    Thay đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn
                  </p>
                  <Button 
                    variant="outline-primary"
                    className="w-100"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <FiLock className="me-2" />
                    Đổi mật khẩu
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Danger Zone */}
            <Card className="settings-card danger-card">
              <Card.Header className="bg-danger text-white">
                <h5>
                  <FiAlertTriangle className="me-2" />
                  Vùng nguy hiểm
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="security-section">
                  <h6 className="mb-3 text-danger">Xóa tài khoản</h6>
                  <p className="text-muted small mb-3">
                    Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                  </p>
                  <Button 
                    variant="danger"
                    className="w-100"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <FiTrash2 className="me-2" />
                    Xóa tài khoản
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiLock className="me-2" />
            Đổi mật khẩu
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu hiện tại *</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới *</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Xác nhận mật khẩu mới *</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Nhập lại mật khẩu mới"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handlePasswordChange}>
            Đổi mật khẩu
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-danger">
            <FiAlertTriangle className="me-2" />
            Xác nhận xóa tài khoản
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            <strong>Cảnh báo!</strong> Hành động này không thể hoàn tác.
          </div>
          <p className="mb-3">
            Tất cả dữ liệu của bạn bao gồm lịch sử bảo dưỡng, hóa đơn, và thông tin xe sẽ bị xóa vĩnh viễn.
          </p>
          <Form.Group>
            <Form.Label>
              Nhập <strong>"XÓA TÀI KHOẢN"</strong> để xác nhận:
            </Form.Label>
            <Form.Control
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="XÓA TÀI KHOẢN"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAccount}
            disabled={deleteConfirmText !== 'XÓA TÀI KHOẢN'}
          >
            Xóa vĩnh viễn
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Settings;

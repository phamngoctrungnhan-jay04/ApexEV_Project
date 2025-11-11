import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, Dropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';
import { 
  FiBell, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiZap,
  FiMenu,
  FiGlobe
} from 'react-icons/fi';
import './Header.css';

const Header = ({ onToggleSidebar, showSidebarToggle = true }) => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: 'Lịch hẹn sắp tới',
      message: 'Bạn có lịch bảo dưỡng vào ngày mai lúc 10:00',
      time: '5 phút trước',
      unread: true
    },
    {
      id: 2,
      title: 'Hoàn thành bảo dưỡng',
      message: 'Xe của bạn đã hoàn thành bảo dưỡng định kỳ',
      time: '2 giờ trước',
      unread: true
    },
    {
      id: 3,
      title: 'Hóa đơn mới',
      message: 'Hóa đơn #12345 đã được tạo',
      time: '1 ngày trước',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Navbar bg="white" expand="lg" className="header-navbar shadow-sm">
      <Container fluid>
        {/* Sidebar Toggle Button */}
        {showSidebarToggle && (
          <button 
            className="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FiMenu size={24} />
          </button>
        )}

        {/* Logo/Brand */}
        <Navbar.Brand as={Link} to={ROUTES.HOME} className="brand-logo">
          <FiZap size={28} className="logo-icon" />
          <span className="brand-text">APEX-EV</span>
        </Navbar.Brand>

        {/* Right Side Actions */}
        <div className="header-actions">
          {/* Language Switcher */}
          <Dropdown align="end" className="language-dropdown">
            <Dropdown.Toggle variant="link" className="header-icon-btn" id="language-dropdown">
              <FiGlobe size={20} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                onClick={() => changeLanguage('vi')}
                active={i18n.language === 'vi'}
              >
                🇻🇳 Tiếng Việt
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={() => changeLanguage('en')}
                active={i18n.language === 'en'}
              >
                🇬🇧 English
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Notifications */}
          <Dropdown 
            align="end" 
            show={showNotifications}
            onToggle={() => setShowNotifications(!showNotifications)}
            className="notification-dropdown"
          >
            <Dropdown.Toggle variant="link" className="header-icon-btn position-relative" id="notification-dropdown">
              <FiBell size={20} />
              {unreadCount > 0 && (
                <Badge bg="danger" pill className="notification-badge">
                  {unreadCount}
                </Badge>
              )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="notification-menu">
              <div className="notification-header">
                <h6>Thông báo</h6>
                {unreadCount > 0 && (
                  <button className="mark-read-btn">
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
              
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.unread ? 'unread' : ''}`}
                    >
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">{notification.time}</div>
                      </div>
                      {notification.unread && <div className="unread-dot" />}
                    </div>
                  ))
                ) : (
                  <div className="notification-empty">
                    <FiBell size={48} className="empty-icon" />
                    <p>Không có thông báo mới</p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="notification-footer">
                  <Link to="/notifications">Xem tất cả thông báo</Link>
                </div>
              )}
            </Dropdown.Menu>
          </Dropdown>

          {/* User Dropdown */}
          <Dropdown align="end" className="user-dropdown">
            <Dropdown.Toggle variant="link" className="user-dropdown-toggle" id="user-dropdown">
              <div className="user-avatar">
                <FiUser size={18} />
              </div>
              <div className="user-info d-none d-md-block">
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-role">
                  {user?.role === 'customer' && 'Khách hàng'}
                  {user?.role === 'technician' && 'Kỹ thuật viên'}
                  {user?.role === 'advisor' && 'Cố vấn'}
                  {user?.role === 'manager' && 'Quản lý'}
                  {user?.role === 'admin' && 'Admin'}
                </div>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <div className="user-dropdown-header">
                <div className="user-avatar-large">
                  <FiUser size={32} />
                </div>
                <div>
                  <div className="user-name-large">{user?.name}</div>
                  <div className="user-email">{user?.email}</div>
                </div>
              </div>
              
              <Dropdown.Divider />
              
              <Dropdown.Item as={Link} to={ROUTES.CUSTOMER.PROFILE}>
                <FiUser className="me-2" /> Hồ sơ cá nhân
              </Dropdown.Item>
              <Dropdown.Item as={Link} to={ROUTES.CUSTOMER.SETTINGS}>
                <FiSettings className="me-2" /> Cài đặt
              </Dropdown.Item>
              
              <Dropdown.Divider />
              
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <FiLogOut className="me-2" /> Đăng xuất
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;

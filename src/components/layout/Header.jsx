import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Dropdown } from 'react-bootstrap'; // Giữ lại Dropdown nếu muốn dùng cho Language
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';
import { 
  FiBell, 
  FiUser, 
  FiLogOut, 
  FiGlobe,
  FiHome,
  FiCalendar,
  FiClock,
  FiZap,
  FiMenu
} from 'react-icons/fi';
import { IoCarSportOutline } from 'react-icons/io5';
import NotificationList from '../common/NotificationList';
import notificationService from '../../services/notificationService';
import './Header.css';

const Header = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Hiệu ứng đổi bóng header khi cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.getUnreadCount()
        .then(count => setUnreadCount(count))
        .catch(() => setUnreadCount(0));
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  // Helper để check active link
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className={`dashboard-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-content">
        
        {/* --- 1. BRAND LOGO --- */}
        <Link to="/Homepage" className="navbar-brand">
          <FiZap size={28} color="#338AF3" /> {/* Icon sấm sét cho xe điện */}
          <span className="brand-text">ReGen</span>
          <span className="brand-badge">Z</span>
        </Link>

        {/* --- 2. MAIN NAVIGATION --- */}
        <div className="navbar-links">
          <Link to="/Homepage" className={`nav-link ${isActive('/Homepage')}`}>
            <FiHome /> <span>Trang chủ</span>
          </Link>
          <Link to="/customer/booking" className={`nav-link ${isActive('/customer/booking')}`}>
            <FiCalendar /> <span>Đặt lịch</span>
          </Link>
          <Link to="/customer/history" className={`nav-link ${isActive('/customer/history')}`}>
            <FiClock /> <span>Lịch sử</span>
          </Link>
          <Link to="/customer/vehicles" className={`nav-link ${isActive('/customer/vehicles')}`}>
            <IoCarSportOutline /> <span>Xe của tôi</span>
          </Link>
        </div>

        {/* --- 3. RIGHT ACTIONS --- */}
        <div className="navbar-right">
          
          {/* Language Switcher (Icon Only) */}
          <div className="action-icon-wrapper" onClick={() => changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}>
             <FiGlobe size={20} color="#6B7280" />
             <span className="lang-code">{i18n.language === 'vi' ? 'VI' : 'EN'}</span>
          </div>

          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="action-icon-wrapper notification-trigger" onClick={() => setShowNotif(true)}>
                <FiBell size={20} color="#6B7280" />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </div>
              {showNotif && (
                <NotificationList onClose={() => setShowNotif(false)} onUnreadCountChange={setUnreadCount} />
              )}

              {/* User Logged In Menu */}
              <div className="user-menu-container">
                <div className="user-info-clickable" onClick={() => navigate('/customer/profile')}>
                    <div className="user-avatar">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=338AF3&color=fff`} 
                        alt="Avatar" 
                    />
                    </div>
                    <span className="user-name">{user?.fullName || 'Khách hàng'}</span>
                </div>
                
                <button className="btn-logout" onClick={handleLogout} title="Đăng xuất">
                  <FiLogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            /* Guest Buttons */
            <div className="navbar-auth-buttons">
              <Link to={ROUTES.LOGIN} className="custom-btn-base custom-login-btn">
                Đăng nhập
              </Link>
              <Link to={ROUTES.REGISTER} className="custom-btn-base custom-register-btn">
                Đăng ký ngay
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle (Hiện khi màn hình nhỏ) */}
          <button className="mobile-toggle" onClick={onToggleSidebar}>
            <FiMenu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
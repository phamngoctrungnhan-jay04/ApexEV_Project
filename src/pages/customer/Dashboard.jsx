import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiTool,
  FiLogOut,
  FiArrowRight,
  FiZap,
  FiHome,
} from 'react-icons/fi';
import { IoCarSportOutline } from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalSpent: 0,
    completedServices: 0,
    upcomingBookings: 0,
    vehicleCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Gọi API để lấy dữ liệu thống kê
      // const response = await dashboardService.getCustomerStats(user.id);
      // setStats(response.stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const quickActions = [
    {
      icon: <FiCalendar />,
      title: 'Đặt lịch bảo dưỡng',
      description: 'Đặt lịch hẹn cho xe của bạn',
      path: '/customer/booking',
      color: '#005CF0'
    },
    {
      icon: <FiTool />,
      title: 'Dịch vụ của tôi',
      description: 'Xem các dịch vụ đã sử dụng',
      path: '/customer/history',
      color: '#10B981'
    },
    {
      icon: <IoCarSportOutline />,
      title: 'Quản lý xe',
      description: 'Thông tin xe và bảo dưỡng',
      path: '/customer/vehicles',
      color: '#F59E0B'
    },
    {
      icon: <FiDollarSign />,
      title: 'Hóa đơn',
      description: 'Lịch sử thanh toán',
      path: '/customer/invoices',
      color: '#8B5CF6'
    }
  ];

  return (
    <div className="customer-dashboard-new">
      {/* Background Image */}
      <div className="dashboard-background">
        <img src="/images/Vinfast-line-up.jpg" alt="VinFast Background" />
        <div className="background-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="dashboard-navbar">
        <Container fluid>
          <div className="navbar-content">
            <div className="navbar-left">
              <div className="navbar-brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
                <span className="brand-text">APEX</span>
                <span className="brand-badge">EV</span>
              </div>
              <div className="navbar-links">
                <a href="/Homepage" className="nav-link active">
                  <FiHome className="link-icon" />
                  Trang chủ
                </a>
                <a href="#services" className="nav-link">
                  <FiTool className="link-icon" />
                  Dịch vụ
                </a>
                <a href="/customer/history" className="nav-link">
                  <FiClock className="link-icon" />
                  Lịch sử
                </a>
                <a href="/customer/vehicles" className="nav-link">
                  <IoCarSportOutline className="link-icon" />
                  Xe của tôi
                </a>
              </div>
            </div>
            <div className="navbar-right">
              <div className="user-menu">
                <div className="user-avatar">
                  <img src={`https://ui-avatars.com/api/?name=${user?.fullName}&background=005CF0&color=fff`} alt="User" />
                </div>
                <span className="user-name">{user?.fullName}</span>
                <button className="btn-logout" onClick={handleLogout}>
                  <FiLogOut />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </Container>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        <Container>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <>
              {/* Welcome Section */}
              <div className="welcome-section fade-in">
                <h1 className="welcome-title">
                  Chào mừng trở lại, <span className="highlight">{user?.fullName}</span>! 👋
                </h1>
                <p className="welcome-subtitle">
                  Quản lý dịch vụ và bảo dưỡng xe điện của bạn một cách dễ dàng
                </p>
              </div>

              {/* Stats Cards */}
              <Row className="stats-section mb-5">
                <Col lg={3} md={6} className="mb-4">
                  <Card className="stat-card stat-card-blue slide-up">
                    <Card.Body>
                      <div className="stat-icon">
                        <FiTool />
                      </div>
                      <h3 className="stat-number">{stats?.completedServices || 0}</h3>
                      <p className="stat-label">Dịch vụ hoàn thành</p>
                      <div className="stat-glow"></div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4">
                  <Card className="stat-card stat-card-green slide-up" style={{animationDelay: '0.1s'}}>
                    <Card.Body>
                      <div className="stat-icon">
                        <FiCalendar />
                      </div>
                      <h3 className="stat-number">{stats?.upcomingBookings || 0}</h3>
                      <p className="stat-label">Lịch hẹn sắp tới</p>
                      <div className="stat-glow"></div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4">
                  <Card className="stat-card stat-card-orange slide-up" style={{animationDelay: '0.2s'}}>
                    <Card.Body>
                      <div className="stat-icon">
                        <IoCarSportOutline />
                      </div>
                      <h3 className="stat-number">{stats?.vehicleCount || 0}</h3>
                      <p className="stat-label">Xe của tôi</p>
                      <div className="stat-glow"></div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4">
                  <Card className="stat-card stat-card-purple slide-up" style={{animationDelay: '0.3s'}}>
                    <Card.Body>
                      <div className="stat-icon">
                        <FiDollarSign />
                      </div>
                      <h3 className="stat-number">{formatCurrency(stats?.totalSpent || 0)}</h3>
                      <p className="stat-label">Tổng chi phí</p>
                      <div className="stat-glow"></div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Quick Actions */}
              <div className="quick-actions-section">
                <h2 className="section-title">Thao tác nhanh</h2>
                <Row>
                  {quickActions.map((action, index) => (
                    <Col key={index} lg={3} md={6} className="mb-4">
                      <Card 
                        className="action-card slide-up"
                        style={{animationDelay: `${index * 0.1}s`}}
                        onClick={() => navigate(action.path)}
                      >
                        <Card.Body>
                          <div className="action-icon" style={{background: `linear-gradient(135deg, ${action.color}, ${action.color}dd)`}}>
                            {action.icon}
                          </div>
                          <h4 className="action-title">{action.title}</h4>
                          <p className="action-description">{action.description}</p>
                          <div className="action-arrow">
                            <FiArrowRight />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </>
          )}
        </Container>
      </div>
    </div>
  );
}

export default CustomerDashboard;

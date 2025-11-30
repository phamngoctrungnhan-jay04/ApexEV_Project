import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { 
  FiTool, 
  FiBatteryCharging, 
  FiZap, 
  FiCalendar,
  FiCheckCircle,
  FiArrowRight,
  FiHome
} from 'react-icons/fi';
import { IoCarSportOutline } from 'react-icons/io5';
import Header from '../../components/layout/Header';
import './Homepage.css';


function Homepage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const quickInfoCards = [
    {
      icon: <FiTool />,
      title: 'Bảo dưỡng định kỳ',
      description: 'Chăm sóc xe điện chuyên nghiệp'
    },
    {
      icon: <FiBatteryCharging />,
      title: 'Kiểm tra pin & hệ thống điện',
      description: 'Đảm bảo hiệu suất tối ưu'
    },
    {
      icon: <FiZap />,
      title: 'Chẩn đoán phần mềm/firmware',
      description: 'Cập nhật công nghệ mới nhất'
    },
    {
      icon: <IoCarSportOutline />,
      title: 'Test & hiệu chỉnh vận hành',
      description: 'An toàn trên mọi hành trình'
    }
  ];

  return (
    <div className="vinfast-homepage">
      {/* Shared Header for all main pages */}
      <Header />
      {/* Hero Section */}
      <section 
        className="hero-section" 
        style={{ 
          transform: `translateY(${scrollY * 0.5}px)`,
          opacity: 1 - scrollY / 800 
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-background">
          <img src="/images/Vinfast-line-up.jpg" alt="VinFast Lineup" />
        </div>
        <Container className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title fade-in">
              Maintenance & Service
              <br />
              <span className="highlight-text">for Electric Vehicles</span>
            </h1>
            <p className="hero-subtitle slide-up">
              Chăm sóc toàn diện – An tâm trên mọi hành trình
            </p>
            <div className="hero-cta">
              <button 
                className="btn-primary-cta glow-effect"
                onClick={() => user ? navigate('/customer/booking') : navigate('/register')}
              >
                <FiCalendar className="me-2" />
                Đặt Lịch Bảo Dưỡng Ngay
                <FiArrowRight className="ms-2" />
              </button>
              <button 
                className="btn-secondary-cta"
                onClick={() => navigate('/customer/tracking')}
              >
                <FiCheckCircle className="me-2" />
                Tra Cứu Tình Trạng Xe
              </button>
            </div>
          </div>
        </Container>
        
        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className="quick-info-section">
        <Container>
          <div className="section-header fade-in">
            <h2 className="section-title">Dịch vụ của chúng tôi</h2>
            <div className="title-line"></div>
          </div>
          
          <Row className="info-cards-grid">
            {quickInfoCards.map((card, index) => (
              <Col 
                key={index} 
                lg={3} 
                md={6} 
                className="mb-4"
              >
                <Card 
                  className="info-card slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card.Body>
                    <div className="card-icon-wrapper">
                      <div className="card-icon">{card.icon}</div>
                    </div>
                    <h4 className="card-title">{card.title}</h4>
                    <p className="card-description">{card.description}</p>
                    <div className="card-arrow">
                      <FiArrowRight />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4">
              <div className="feature-content fade-in">
                <h2 className="feature-title">
                  Công nghệ tiên tiến
                  <br />
                  <span className="highlight-text">cho xe điện VinFast</span>
                </h2>
                <p className="feature-description">
                  Chúng tôi sử dụng công nghệ chẩn đoán tiên tiến nhất, 
                  kết hợp với đội ngũ kỹ thuật viên chuyên môn cao để 
                  đảm bảo xe điện của bạn luôn trong tình trạng hoàn hảo.
                </p>
                <ul className="feature-list">
                  <li>
                    <FiCheckCircle className="check-icon" />
                    Hệ thống chẩn đoán thông minh
                  </li>
                  <li>
                    <FiCheckCircle className="check-icon" />
                    Đội ngũ kỹ thuật viên chứng nhận
                  </li>
                  <li>
                    <FiCheckCircle className="check-icon" />
                    Linh kiện chính hãng VinFast
                  </li>
                  <li>
                    <FiCheckCircle className="check-icon" />
                    Bảo hành toàn diện
                  </li>
                </ul>
                <button 
                  className="btn-learn-more"
                  onClick={() => navigate('/about')}
                >
                  Tìm hiểu thêm
                  <FiArrowRight className="ms-2" />
                </button>
              </div>
            </Col>
            <Col lg={6}>
              <div className="feature-visual slide-up">
                <div className="electric-pulse-ring"></div>
                <div className="feature-icon-large">
                  <FiZap />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <Container>
          <Row className="text-center">
            <Col md={3} className="mb-4">
              <div className="stat-item fade-in">
                <h3 className="stat-number">5000+</h3>
                <p className="stat-label">Xe được bảo dưỡng</p>
              </div>
            </Col>
            <Col md={3} className="mb-4">
              <div className="stat-item fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="stat-number">98%</h3>
                <p className="stat-label">Khách hàng hài lòng</p>
              </div>
            </Col>
            <Col md={3} className="mb-4">
              <div className="stat-item fade-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="stat-number">50+</h3>
                <p className="stat-label">Kỹ thuật viên chuyên nghiệp</p>
              </div>
            </Col>
            <Col md={3} className="mb-4">
              <div className="stat-item fade-in" style={{ animationDelay: '0.3s' }}>
                <h3 className="stat-number">24/7</h3>
                <p className="stat-label">Hỗ trợ khẩn cấp</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <div className="cta-box">
            <h2 className="cta-title fade-in">
              Sẵn sàng trải nghiệm dịch vụ chăm sóc xe điện tốt nhất?
            </h2>
            <p className="cta-subtitle">
              Đặt lịch ngay hôm nay và nhận ưu đãi đặc biệt cho khách hàng mới
            </p>
            <button 
              className="btn-cta-large glow-effect"
              onClick={() => user ? navigate('/customer/booking') : navigate('/register')}
            >
              <FiCalendar className="me-2" />
              Đặt lịch ngay
              <FiArrowRight className="ms-2" />
            </button>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="vinfast-footer">
        <Container>
          <Row>
            <Col md={4} className="mb-4">
              <h5 className="footer-title">APEX EV Service</h5>
              <p className="footer-text">
                Trung tâm bảo dưỡng và sửa chữa xe điện VinFast 
                hàng đầu tại Việt Nam.
              </p>
            </Col>
            <Col md={4} className="mb-4">
              <h5 className="footer-title">Liên kết nhanh</h5>
              <ul className="footer-links">
                <li><a href="#services">Dịch vụ</a></li>
                <li><a href="#about">Giới thiệu</a></li>
                <li><a href="#contact">Liên hệ</a></li>
                <li><a href="/terms">Điều khoản</a></li>
              </ul>
            </Col>
            <Col md={4} className="mb-4">
              <h5 className="footer-title">Liên hệ</h5>
              <p className="footer-text">
                Email: support@apexev.com<br />
                Hotline: 1900 xxxx<br />
                Địa chỉ: Hà Nội, Việt Nam
              </p>
            </Col>
          </Row>
          <div className="footer-bottom">
            <p>&copy; 2025 APEX EV Service. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

export default Homepage;

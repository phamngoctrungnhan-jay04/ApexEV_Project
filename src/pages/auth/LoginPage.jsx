import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { CustomButton, CustomInput } from '../../components/common';
import { useTranslation } from 'react-i18next';
import { FiMail, FiLock, FiZap } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import './LoginPage.css';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError(t('common.pleaseEnterAllFields') || 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    
    // Mock login - accept any credentials
    setTimeout(() => {
      const mockUser = {
        id: 1,
        email: email,
        name: 'Khách hàng Demo',
        role: 'customer', // Default role for demo
      };
      
      login(mockUser);
      setLoading(false);
      navigate(ROUTES.CUSTOMER.DASHBOARD);
    }, 1000);
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // TODO: Implement social login
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="login-page">
      {/* Language Switcher */}
      <div className="language-switcher">
        <button
          className={`lang-btn ${i18n.language === 'vi' ? 'active' : ''}`}
          onClick={() => changeLanguage('vi')}
        >
          VI
        </button>
        <button
          className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
          onClick={() => changeLanguage('en')}
        >
          EN
        </button>
      </div>

      <Container fluid className="h-100">
        <Row className="h-100 g-0">
          {/* Left Side - Hero Section */}
          <Col lg={6} className="d-none d-lg-flex login-hero">
            <div className="hero-content">
              <div className="logo-section">
                <FiZap size={48} className="logo-icon" />
                <h1 className="brand-name">APEX-EV</h1>
              </div>
              <h2 className="hero-title">
                Quản lý bảo dưỡng xe điện<br />
                thông minh và hiệu quả
              </h2>
              <p className="hero-description">
                Hệ thống quản lý toàn diện cho trung tâm bảo dưỡng xe điện.
                Dễ dàng đặt lịch, theo dõi tiến độ và quản lý thông tin xe của bạn.
              </p>
              
              <div className="hero-features">
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Đặt lịch trực tuyến 24/7</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Theo dõi tiến độ real-time</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Lịch sử bảo dưỡng đầy đủ</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Login Form */}
          <Col lg={6} className="login-form-section">
            <div className="login-form-container">
              {/* Mobile Logo */}
              <div className="mobile-logo d-lg-none">
                <FiZap size={32} className="logo-icon" />
                <span className="brand-name">APEX-EV</span>
              </div>

              <div className="form-header">
                <h2 className="form-title">{t('auth.loginTitle')}</h2>
                <p className="form-subtitle">{t('auth.loginSubtitle')}</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')} className="custom-alert">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <CustomInput
                  label={t('auth.email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  icon={FiMail}
                  required
                />

                <CustomInput
                  label={t('auth.password')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  icon={FiLock}
                  required
                />

                <div className="form-options">
                  <Form.Check
                    type="checkbox"
                    id="remember-me"
                    label={t('auth.rememberMe')}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="remember-me"
                  />
                  <Link to="/forgot-password" className="forgot-link">
                    {t('auth.forgotPassword')}
                  </Link>
                </div>

                <CustomButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  className="mt-4 login-btn"
                >
                  {t('auth.loginButton')}
                </CustomButton>
              </Form>

              {/* Social Login */}
              <div className="social-login">
                <div className="divider">
                  <span>{t('auth.orLoginWith')}</span>
                </div>
                
                <div className="social-buttons">
                  <button
                    type="button"
                    className="social-btn google-btn"
                    onClick={() => handleSocialLogin('google')}
                  >
                    <FaGoogle size={20} />
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="social-btn facebook-btn"
                    onClick={() => handleSocialLogin('facebook')}
                  >
                    <FaFacebook size={20} />
                    <span>Facebook</span>
                  </button>
                </div>
              </div>

              {/* Register Link */}
              <div className="register-link">
                {t('auth.noAccount')} <Link to={ROUTES.REGISTER}>{t('auth.signUpNow')}</Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;

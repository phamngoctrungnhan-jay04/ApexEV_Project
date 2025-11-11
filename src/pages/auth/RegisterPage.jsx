import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { CustomButton, CustomInput } from '../../components/common';
import { useTranslation } from 'react-i18next';
import { FiMail, FiLock, FiUser, FiPhone, FiZap, FiCheckCircle } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import './RegisterPage.css';

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Optional vehicle info
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: ''
  });
  
  const [showVehicleInfo, setShowVehicleInfo] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailVerification, setEmailVerification] = useState({
    showVerification: false,
    code: '',
    sentCode: ''
  });

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Check password strength
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    let label = '';
    let color = '';
    
    if (score <= 1) {
      label = 'Yếu';
      color = 'danger';
    } else if (score <= 3) {
      label = 'Trung bình';
      color = 'warning';
    } else {
      label = 'Mạnh';
      color = 'success';
    }

    setPasswordStrength({ score, label, color });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (!agreeTerms) {
      setError('Bạn cần đồng ý với điều khoản sử dụng');
      return;
    }

    setLoading(true);

    // Mock: Send verification code
    setTimeout(() => {
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      setEmailVerification({
        showVerification: true,
        code: '',
        sentCode: mockCode
      });
      setLoading(false);
      console.log('Verification code sent:', mockCode); // In ra console để demo
    }, 1000);
  };

  const handleVerifyEmail = (e) => {
    e.preventDefault();
    
    if (emailVerification.code !== emailVerification.sentCode) {
      setError('Mã xác thực không đúng. Vui lòng thử lại.');
      return;
    }

    setLoading(true);

    // Mock: Register success
    setTimeout(() => {
      const mockUser = {
        id: Date.now(),
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: 'customer',
        vehicle: showVehicleInfo ? {
          brand: formData.vehicleBrand,
          model: formData.vehicleModel,
          year: formData.vehicleYear,
          licensePlate: formData.licensePlate
        } : null
      };

      login(mockUser);
      setLoading(false);
      navigate(ROUTES.CUSTOMER.DASHBOARD);
    }, 1000);
  };

  const handleSocialRegister = (provider) => {
    console.log(`Register with ${provider}`);
    // TODO: Implement social registration
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  // If showing verification form
  if (emailVerification.showVerification) {
    return (
      <div className="register-page">
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
          <Row className="h-100 justify-content-center align-items-center">
            <Col lg={5}>
              <div className="verification-container">
                <div className="verification-icon">
                  <FiMail size={64} />
                </div>
                <h2 className="verification-title">Xác thực Email</h2>
                <p className="verification-text">
                  Chúng tôi đã gửi mã xác thực đến email<br />
                  <strong>{formData.email}</strong>
                </p>

                <Alert variant="info" className="text-center">
                  <strong>Demo:</strong> Mã xác thực là: <code>{emailVerification.sentCode}</code>
                </Alert>

                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleVerifyEmail}>
                  <Form.Group className="mb-4">
                    <Form.Label>Nhập mã xác thực (6 số)</Form.Label>
                    <Form.Control
                      type="text"
                      maxLength="6"
                      value={emailVerification.code}
                      onChange={(e) => setEmailVerification(prev => ({
                        ...prev,
                        code: e.target.value.replace(/\D/g, '')
                      }))}
                      placeholder="000000"
                      className="text-center verification-input"
                      required
                    />
                  </Form.Group>

                  <CustomButton
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    className="mb-3"
                  >
                    Xác nhận
                  </CustomButton>

                  <div className="text-center">
                    <button
                      type="button"
                      className="resend-link"
                      onClick={handleSubmit}
                    >
                      Gửi lại mã xác thực
                    </button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Main registration form
  return (
    <div className="register-page">
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
          <Col lg={6} className="d-none d-lg-flex register-hero">
            <div className="hero-content">
              <div className="logo-section">
                <FiZap size={48} className="logo-icon" />
                <h1 className="brand-name">APEX-EV</h1>
              </div>
              <h2 className="hero-title">
                Tham gia cùng chúng tôi<br />
                để trải nghiệm dịch vụ tốt nhất
              </h2>
              <p className="hero-description">
                Đăng ký tài khoản miễn phí và bắt đầu quản lý bảo dưỡng xe điện của bạn một cách dễ dàng và hiệu quả.
              </p>
              
              <div className="hero-benefits">
                <div className="benefit-item">
                  <FiCheckCircle size={24} />
                  <div>
                    <strong>Miễn phí trọn đời</strong>
                    <p>Không mất phí đăng ký và sử dụng</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <FiCheckCircle size={24} />
                  <div>
                    <strong>Bảo mật tuyệt đối</strong>
                    <p>Thông tin được mã hóa và bảo vệ</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <FiCheckCircle size={24} />
                  <div>
                    <strong>Hỗ trợ 24/7</strong>
                    <p>Đội ngũ luôn sẵn sàng hỗ trợ bạn</p>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Register Form */}
          <Col lg={6} className="register-form-section">
            <div className="register-form-container">
              <div className="mobile-logo d-lg-none">
                <FiZap size={32} className="logo-icon" />
                <span className="brand-name">APEX-EV</span>
              </div>

              <div className="form-header">
                <h2 className="form-title">{t('auth.registerTitle')}</h2>
                <p className="form-subtitle">{t('auth.registerSubtitle')}</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="form-section">
                  <h6 className="section-title">Thông tin cá nhân</h6>
                  
                  <CustomInput
                    label={t('auth.fullName')}
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder={t('auth.fullNamePlaceholder')}
                    icon={FiUser}
                    required
                  />

                  <CustomInput
                    label={t('auth.email')}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('auth.emailPlaceholder')}
                    icon={FiMail}
                    required
                  />

                  <CustomInput
                    label={t('auth.phone')}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('auth.phonePlaceholder')}
                    icon={FiPhone}
                    required
                  />

                  <CustomInput
                    label={t('auth.password')}
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t('auth.passwordPlaceholder')}
                    icon={FiLock}
                    required
                  />

                  {formData.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className={`strength-fill strength-${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`strength-label text-${passwordStrength.color}`}>
                        {t('auth.passwordStrength')}: {passwordStrength.label}
                      </span>
                    </div>
                  )}

                  <CustomInput
                    label={t('auth.confirmPassword')}
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    icon={FiLock}
                    required
                  />
                </div>

                {/* Vehicle Information (Optional) */}
                <div className="form-section">
                  <div className="section-header">
                    <h6 className="section-title">{t('auth.vehicleInfo')}</h6>
                    <button
                      type="button"
                      className="toggle-btn"
                      onClick={() => setShowVehicleInfo(!showVehicleInfo)}
                    >
                      {showVehicleInfo ? (i18n.language === 'vi' ? 'Ẩn' : 'Hide') : (i18n.language === 'vi' ? 'Hiện' : 'Show')}
                    </button>
                  </div>

                  {showVehicleInfo && (
                    <>
                      <Row>
                        <Col md={6}>
                          <CustomInput
                            label={t('auth.vehicleBrand')}
                            type="text"
                            name="vehicleBrand"
                            value={formData.vehicleBrand}
                            onChange={handleInputChange}
                            placeholder={t('auth.vehicleBrandPlaceholder')}
                          />
                        </Col>
                        <Col md={6}>
                          <CustomInput
                            label={t('auth.vehicleModel')}
                            type="text"
                            name="vehicleModel"
                            value={formData.vehicleModel}
                            onChange={handleInputChange}
                            placeholder={t('auth.vehicleModelPlaceholder')}
                          />
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <CustomInput
                            label={i18n.language === 'vi' ? 'Năm sản xuất' : 'Year'}
                            type="number"
                            name="vehicleYear"
                            value={formData.vehicleYear}
                            onChange={handleInputChange}
                            placeholder="2023"
                            min="2000"
                            max="2025"
                          />
                        </Col>
                        <Col md={6}>
                          <CustomInput
                            label={t('auth.licensePlate')}
                            type="text"
                            name="licensePlate"
                            value={formData.licensePlate}
                            onChange={handleInputChange}
                            placeholder={t('auth.licensePlatePlaceholder')}
                          />
                        </Col>
                      </Row>
                    </>
                  )}
                </div>

                {/* Terms & Conditions */}
                <Form.Check
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="terms-check"
                  label={
                    <span>
                      {t('auth.agreeTerms')}{' '}
                      <Link to="/terms" target="_blank">{t('auth.termsOfService')}</Link>
                      {' '}{t('auth.and')}{' '}
                      <Link to="/privacy" target="_blank">{t('auth.privacyPolicy')}</Link>
                    </span>
                  }
                  required
                />

                <CustomButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  className="mt-4 register-btn"
                >
                  {t('auth.registerButton')}
                </CustomButton>
              </Form>

              {/* Social Register */}
              <div className="social-login">
                <div className="divider">
                  <span>{t('auth.orRegisterWith')}</span>
                </div>
                
                <div className="social-buttons">
                  <button
                    type="button"
                    className="social-btn google-btn"
                    onClick={() => handleSocialRegister('google')}
                  >
                    <FaGoogle size={20} />
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="social-btn facebook-btn"
                    onClick={() => handleSocialRegister('facebook')}
                  >
                    <FaFacebook size={20} />
                    <span>Facebook</span>
                  </button>
                </div>
              </div>

              {/* Login Link */}
              <div className="login-link">
                {t('auth.haveAccount')} <Link to={ROUTES.LOGIN}>{t('auth.loginNow')}</Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from 'react-i18next';
import { FiMail, FiLock, FiUser, FiPhone, FiZap, FiShield, FiClock, FiTrendingUp, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { IoCarSportOutline } from 'react-icons/io5';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import authService from '../../services/authService';
import './RegisterPage-Modern.css';

const RegisterPageModern = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!agreeTerms) {
      setError('Bạn cần đồng ý với điều khoản dịch vụ');
      return;
    }

    setLoading(true);

    try {
      // Call real API
      const response = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'CUSTOMER'
      });

      // Show success and redirect to OTP page
      setSuccess(true);
      setLoading(false);

      // Redirect to OTP verification page after 1 second
      setTimeout(() => {
        navigate('/verify-otp', { 
          state: { 
            email: formData.email 
          } 
        });
      }, 1000);

    } catch (err) {
      setLoading(false);
      setSuccess(false);
      
      // Handle specific error messages from backend
      if (err.error) {
        setError(err.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại!');
      }
      console.error('Registration error:', err);
    }
  };

  const handleSocialRegister = (provider) => {
    console.log(`Register with ${provider}`);
    // Mock social registration
    setTimeout(() => {
      const mockUser = {
        id: Date.now(),
        name: `User from ${provider}`,
        email: `${provider}@example.com`,
        role: 'customer'
      };
      login(mockUser);
      navigate(ROUTES.CUSTOMER.DASHBOARD);
    }, 1000);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="register-page">
      {/* Animated Background Particles */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Language Switcher */}
      <div className="language-switcher">
        <button
          className={`btn ${i18n.language === 'vi' ? 'active' : ''}`}
          onClick={() => changeLanguage('vi')}
        >
          🇻🇳 VI
        </button>
        <button
          className={`btn ${i18n.language === 'en' ? 'active' : ''}`}
          onClick={() => changeLanguage('en')}
        >
          🇬🇧 EN
        </button>
      </div>

      <div className="container-fluid">
        <div className="row">
          {/* Left Side - Brand & Features */}
          <div className="col-lg-6 register-left">
            <div className="brand-section">
              <div className="brand-logo-simple" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
                <img src="/images/logo.jpg" alt="APEX EV Logo" className="auth-logo-img" style={{ height: '150px', width: 'auto', maxWidth: '300px', borderRadius: '40px' }} />
              </div>
              <p className="brand-subtitle">
                Tham gia cộng đồng chủ xe điện thông minh
              </p>

              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon">
                    <FiZap />
                  </div>
                  <div className="feature-text">
                    <h4>Đăng ký nhanh chóng</h4>
                    <p>Chỉ mất 2 phút để tạo tài khoản</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <FiShield />
                  </div>
                  <div className="feature-text">
                    <h4>An toàn & bảo mật</h4>
                    <p>Dữ liệu được mã hóa và bảo vệ tuyệt đối</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <FiClock />
                  </div>
                  <div className="feature-text">
                    <h4>Theo dõi real-time</h4>
                    <p>Cập nhật tiến độ bảo dưỡng liên tục</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <FiTrendingUp />
                  </div>
                  <div className="feature-text">
                    <h4>Báo cáo chi tiết</h4>
                    <p>Thống kê và phân tích chi phí bảo dưỡng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="col-lg-6 register-right">
            <div className="register-form-container">
              {!success ? (
                <>
                  <div className="register-form-header">
                    <h2>Đăng ký tài khoản</h2>
                    <p>Tạo tài khoản để bắt đầu sử dụng dịch vụ</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <div className="input-with-icon">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label>Email *</label>
                  <div className="input-with-icon">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Nhập email"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <div className="input-with-icon">
                    <FiPhone className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label>Mật khẩu *</label>
                  <div className="input-with-icon">
                    <FiLock className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label>Xác nhận mật khẩu *</label>
                  <div className="input-with-icon">
                    <FiLock className="input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Nhập lại mật khẩu"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <label htmlFor="agreeTerms">
                    Tôi đồng ý với{' '}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      Điều khoản dịch vụ
                    </a>
                  </label>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  className={`btn-register ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký</span>
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">Hoặc đăng ký với</span>
                <div className="divider-line"></div>
              </div>

              {/* Social Register */}
              <div className="social-register">
                <button
                  type="button"
                  className="btn-social google-btn"
                  onClick={() => handleSocialRegister('google')}
                >
                  <FaGoogle />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  className="btn-social facebook-btn"
                  onClick={() => handleSocialRegister('facebook')}
                >
                  <FaFacebook />
                  <span>Facebook</span>
                </button>
              </div>

              {/* Login Link */}
              <div className="login-link">
                Đã có tài khoản?{' '}
                <Link to={ROUTES.LOGIN}>Đăng nhập ngay</Link>
              </div>
                </>
              ) : (
                <div className="success-message-container">
                  <div className="success-icon-large">
                    <FiCheckCircle />
                  </div>
                  <h2 className="success-title">Đăng ký thành công!</h2>
                  <p className="success-description">
                    Chúc mừng! Tài khoản của bạn đã được tạo thành công. 
                    Bây giờ bạn có thể đăng nhập để bắt đầu sử dụng dịch vụ của chúng tôi.
                  </p>
                  <Link to={ROUTES.LOGIN} className="btn-go-login-modern">
                    <span>Chuyển đến trang đăng nhập</span>
                    <FiArrowRight />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPageModern;

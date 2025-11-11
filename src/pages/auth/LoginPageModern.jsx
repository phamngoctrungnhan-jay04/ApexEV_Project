import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from 'react-i18next';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiZap, 
  FiShield, 
  FiClock, 
  FiTrendingUp,
  FiArrowRight 
} from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import './LoginPage-Modern.css';

const LoginPageModern = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        role: 'customer',
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
          <div className="col-lg-6 login-left">
            <div className="brand-section">
              <div className="brand-logo-large">
                <FiZap />
              </div>
              <h1 className="brand-title">APEX EV</h1>
              <p className="brand-subtitle">
                {t('auth.loginSubtitle') || 'Hệ thống quản lý bảo dưỡng xe điện chuyên nghiệp'}
              </p>

              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon">
                    <FiZap />
                  </div>
                  <div className="feature-text">
                    <h4>Đặt lịch nhanh chóng</h4>
                    <p>Đặt lịch bảo dưỡng chỉ trong 2 phút</p>
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
                    <p>Thống kê chi phí và lịch sử bảo dưỡng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="col-lg-6 login-right">
            <div className="login-form-container">
              <div className="login-form-header">
                <h2>{t('auth.loginTitle') || 'Đăng nhập'}</h2>
                <p>{t('auth.loginSubtitle') || 'Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.'}</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form className="login-form" onSubmit={handleSubmit}>
                {/* Email Input */}
                <div className="mb-3">
                  <label className="form-label">
                    {t('auth.email') || 'Email'}
                  </label>
                  <div className="input-group">
                    <span className="input-icon">
                      <FiMail />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder={t('auth.emailPlaceholder') || 'your.email@example.com'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="mb-3">
                  <label className="form-label">
                    {t('auth.password') || 'Mật khẩu'}
                  </label>
                  <div className="input-group">
                    <span className="input-icon">
                      <FiLock />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder={t('auth.passwordPlaceholder') || 'Nhập mật khẩu của bạn'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Remember Me & Forgot Password */}
                <div className="form-options">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      {t('auth.rememberMe') || 'Ghi nhớ đăng nhập'}
                    </label>
                  </div>
                  <Link to="/forgot-password" className="forgot-password">
                    {t('auth.forgotPassword') || 'Quên mật khẩu?'}
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className={`btn-login ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>{t('common.loading') || 'Đang xử lý...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('auth.loginButton') || 'Đăng nhập'}</span>
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">{t('auth.orLoginWith') || 'Hoặc đăng nhập với'}</span>
                <div className="divider-line"></div>
              </div>

              {/* Social Login */}
              <div className="social-login">
                <button
                  type="button"
                  className="btn-social google-btn"
                  onClick={() => handleSocialLogin('google')}
                >
                  <FaGoogle />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  className="btn-social facebook-btn"
                  onClick={() => handleSocialLogin('facebook')}
                >
                  <FaFacebook />
                  <span>Facebook</span>
                </button>
              </div>

              {/* Register Link */}
              <div className="register-link">
                {t('auth.noAccount') || 'Chưa có tài khoản?'}{' '}
                <Link to={ROUTES.REGISTER}>
                  {t('auth.signUpNow') || 'Đăng ký ngay'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPageModern;

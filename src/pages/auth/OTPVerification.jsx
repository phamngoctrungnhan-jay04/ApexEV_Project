import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiShield, FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import authService from '../../services/authService';
import './OTPVerification.css';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  useEffect(() => {
    // Countdown for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all filled
    if (value && index === 3 && newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 4).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 4) newOtp[i] = digit;
        });
        setOtp(newOtp);
        if (digits.length === 4) {
          inputRefs[3].current?.focus();
          handleVerify(newOtp.join(''));
        }
      });
    }
  };

  const handleVerify = async (otpCode) => {
    if (otpCode.length !== 4) {
      setError('Vui lòng nhập đủ 4 số OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyOTP({ email, otp: otpCode });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Đăng ký thành công! Vui lòng đăng nhập.' 
          } 
        });
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Mã OTP không đúng. Vui lòng thử lại!');
      // Clear OTP on error
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError('');

    try {
      await authService.resendOTP({ email });
      setResendCooldown(60); // 60 seconds cooldown
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify(otp.join(''));
  };

  if (!email) {
    navigate('/register');
    return null;
  }

  return (
    <div className="otp-verification-page">
      {/* Background Effects */}
      <div className="otp-background">
        <div className="otp-gradient-orb otp-orb-1"></div>
        <div className="otp-gradient-orb otp-orb-2"></div>
        <div className="otp-gradient-orb otp-orb-3"></div>
      </div>

      <div className="otp-container">
        {/* Back Button */}
        <button className="otp-back-btn" onClick={() => navigate('/register')}>
          <FiArrowLeft /> Quay lại
        </button>

        {/* Logo */}
        <div className="otp-logo">
          <img src="/images/logo.jpg" alt="APEX EV Logo" style={{ height: '85px', width: 'auto', maxWidth: '180px', borderRadius: '10px' }} />
        </div>

        {/* Main Card */}
        <div className="otp-card">
          {success ? (
            // Success State
            <div className="otp-success">
              <div className="success-icon">
                <FiCheckCircle />
              </div>
              <h2>Xác thực thành công!</h2>
              <p>Tài khoản của bạn đã được kích hoạt.</p>
              <p className="redirect-text">Đang chuyển đến trang đăng nhập...</p>
            </div>
          ) : (
            // OTP Form
            <>
              <div className="otp-header">
                <div className="otp-icon">
                  <FiShield />
                </div>
                <h1>Xác thực tài khoản</h1>
                <p className="otp-subtitle">
                  Chúng tôi đã gửi mã OTP gồm 4 số đến email
                </p>
                <p className="otp-email">
                  <FiMail /> {email}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="otp-form">
                <div className="otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`otp-input ${error ? 'error' : ''} ${digit ? 'filled' : ''}`}
                      disabled={loading || success}
                    />
                  ))}
                </div>

                {error && (
                  <div className="otp-error">
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="otp-verify-btn"
                  disabled={loading || otp.some(digit => digit === '')}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Đang xác thực...
                    </>
                  ) : (
                    'Xác nhận'
                  )}
                </button>

                <div className="otp-resend">
                  <span>Không nhận được mã?</span>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || loading}
                    className="resend-btn"
                  >
                    {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Helper Text */}
        <div className="otp-helper">
          <p>💡 Mã OTP có hiệu lực trong 5 phút</p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;

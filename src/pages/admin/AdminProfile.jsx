// File: src/pages/admin/AdminProfile.jsx
// Trang hồ sơ quản trị tuân thủ APEX Modern UI

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiRefreshCcw,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiUsers,
  FiDatabase,
  FiEdit3,
  FiActivity,
  FiChevronDown
} from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';
import CustomAlert from '../../components/common/CustomAlert';
import Loading from '../../components/common/Loading';
import { getProfile, updateProfile } from '../../services/profileService';
import { ROUTES } from '../../constants/routes';
import './AdminProfile.css';

const parseDateParts = (dateString) => {
  if (!dateString) {
    return { year: '', month: '', day: '' };
  }
  const [year = '', month = '', day = ''] = dateString.split('-');
  return {
    year,
    month,
    day
  };
};

const DateDropdown = ({ placeholder, value, options, onSelect }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedLabel = value
    ? options.find((option) => option.value === value)?.label || value
    : placeholder;

  const handleSelect = (optionValue) => {
    onSelect(optionValue);
    setOpen(false);
  };

  return (
    <div className={`date-dropdown ${open ? 'open' : ''}`} ref={dropdownRef}>
      <button type="button" className="date-pill" onClick={() => setOpen((prev) => !prev)}>
        <span>{selectedLabel}</span>
        <FiChevronDown />
      </button>
      {open && (
        <ul className="date-menu">
          {options.map((option) => (
            <li
              key={option.value}
              className={`date-menu-item ${option.value === value ? 'active' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' }
];

const ROLE_LABEL = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  SERVICE_ADVISOR: 'Cố vấn dịch vụ',
  TECHNICIAN: 'Kỹ thuật viên',
  CUSTOMER: 'Khách hàng'
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-()\s]{9,15}$/;

const AdminProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'OTHER'
  });
  const [dateParts, setDateParts] = useState({ year: '', month: '', day: '' });
  const [originalForm, setOriginalForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertState, setAlertState] = useState({ show: false, type: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const formSectionRef = useRef(null);

  useEffect(() => {
    fetchProfile(true);
  }, []);

  const normalizeProfile = (data) => {
    const normalizedGender = (data?.gender || 'OTHER').toString().toUpperCase();
    return {
      fullName: data?.fullName || data?.name || '',
      email: data?.email || '',
      phone: data?.phone || '',
      address: data?.address || '',
      dateOfBirth: data?.dateOfBirth ? data.dateOfBirth.substring(0, 10) : '',
      gender: ['MALE', 'FEMALE', 'OTHER'].includes(normalizedGender) ? normalizedGender : 'OTHER'
    };
  };

  const fetchProfile = async (withSkeleton = false, retryCount = 0) => {
    if (withSkeleton) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const response = await getProfile();
      setProfile(response);
      const normalized = normalizeProfile(response);
      setFormData(normalized);
      setDateParts(parseDateParts(normalized.dateOfBirth));
      setOriginalForm({ ...normalized });
    } catch (error) {
      console.error('getProfile error', error);
      
      // Nếu lỗi 500 và chưa retry, thử lại 1 lần sau 1 giây
      if (error.response?.status === 500 && retryCount < 1) {
        console.log('Retrying getProfile after 500 error...');
        setTimeout(() => {
          fetchProfile(withSkeleton, retryCount + 1);
        }, 1000);
        return;
      }
      
      // Kiểm tra lỗi 401/403 để redirect về login
      if (error.response?.status === 401 || error.response?.status === 403) {
        showAlert('danger', 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        // Có thể redirect về login page
        // navigate('/login');
      } else if (error.response?.status === 500) {
        showAlert('danger', 'Lỗi server. Vui lòng đăng xuất và đăng nhập lại.');
      } else {
        showAlert('danger', 'Không thể tải hồ sơ quản trị. Vui lòng thử lại.');
      }
    } finally {
      if (withSkeleton) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const showAlert = (type, message) => {
    setAlertState({ show: true, type, message });
    setTimeout(() => setAlertState((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => {
      if (!prev[name]) return prev;
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Họ và tên không được bỏ trống';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email bắt buộc nhập';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = 'Email không hợp lệ';
    }
    if (formData.phone && !PHONE_REGEX.test(formData.phone.trim())) {
      errors.phone = 'Số điện thoại chỉ gồm số và ký tự + - ( )';
    }
    if (formData.address && formData.address.trim().length < 6) {
      errors.address = 'Địa chỉ cần ít nhất 6 ký tự';
    }
    return errors;
  }, [formData]);

  const handleScrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isDirty || saving) {
      return;
    }
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      showAlert('danger', 'Vui lòng kiểm tra lại các trường bắt buộc.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender
      };
      await updateProfile(payload);
      setOriginalForm({ ...formData });
      setProfile((prev) => ({ ...prev, ...payload }));
      setFormErrors({});
      showAlert('success', 'Đã lưu thông tin cá nhân!');
    } catch (error) {
      console.error('updateProfile error', error);
      showAlert('danger', 'Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '---';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '---';
    }
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const accountInitial = useMemo(() => {
    if (!formData.fullName) return 'A';
    // Chỉ lấy chữ cái đầu tiên của tên
    const nameParts = formData.fullName.trim().split(' ').filter(Boolean);
    if (nameParts.length === 0) return 'A';
    // Lấy chữ cái đầu của phần tên cuối cùng (tên gọi)
    return nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  }, [formData.fullName]);

  const roleLabel = useMemo(() => {
    if (!profile?.role) return '---';
    return ROLE_LABEL[profile.role] || profile.role;
  }, [profile]);

  const statusLabel = profile?.isActive ? 'Đang hoạt động' : 'Đã khóa';

  const isDirty = useMemo(() => {
    if (!originalForm) return false;
    return Object.keys(originalForm).some((key) => (formData[key] || '') !== (originalForm[key] || ''));
  }, [formData, originalForm]);

  const dayOptions = useMemo(
    () => Array.from({ length: 31 }, (_, index) => {
      const label = (index + 1).toString().padStart(2, '0');
      return { value: label, label };
    }),
    []
  );

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const value = (index + 1).toString().padStart(2, '0');
        return { value, label: `Th${index + 1}` };
      }),
    []
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 80 }, (_, index) => {
      const year = (currentYear - index).toString();
      return { value: year, label: year };
    });
  }, []);

  const formatDateValue = ({ year, month, day }) => {
    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  const updateDatePart = (part, value) => {
    setDateParts((prev) => {
      const nextState = {
        ...prev,
        [part]: value
      };
      setFormData((prevForm) => ({
        ...prevForm,
        dateOfBirth: formatDateValue(nextState)
      }));
      return nextState;
    });
  };

  // Chỉ hiển thị summary cards nếu BE trả về statistics
  const summaryCards = useMemo(() => {
    // Chỉ lấy data từ BE, không tạo mock data
    if (!profile?.statistics) return [];
    
    const stats = profile.statistics;
    const cards = [];
    
    // Chỉ thêm card nếu BE có trả về giá trị
    if (stats.activeSessions !== undefined && stats.activeSessions !== null) {
      cards.push({
        label: 'Phiên hoạt động',
        value: stats.activeSessions,
        note: 'Đang đăng nhập',
        accent: 'sky',
        icon: <FiClock />
      });
    }
    
    if (stats.managedAccounts !== undefined && stats.managedAccounts !== null) {
      cards.push({
        label: 'Nhân sự quản lý',
        value: stats.managedAccounts,
        note: 'Tài khoản',
        accent: 'violet',
        icon: <FiUsers />
      });
    }
    
    if (stats.pendingRequests !== undefined && stats.pendingRequests !== null) {
      cards.push({
        label: 'Yêu cầu dịch vụ',
        value: stats.pendingRequests,
        note: 'Chờ xử lý',
        accent: 'mint',
        icon: <FiDatabase />
      });
    }
    
    if (stats.trustScore !== undefined && stats.trustScore !== null) {
      cards.push({
        label: 'Mức độ tin cậy',
        value: `${stats.trustScore}%`,
        note: 'Đánh giá hệ thống',
        accent: 'amber',
        icon: <FiTrendingUp />
      });
    }
    
    return cards;
  }, [profile]);

  const contactInsights = useMemo(() => {
    const baseInsights = [
      {
        label: 'Email hệ thống',
        value: formData.email || '---',
        icon: <FiMail />
      },
      {
        label: 'Số liên hệ',
        value: formData.phone || '---',
        icon: <FiPhone />
      },
      {
        label: 'Địa chỉ',
        value: formData.address || '---',
        icon: <FiMapPin />
      }
    ];

    return baseInsights.map((item) => {
      const isAvailable = item.value && item.value !== '---';
      return {
        ...item,
        value: isAvailable ? item.value : 'Chưa cập nhật',
        isPlaceholder: !isAvailable
      };
    });
  }, [formData, profile]);

  const highlightChips = useMemo(() => [
    {
      icon: <FiActivity />,
      label: 'Trạng thái',
      value: statusLabel,
      variant: profile?.isActive ? 'success' : 'warning'
    },
    {
      icon: <FiShield />,
      label: 'Vai trò',
      value: roleLabel,
      variant: 'default'
    },
    {
      icon: <FiCalendar />,
      label: 'Ngày sinh',
      value: formData.dateOfBirth ? formatDate(formData.dateOfBirth) : 'Chưa cập nhật',
      variant: 'default'
    }
  ], [profile, roleLabel, statusLabel, formData.dateOfBirth]);

  const responsibilityItems = [
    'Quản lý toàn bộ hệ thống APEX EV và cơ sở dữ liệu',
    'Phân quyền, tạo và duyệt tài khoản nhân viên',
    'Giám sát quy trình đặt lịch và bảo dưỡng xe',
    'Xử lý khiếu nại và yêu cầu hỗ trợ từ khách hàng',
    'Tối ưu hóa vận hành và báo cáo doanh thu'
  ];

  const handleSupportAction = (route) => {
    if (route) {
      navigate(route);
    }
  };

  const supportActions = [
    {
      icon: <FiUsers />,
      title: 'Quản lý tài khoản',
      note: 'Xem danh sách tài khoản',
      variant: 'primary',
      disabled: false,
      route: ROUTES.ADMIN.REGISTER_USER
    },
    {
      icon: <FiDatabase />,
      title: 'Quản lý dịch vụ',
      note: 'Cấu hình dịch vụ & giá',
      variant: 'ghost',
      disabled: false,
      route: ROUTES.ADMIN.SERVICES
    },
    {
      icon: <FiTrendingUp />,
      title: 'Báo cáo thống kê',
      note: 'Xem dashboard tổng quan',
      variant: 'outline',
      disabled: false,
      route: ROUTES.ADMIN.DASHBOARD
    }
  ];

  const trustCard = useMemo(
    () => summaryCards.find((card) => card.label === 'Mức độ tin cậy'),
    [summaryCards]
  );



  // Chỉ lấy activity từ BE, không mock
  const activityFeed = useMemo(() => {
    // Trả về mảng rỗng nếu BE không có data
    if (!profile?.recentActivities || !Array.isArray(profile.recentActivities)) {
      return [];
    }
    
    // Map data từ BE sang format hiển thị
    return profile.recentActivities.map((item) => ({
      title: item.title || 'Hoạt động hệ thống',
      time: item.time || item.timestamp || item.createdAt || 'Chưa rõ thời gian',
      detail: item.detail || item.description || item.message || ''
    }));
  }, [profile]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-profile-loading">
          <Loading />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <section className="admin-profile-page">
        <div className="profile-page-container">
        <div className="profile-hero">
          <div className="hero-gradient"></div>
          <div className="hero-pattern layer-one"></div>
          <div className="hero-pattern layer-two"></div>
          <div className="hero-content">
            <div className="hero-main">
              <div className="hero-header">
                <div className="avatar-wrapper">
                  <div className="avatar-glow"></div>
                  <div className="avatar-circle">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="avatar-image" />
                    ) : (
                      <span className="avatar-text">{accountInitial}</span>
                    )}
                  </div>
                  <div className="status-indicator">
                    <span className={`pulse-dot ${profile?.isActive ? 'active' : 'inactive'}`}></span>
                  </div>
                </div>
                <div className="hero-info">
                  <p className="hero-pretitle">Hồ sơ quản trị viên</p>
                  <h1 className="hero-name">{formData.fullName || '---'}</h1>
                  <p className="hero-role">{roleLabel}</p>
                  <div className="hero-badges">
                    <span className={`badge-status ${profile?.isActive ? 'active' : 'inactive'}`}>
                      <FiCheckCircle /> {statusLabel}
                    </span>
                    {trustCard && (
                      <span className="badge-status neutral">
                        <FiShield />
                        {trustCard.value}
                      </span>
                    )}
                  </div>
                  <div className="hero-actions">
                    <button type="button" className="hero-btn" onClick={handleScrollToForm}>
                      <FiEdit3 /> Chỉnh sửa thông tin
                    </button>
                  </div>
                </div>
              </div>
              <div className="hero-widgets">
                {contactInsights.map((insight) => (
                  <div key={insight.label} className={`hero-widget ${insight.isPlaceholder ? 'muted' : ''}`}>
                    <div className="widget-icon">{insight.icon}</div>
                    <div>
                      <p className="widget-label">{insight.label}</p>
                      <p className="widget-value">{insight.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {summaryCards.length > 0 && (
          <section className="profile-insights">
            {summaryCards.map((card) => (
              <article key={card.label} className={`insight-card ${card.accent}`}>
                <div className="insight-icon">{card.icon}</div>
                <div className="insight-info">
                  <p className="insight-label">{card.label}</p>
                  <p className="insight-value">{card.value}</p>
                  <span className="insight-note">{card.note}</span>
                </div>
              </article>
            ))}
          </section>
        )}

        {alertState.show && (
          <CustomAlert
            variant={alertState.type}
            floating
            dismissible
            onClose={() => setAlertState((prev) => ({ ...prev, show: false }))}
          >
            {alertState.message}
          </CustomAlert>
        )}

        <section className="profile-highlight-row">
          {highlightChips.map((chip) => (
            <div key={chip.label} className={`highlight-chip ${chip.variant}`}>
              <div className="chip-icon">{chip.icon}</div>
              <div>
                <p className="chip-label">{chip.label}</p>
                <p className="chip-value">{chip.value}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="profile-overview">
          <article className="overview-card">
            <div className="overview-header">
              <div>
                <p className="overview-eyebrow">Chức năng</p>
                <h3>Trách nhiệm chính</h3>
              </div>
            </div>
            <ul className="responsibility-list">
              {responsibilityItems.map((item, index) => (
                <li key={index}>
                  <span></span>
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="overview-card">
            <div className="overview-header">
              <div>
                <p className="overview-eyebrow">Truy cập nhanh</p>
                <h3>Hỗ trợ vận hành</h3>
              </div>
            </div>
            <div className="support-actions">
              {supportActions.map((action, index) => (
                <button
                  key={index}
                  className={`support-btn ${action.variant}`}
                  disabled={action.disabled}
                  type="button"
                  onClick={() => handleSupportAction(action.route)}
                >
                  <div className="support-icon">{action.icon}</div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div>{action.title}</div>
                    <small>{action.note}</small>
                  </div>
                </button>
              ))}
            </div>
            <p className="support-note">
              Các chức năng này sẽ chuyển hướng đến trang quản lý tương ứng.
            </p>
          </article>
        </section>

        <div className="profile-container">
          <div className="profile-grid">
            <aside className="profile-sidebar">
              <article className="glass-card info-card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Thông tin tài khoản</h3>
                    <p className="card-subtitle">Đồng bộ trực tiếp với hệ thống định danh APEX.</p>
                  </div>
                </div>
                <ul className="info-list">
                  <li className="info-item">
                    <div className="info-icon">
                      <FiShield />
                    </div>
                    <div className="info-content">
                      <p className="info-label">Phân quyền</p>
                      <span className="info-value">{roleLabel}</span>
                    </div>
                  </li>
                  <li className="info-item">
                    <div className="info-icon">
                      <FiMail />
                    </div>
                    <div className="info-content">
                      <p className="info-label">Email đăng nhập</p>
                      <span className="info-value">{formData.email || '---'}</span>
                    </div>
                  </li>
                  <li className="info-item">
                    <div className="info-icon">
                      <FiPhone />
                    </div>
                    <div className="info-content">
                      <p className="info-label">Hotline nội bộ</p>
                      <span className="info-value">{formData.phone || '---'}</span>
                    </div>
                  </li>
                </ul>
              </article>
            </aside>

            <main className="profile-main">
              <article className="glass-card form-card" ref={formSectionRef}>
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Thông tin cá nhân</h3>
                    <p className="card-subtitle">Cập nhật thông tin liên hệ để đội ngũ kỹ thuật liên lạc nhanh hơn.</p>
                  </div>
                </div>
                
                <form className="modern-form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="fullName" className="form-label">
                        <FiUser className="label-icon" />
                        Họ và tên
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        className="form-input"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Nguyễn Văn A"
                      />
                      {formErrors.fullName && <p className="input-error">{formErrors.fullName}</p>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        <FiMail className="label-icon" />
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-input"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="admin@apex-ev.com"
                      />
                      {formErrors.email && <p className="input-error">{formErrors.email}</p>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        <FiPhone className="label-icon" />
                        Số điện thoại
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        className="form-input"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0909 000 000"
                      />
                      {formErrors.phone && <p className="input-error">{formErrors.phone}</p>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="dateOfBirth" className="form-label">
                        <FiCalendar className="label-icon" />
                        Ngày sinh
                      </label>
                      <div className="date-picker-custom">
                        <DateDropdown
                          placeholder="Ngày"
                          value={dateParts.day}
                          options={dayOptions}
                          onSelect={(val) => updateDatePart('day', val)}
                        />
                        <span className="date-separator">/</span>
                        <DateDropdown
                          placeholder="Tháng"
                          value={dateParts.month}
                          options={monthOptions}
                          onSelect={(val) => updateDatePart('month', val)}
                        />
                        <span className="date-separator">/</span>
                        <DateDropdown
                          placeholder="Năm"
                          value={dateParts.year}
                          options={yearOptions}
                          onSelect={(val) => updateDatePart('year', val)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="gender" className="form-label">
                        <FiUser className="label-icon" />
                        Giới tính
                      </label>
                      <select id="gender" name="gender" className="form-select" value={formData.gender} onChange={handleInputChange}>
                        {GENDER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="address" className="form-label">
                        <FiMapPin className="label-icon" />
                        Địa chỉ
                      </label>
                      <input
                        id="address"
                        name="address"
                        className="form-input"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Số nhà, đường, quận, thành phố"
                      />
                      {formErrors.address && <p className="input-error">{formErrors.address}</p>}
                    </div>
                  </div>

                  <div className="form-footer">
                    <button type="submit" className="btn-gradient" disabled={!isDirty || saving}>
                      {saving ? (
                        <>
                          <span className="spinner"></span>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle />
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </article>
            </main>
          </div>
        </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminProfile;

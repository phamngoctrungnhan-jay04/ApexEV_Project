// File: src/pages/customer/CustomerProfile.jsx
// Trang hồ sơ khách hàng tuân thủ APEX Modern UI

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiEdit3,
  FiActivity,
  FiChevronDown,
  FiMessageSquare,
  FiPlus,
  FiTrash2,
  FiFileText,
  FiStar
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import CustomAlert from '../../components/common/CustomAlert';
import Loading from '../../components/common/Loading';
import { getProfile, updateProfile, getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../services/profileService';
import { ROUTES } from '../../constants/routes';
import './CustomerProfile.css';

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-()\s]{9,15}$/;

const CustomerProfile = () => {
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

  // Vehicles state
  const [vehicles, setVehicles] = useState([]);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    brand: '',
    model: '',
    yearManufactured: new Date().getFullYear(),
    licensePlate: '',
    vinNumber: '',
    color: ''
  });
  const [vehicleErrors, setVehicleErrors] = useState({});
  const [savingVehicle, setSavingVehicle] = useState(false);

  useEffect(() => {
    fetchProfile(true);
    fetchVehicles();
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
      
      if (error.response?.status === 500 && retryCount < 1) {
        console.log('Retrying getProfile after 500 error...');
        setTimeout(() => {
          fetchProfile(withSkeleton, retryCount + 1);
        }, 1000);
        return;
      }
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        showAlert('danger', 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 500) {
        showAlert('danger', 'Lỗi server. Vui lòng đăng xuất và đăng nhập lại.');
      } else {
        showAlert('danger', 'Không thể tải hồ sơ. Vui lòng thử lại.');
      }
    } finally {
      if (withSkeleton) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const fetchVehicles = async () => {
    try {
      const vehiclesList = await getVehicles();
      setVehicles(Array.isArray(vehiclesList) ? vehiclesList : []);
    } catch (error) {
      console.error('getVehicles error', error);
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

  // Vehicle handlers
  const handleOpenVehicleModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleFormData({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        yearManufactured: vehicle.yearManufactured || new Date().getFullYear(),
        licensePlate: vehicle.licensePlate || '',
        vinNumber: vehicle.vinNumber || '',
        color: vehicle.color || ''
      });
    } else {
      setEditingVehicle(null);
      setVehicleFormData({
        brand: '',
        model: '',
        yearManufactured: new Date().getFullYear(),
        licensePlate: '',
        vinNumber: '',
        color: ''
      });
    }
    setVehicleErrors({});
    setShowVehicleModal(true);
  };

  const handleCloseVehicleModal = () => {
    setShowVehicleModal(false);
    setEditingVehicle(null);
    setVehicleErrors({});
  };

  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleFormData(prev => ({ ...prev, [name]: value }));
    setVehicleErrors(prev => {
      if (!prev[name]) return prev;
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const validateVehicleForm = () => {
    const errors = {};
    if (!vehicleFormData.brand.trim()) {
      errors.brand = 'Hãng xe không được bỏ trống';
    }
    if (!vehicleFormData.model.trim()) {
      errors.model = 'Model xe không được bỏ trống';
    }
    if (!vehicleFormData.licensePlate.trim()) {
      errors.licensePlate = 'Biển số xe không được bỏ trống';
    }
    return errors;
  };

  const handleSaveVehicle = async () => {
    const errors = validateVehicleForm();
    setVehicleErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSavingVehicle(true);
    try {
      if (editingVehicle) {
        const updatedVehicle = await updateVehicle(editingVehicle.id, vehicleFormData);
        setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? updatedVehicle : v));
        showAlert('success', 'Cập nhật xe thành công!');
      } else {
        const newVehicle = await createVehicle(vehicleFormData);
        setVehicles(prev => [...prev, newVehicle]);
        showAlert('success', 'Thêm xe mới thành công!');
      }
      handleCloseVehicleModal();
    } catch (error) {
      console.error('Save vehicle error', error);
      showAlert('danger', editingVehicle ? 'Lỗi cập nhật xe!' : 'Lỗi thêm xe!');
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Bạn có chắc muốn xóa xe này?')) {
      return;
    }
    try {
      await deleteVehicle(vehicleId);
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      showAlert('success', 'Đã xóa xe!');
    } catch (error) {
      console.error('Delete vehicle error', error);
      showAlert('danger', 'Lỗi xóa xe!');
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
    if (!formData.fullName) return 'K';
    const nameParts = formData.fullName.trim().split(' ').filter(Boolean);
    if (nameParts.length === 0) return 'K';
    return nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  }, [formData.fullName]);

  const statusLabel = profile?.isActive !== false ? 'Đang hoạt động' : 'Đã khóa';

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

  const yearManufacturedOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 30 }, (_, index) => {
      const year = (currentYear - index + 1).toString();
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

  // Summary cards for customer statistics
  const summaryCards = useMemo(() => {
    const cards = [
      {
        label: 'Xe đã đăng ký',
        value: vehicles.length,
        note: 'Phương tiện của bạn',
        accent: 'sky',
        icon: <FaCar />
      }
    ];

    if (profile?.statistics) {
      const stats = profile.statistics;
      
      if (stats.totalBookings !== undefined) {
        cards.push({
          label: 'Lịch hẹn',
          value: stats.totalBookings,
          note: 'Tổng lượt đặt lịch',
          accent: 'violet',
          icon: <FiClock />
        });
      }
      
      if (stats.completedServices !== undefined) {
        cards.push({
          label: 'Dịch vụ hoàn thành',
          value: stats.completedServices,
          note: 'Đã bảo dưỡng',
          accent: 'mint',
          icon: <FiCheckCircle />
        });
      }
      
      if (stats.loyaltyPoints !== undefined) {
        cards.push({
          label: 'Điểm tích lũy',
          value: stats.loyaltyPoints,
          note: 'Điểm thưởng',
          accent: 'amber',
          icon: <FiTrendingUp />
        });
      }
    }
    
    return cards;
  }, [profile, vehicles]);

  const contactInsights = useMemo(() => {
    const baseInsights = [
      {
        label: 'Email liên hệ',
        value: formData.email || '---',
        icon: <FiMail />
      },
      {
        label: 'Số điện thoại',
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
  }, [formData]);

  const highlightChips = useMemo(() => [
    {
      icon: <FiActivity />,
      label: 'Trạng thái',
      value: statusLabel,
      variant: profile?.isActive !== false ? 'success' : 'warning'
    },
    {
      icon: <FiShield />,
      label: 'Vai trò',
      value: 'Khách hàng',
      variant: 'default'
    },
    {
      icon: <FiCalendar />,
      label: 'Ngày sinh',
      value: formData.dateOfBirth ? formatDate(formData.dateOfBirth) : 'Chưa cập nhật',
      variant: 'default'
    }
  ], [profile, statusLabel, formData.dateOfBirth]);

  const handleSupportAction = (route) => {
    if (route) {
      navigate(route);
    }
  };

  const supportActions = [
    {
      icon: <FiCalendar />,
      title: 'Đặt lịch bảo dưỡng',
      note: 'Đặt lịch dịch vụ mới',
      variant: 'primary',
      disabled: false,
      route: ROUTES.CUSTOMER.BOOKING
    },
    {
      icon: <FiFileText />,
      title: 'Lịch sử dịch vụ',
      note: 'Xem các lần bảo dưỡng',
      variant: 'ghost',
      disabled: false,
      route: ROUTES.CUSTOMER.HISTORY
    },
    {
      icon: <FiStar />,
      title: 'Đánh giá',
      note: 'Đánh giá dịch vụ',
      variant: 'outline',
      disabled: false,
      route: ROUTES.CUSTOMER.RATINGS
    }
  ];

  if (loading) {
    return (
      <div className="customer-profile-loading">
        <Loading />
      </div>
    );
  }

  return (
    <section className="customer-profile-page">
        {/* Hero Section */}
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
                    <span className={`pulse-dot ${profile?.isActive !== false ? 'active' : 'inactive'}`}></span>
                  </div>
                </div>
                <div className="hero-info">
                  <p className="hero-pretitle">Hồ sơ khách hàng</p>
                  <h1 className="hero-name">{formData.fullName || '---'}</h1>
                  <p className="hero-role">Khách hàng APEX EV</p>
                  <div className="hero-badges">
                    <span className={`badge-status ${profile?.isActive !== false ? 'active' : 'inactive'}`}>
                      <FiCheckCircle /> {statusLabel}
                    </span>
                    {vehicles.length > 0 && (
                      <span className="badge-status neutral">
                        <FaCar />
                        {vehicles.length} xe đã đăng ký
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

        {/* Statistics Cards */}
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

        {/* Alert */}
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

        {/* Highlight Chips */}
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

        {/* Overview Section */}
        <section className="profile-overview">
          {/* Vehicle List Card */}
          <article className="overview-card vehicle-card">
            <div className="overview-header">
              <div>
                <p className="overview-eyebrow">Phương tiện</p>
                <h3>Danh sách xe ({vehicles.length})</h3>
              </div>
              <button 
                type="button" 
                className="add-vehicle-btn"
                onClick={() => handleOpenVehicleModal()}
              >
                <FiPlus />
                Thêm xe
              </button>
            </div>
            {vehicles.length === 0 ? (
              <div className="empty-vehicles">
                <FaCar className="empty-icon" />
                <p>Chưa có xe nào. Thêm xe đầu tiên của bạn!</p>
              </div>
            ) : (
              <ul className="vehicle-list">
                {vehicles.map((vehicle) => (
                  <li key={vehicle.id} className="vehicle-item">
                    <div className="vehicle-icon">
                      <FaCar />
                    </div>
                    <div className="vehicle-info">
                      <p className="vehicle-name">{vehicle.brand} {vehicle.model}</p>
                      <div className="vehicle-details">
                        <span className="vehicle-plate">{vehicle.licensePlate}</span>
                        <span className="vehicle-year">{vehicle.yearManufactured}</span>
                        {vehicle.color && <span className="vehicle-color">{vehicle.color}</span>}
                      </div>
                    </div>
                    <div className="vehicle-actions">
                      <button 
                        type="button" 
                        className="vehicle-action-btn edit"
                        onClick={() => handleOpenVehicleModal(vehicle)}
                      >
                        <FiEdit3 />
                      </button>
                      <button 
                        type="button" 
                        className="vehicle-action-btn delete"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          {/* Quick Actions Card */}
          <article className="overview-card">
            <div className="overview-header">
              <div>
                <p className="overview-eyebrow">Truy cập nhanh</p>
                <h3>Tiện ích</h3>
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

        {/* Profile Form Section */}
        <div className="profile-container">
          <div className="profile-grid">
            <aside className="profile-sidebar">
              <article className="glass-card info-card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Thông tin tài khoản</h3>
                    <p className="card-subtitle">Thông tin đăng nhập hệ thống APEX EV.</p>
                  </div>
                </div>
                <ul className="info-list">
                  <li className="info-item">
                    <div className="info-icon">
                      <FiShield />
                    </div>
                    <div className="info-content">
                      <p className="info-label">Phân quyền</p>
                      <span className="info-value">Khách hàng</span>
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
                      <p className="info-label">Số điện thoại</p>
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
                    <p className="card-subtitle">Cập nhật thông tin liên hệ để chúng tôi phục vụ bạn tốt hơn.</p>
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
                        placeholder="customer@example.com"
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

        {/* Vehicle Modal */}
        {showVehicleModal && (
          <div className="modal-overlay" onClick={handleCloseVehicleModal}>
            <div className="vehicle-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <FaCar className="modal-icon" />
                  {editingVehicle ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
                </h3>
                <button type="button" className="modal-close" onClick={handleCloseVehicleModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-form-grid">
                  <div className="form-group">
                    <label className="form-label">Hãng xe *</label>
                    <input
                      type="text"
                      name="brand"
                      className="form-input"
                      value={vehicleFormData.brand}
                      onChange={handleVehicleInputChange}
                      placeholder="VD: VinFast, Tesla, Hyundai"
                    />
                    {vehicleErrors.brand && <p className="input-error">{vehicleErrors.brand}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model *</label>
                    <input
                      type="text"
                      name="model"
                      className="form-input"
                      value={vehicleFormData.model}
                      onChange={handleVehicleInputChange}
                      placeholder="VD: VF8, Model 3, IONIQ 5"
                    />
                    {vehicleErrors.model && <p className="input-error">{vehicleErrors.model}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Năm sản xuất</label>
                    <select
                      name="yearManufactured"
                      className="form-select"
                      value={vehicleFormData.yearManufactured}
                      onChange={handleVehicleInputChange}
                    >
                      {yearManufacturedOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Biển số *</label>
                    <input
                      type="text"
                      name="licensePlate"
                      className="form-input"
                      value={vehicleFormData.licensePlate}
                      onChange={handleVehicleInputChange}
                      placeholder="VD: 30A-12345"
                    />
                    {vehicleErrors.licensePlate && <p className="input-error">{vehicleErrors.licensePlate}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Màu xe</label>
                    <input
                      type="text"
                      name="color"
                      className="form-input"
                      value={vehicleFormData.color}
                      onChange={handleVehicleInputChange}
                      placeholder="VD: Trắng, Đen, Xanh"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">VIN (Vehicle Identification Number)</label>
                    <input
                      type="text"
                      name="vinNumber"
                      className="form-input"
                      value={vehicleFormData.vinNumber}
                      onChange={handleVehicleInputChange}
                      placeholder="17 ký tự"
                      maxLength={17}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseVehicleModal}>
                  Hủy
                </button>
                <button 
                  type="button" 
                  className="btn-gradient" 
                  onClick={handleSaveVehicle}
                  disabled={savingVehicle}
                >
                  {savingVehicle ? (
                    <>
                      <span className="spinner"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      {editingVehicle ? 'Cập nhật' : 'Thêm xe'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
  );
};

export default CustomerProfile;

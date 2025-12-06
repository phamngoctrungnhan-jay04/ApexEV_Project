// File: src/pages/manager/ManagerProfile.jsx
// Trang hồ sơ cá nhân cho Manager (APEX Modern UI)

import React, { useState, useEffect } from 'react';
import ManagerLayout from '../../components/layout/ManagerLayout';
import CustomAlert from '../../components/common/CustomAlert';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiEdit2,
  FiSave,
  FiX,
  FiLock,
  FiShield,
  FiCalendar
} from 'react-icons/fi';
import { getProfile, updateProfile } from '../../services/profileService';
import './ManagerProfile.css';

const ManagerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      setForm({
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || ''
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
      showAlert('danger', 'Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!form.fullName.trim()) {
      showAlert('warning', 'Vui lòng nhập họ tên');
      return;
    }

    try {
      await updateProfile(form);
      showAlert('success', 'Cập nhật hồ sơ thành công!');
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      showAlert('danger', `Lỗi: ${error.message}`);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showAlert('warning', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert('warning', 'Mật khẩu mới không khớp');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showAlert('warning', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      // TODO: Implement changePassword API
      showAlert('info', 'Chức năng đổi mật khẩu đang được phát triển');
      // await changePassword({
      //   currentPassword: passwordForm.currentPassword,
      //   newPassword: passwordForm.newPassword
      // });
      // showAlert('success', 'Đổi mật khẩu thành công!');
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showAlert('danger', `Lỗi: ${error.message}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRoleName = (role) => {
    const roleMap = {
      BUSINESS_MANAGER: 'Quản lý Tài chính',
      ADMIN: 'Quản trị viên',
      SERVICE_ADVISOR: 'Cố vấn dịch vụ',
      TECHNICIAN: 'Kỹ thuật viên',
      CUSTOMER: 'Khách hàng'
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="manager-profile-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="manager-profile-page">
        {alert.show && (
          <CustomAlert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ show: false })}
          />
        )}

        {/* Header */}
        <div className="profile-header">
          <div className="header-left">
            <div className="header-icon">
              <FiUser />
            </div>
            <div className="header-info">
              <h1 className="header-title">Hồ sơ cá nhân</h1>
              <p className="header-subtitle">Quản lý thông tin tài khoản của bạn</p>
            </div>
          </div>
        </div>

        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profile?.fullName?.charAt(0)?.toUpperCase() || 'M'}
              </div>
              <div className="avatar-info">
                <h2>{profile?.fullName || 'Manager'}</h2>
                <span className="role-badge">
                  <FiShield /> {getRoleName(profile?.role)}
                </span>
              </div>
            </div>

            {!editMode ? (
              <div className="profile-details">
                <div className="detail-item">
                  <div className="detail-icon"><FiMail /></div>
                  <div className="detail-content">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{profile?.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon"><FiPhone /></div>
                  <div className="detail-content">
                    <span className="detail-label">Số điện thoại</span>
                    <span className="detail-value">{profile?.phoneNumber || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon"><FiCalendar /></div>
                  <div className="detail-content">
                    <span className="detail-label">Ngày tạo tài khoản</span>
                    <span className="detail-value">{formatDate(profile?.createdAt)}</span>
                  </div>
                </div>

                <button className="btn-edit" onClick={() => setEditMode(true)}>
                  <FiEdit2 /> Chỉnh sửa
                </button>
              </div>
            ) : (
              <div className="profile-form">
                <div className="form-group">
                  <label><FiUser /> Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Nhập họ tên"
                  />
                </div>

                <div className="form-group">
                  <label><FiMail /> Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Nhập email"
                    disabled
                  />
                  <span className="form-hint">Email không thể thay đổi</span>
                </div>

                <div className="form-group">
                  <label><FiPhone /> Số điện thoại</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="form-actions">
                  <button className="btn-save" onClick={handleSaveProfile}>
                    <FiSave /> Lưu thay đổi
                  </button>
                  <button className="btn-cancel" onClick={() => setEditMode(false)}>
                    <FiX /> Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Password Card */}
          <div className="security-card">
            <h3><FiLock /> Bảo mật tài khoản</h3>
            
            {!showPasswordForm ? (
              <div className="security-content">
                <p>Đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.</p>
                <button className="btn-change-password" onClick={() => setShowPasswordForm(true)}>
                  <FiLock /> Đổi mật khẩu
                </button>
              </div>
            ) : (
              <div className="password-form">
                <div className="form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>

                <div className="form-actions">
                  <button className="btn-save" onClick={handleChangePassword}>
                    <FiSave /> Đổi mật khẩu
                  </button>
                  <button className="btn-cancel" onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}>
                    <FiX /> Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default ManagerProfile;

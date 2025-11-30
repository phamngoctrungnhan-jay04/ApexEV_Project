// File: src/pages/admin/AdminUserRegister.jsx
// Trang đăng ký tài khoản cho Cố vấn & Kỹ thuật viên (APEX Modern UI)

import React, { useState } from 'react';
import CustomAlert from '../../components/common/CustomAlert';
import { FiUserPlus, FiMail, FiPhone, FiLock, FiUsers } from 'react-icons/fi';
import './AdminUserRegister.css';
import '../../styles/ApexModernCard.css';
import authService from '../../services/authService';

const ROLES = [
  { value: 'SERVICE_ADVISOR', label: 'Cố vấn dịch vụ' },
  { value: 'TECHNICIAN', label: 'Kỹ thuật viên' },
  { value: 'ADMIN', label: 'Quản trị viên' }
];

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: ROLES[0].value
};

import AdminLayout from '../../components/layout/AdminLayout';
const AdminUserRegister = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeForm, setActiveForm] = useState(''); // '' | 'SERVICE_ADVISOR' | 'TECHNICIAN' | 'ADMIN'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    // Validate
    if (!form.fullName || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      setLoading(false);
      return;
    }
    try {
      await authService.register({ ...form, role: activeForm });
      setSuccess('Tạo tài khoản thành công!');
      setForm(initialForm);
    } catch (err) {
      setError(err?.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-register-container apex-modern-card">
        <h2 className="admin-register-title">
          <FiUserPlus className="icon-title" />
          {!activeForm && 'Đăng ký tài khoản nhân sự'}
          {activeForm === 'SERVICE_ADVISOR' && 'Đăng ký tài khoản cố vấn dịch vụ'}
          {activeForm === 'TECHNICIAN' && 'Đăng ký tài khoản kỹ thuật viên'}
          {activeForm === 'ADMIN' && 'Đăng ký tài khoản quản trị viên'}
        </h2>
        {!activeForm && (
          <div className="register-card-group-horizontal">
            <div className="register-card" onClick={() => { setActiveForm('SERVICE_ADVISOR'); setForm({ ...initialForm, role: 'SERVICE_ADVISOR' }); }}>
              <FiUserPlus size={32} />
              <div className="register-card-title">Tạo tài khoản cố vấn</div>
            </div>
            <div className="register-card" onClick={() => { setActiveForm('TECHNICIAN'); setForm({ ...initialForm, role: 'TECHNICIAN' }); }}>
              <FiUserPlus size={32} />
              <div className="register-card-title">Tạo tài khoản kỹ thuật viên</div>
            </div>
            <div className="register-card" onClick={() => { setActiveForm('ADMIN'); setForm({ ...initialForm, role: 'ADMIN' }); }}>
              <FiUserPlus size={32} />
              <div className="register-card-title">Tạo tài khoản quản trị viên</div>
            </div>
          </div>
        )}
        {activeForm && (
          <div className="admin-register-fields">
            <label htmlFor="fullName"><FiUsers /> Họ tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={form.fullName || ''}
              onChange={handleChange}
              placeholder="Nhập họ tên"
              required
              className="input"
            />
            <label htmlFor="email"><FiMail /> Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email || ''}
              onChange={handleChange}
              placeholder="Nhập email"
              required
              className="input"
            />
            <label htmlFor="phone"><FiPhone /> Số điện thoại</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={form.phone || ''}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              required
              className="input"
            />
            <label htmlFor="password"><FiLock /> Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password || ''}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
              className="input"
            />
            <label htmlFor="confirmPassword"><FiLock /> Nhập lại mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword || ''}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              required
              className="input"
            />
            <div className="register-btn-group">
              <button
                className="btn-primary"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading
                  ? 'Đang xử lý...'
                  : activeForm === 'SERVICE_ADVISOR'
                  ? 'Tạo tài khoản cố vấn'
                  : activeForm === 'TECHNICIAN'
                  ? 'Tạo tài khoản kỹ thuật viên'
                  : 'Tạo tài khoản quản trị viên'}
              </button>
              <button
                className="btn-secondary"
                style={{ marginLeft: '16px' }}
                onClick={() => { setActiveForm(''); setForm(initialForm); setError(''); setSuccess(''); }}
              >Quay lại</button>
            </div>
            {error && <CustomAlert type="danger" message={error} />}
            {success && <CustomAlert type="success" message={success} />}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserRegister;

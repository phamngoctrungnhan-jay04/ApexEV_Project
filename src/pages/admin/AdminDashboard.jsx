// File: src/pages/admin/AdminDashboard.jsx
// Trang Dashboard Admin (APEX Modern UI)

import React from 'react';
import { FiUsers, FiUserPlus, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import '../../styles/ApexModernCard.css';

import AdminLayout from '../../components/layout/AdminLayout';
const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="admin-dashboard-container apex-modern-card">
        <h2 className="admin-dashboard-title">
          <FiSettings className="icon-title" /> Quản trị hệ thống
        </h2>
        <div className="admin-dashboard-actions">
          <Link to="/admin/register-user" className="admin-dashboard-card">
            <FiUserPlus className="icon-card" />
            <span>Tạo tài khoản nhân sự</span>
          </Link>
          <Link to="/admin/users" className="admin-dashboard-card">
            <FiUsers className="icon-card" />
            <span>Danh sách tài khoản</span>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

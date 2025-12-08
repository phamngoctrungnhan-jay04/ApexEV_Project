// File: src/components/layout/AdminSidebar.jsx
// Sidebar cho trang Admin (APEX Modern UI)

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiUserPlus, FiUsers, FiUser, FiSettings, FiLogOut, FiPackage } from 'react-icons/fi';
import './AdminSidebar.css';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/admin/profile', label: 'Hồ sơ cá nhân', icon: <FiUser /> },
  { to: '/admin/register-user', label: 'Quản lý tài khoản', icon: <FiUsers /> },
  { to: '/admin/services', label: 'Quản lý dịch vụ', icon: <FiSettings /> },
  { to: '/admin/parts', label: 'Quản lý phụ tùng', icon: <FiPackage /> },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };
  return (
    <aside className="admin-sidebar glassmorphism">
      <div className="sidebar-brand">
        <img src="/images/logo.jpg" alt="APEX EV Logo" className="sidebar-logo-img" />
      </div>
      <nav className="sidebar-menu">
        {adminLinks.map((link) => (
          <Link key={link.to} to={link.to} className={`sidebar-link${location.pathname === link.to ? ' active' : ''}`}>
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <button className="sidebar-logout" onClick={handleLogout}>
        <FiLogOut /> Đăng xuất
      </button>
    </aside>
  );
};

export default AdminSidebar;

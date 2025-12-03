// File: src/components/layout/AdminSidebar.jsx
// Sidebar cho trang Admin (APEX Modern UI)

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiUserPlus, FiUsers, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import './AdminSidebar.css';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/admin/profile', label: 'Hồ sơ cá nhân', icon: <FiUser /> },
  { to: '/admin/register-user', label: 'Quản lý tài khoản', icon: <FiUsers /> },
  { to: '/admin/services', label: 'Quản lý dịch vụ', icon: <FiSettings /> },
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
        <span className="brand-text">APEX</span>
        <span className="brand-badge">EV</span>
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

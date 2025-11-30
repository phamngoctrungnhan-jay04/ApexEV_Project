// File: src/components/layout/AdminSidebar.jsx
// Sidebar cho trang Admin (APEX Modern UI)

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiUserPlus, FiUsers, FiLogOut } from 'react-icons/fi';
import './AdminSidebar.css';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/admin/register-user', label: 'Tạo tài khoản', icon: <FiUserPlus /> },
  { to: '/admin/users', label: 'Danh sách nhân sự', icon: <FiUsers /> }
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

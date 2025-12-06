// File: src/components/layout/ManagerSidebar.jsx
// Sidebar cho trang Manager (APEX Modern UI)

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiDollarSign, 
  FiFileText, 
  FiUser, 
  FiTrendingUp, 
  FiLogOut,
  FiAlertCircle,
  FiPieChart
} from 'react-icons/fi';
import './ManagerSidebar.css';

const managerLinks = [
  { to: '/manager/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/manager/finance', label: 'Quản lý tài chính', icon: <FiDollarSign /> },
  { to: '/manager/invoices', label: 'Danh sách hóa đơn', icon: <FiFileText /> },
  { to: '/manager/overdue', label: 'Hóa đơn quá hạn', icon: <FiAlertCircle /> },
  { to: '/manager/reports', label: 'Báo cáo thống kê', icon: <FiPieChart /> },
  { to: '/manager/profile', label: 'Hồ sơ cá nhân', icon: <FiUser /> },
];

const ManagerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="manager-sidebar glassmorphism">
      <div className="sidebar-brand">
        <span className="brand-text">APEX</span>
        <span className="brand-badge">Finance</span>
      </div>
      <nav className="sidebar-menu">
        {managerLinks.map((link) => (
          <Link 
            key={link.to} 
            to={link.to} 
            className={`sidebar-link${location.pathname === link.to ? ' active' : ''}`}
          >
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

export default ManagerSidebar;

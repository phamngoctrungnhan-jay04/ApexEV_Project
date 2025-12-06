// File: src/components/layout/TechnicianSidebar.jsx
// Sidebar cho Kỹ thuật viên - APEX Modern UI

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiClipboard, 
  FiCheckSquare, 
  FiTool, 
  FiUser, 
  FiLogOut 
} from 'react-icons/fi';
import './TechnicianSidebar.css';

const technicianMenu = [
  { to: '/technician/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/technician/jobs', label: 'Công việc của tôi', icon: <FiClipboard /> },
  { to: '/technician/checklist', label: 'Checklist bảo dưỡng', icon: <FiCheckSquare /> },
  { to: '/technician/parts-request', label: 'Yêu cầu linh kiện', icon: <FiTool /> },
  { to: '/technician/profile', label: 'Hồ sơ cá nhân', icon: <FiUser /> },
];

const TechnicianSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="technician-sidebar glassmorphism">
      <div className="sidebar-brand">
        <span className="brand-text">APEX</span>
        <span className="brand-badge">EV</span>
      </div>
      
      <nav className="sidebar-menu">
        {technicianMenu.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`sidebar-link${location.pathname === item.to ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <FiLogOut /> Đăng xuất
      </button>
    </aside>
  );
};

export default TechnicianSidebar;

import { Link, useLocation } from 'react-router-dom';
import { FiCalendar, FiClipboard, FiUser, FiLogOut, FiHome } from 'react-icons/fi';
import './AdvisorSidebar.css';

const advisorMenu = [
  { label: 'Dashboard', icon: <FiHome />, path: '/advisor/dashboard' },
  { label: 'Lịch hẹn', icon: <FiCalendar />, path: '/advisor/appointments' },
  { label: 'Đơn hàng', icon: <FiClipboard />, path: '/advisor/orders' },
  { label: 'Hồ sơ', icon: <FiUser />, path: '/advisor/profile' },
];

function AdvisorSidebar({ onLogout }) {
  const location = useLocation();
  return (
    <aside className="advisor-sidebar glassmorphism">
      <div className="sidebar-brand">
        <span className="brand-text">APEX</span>
        <span className="brand-badge">EV</span>
      </div>
      <nav className="sidebar-menu">
        {advisorMenu.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link${location.pathname.startsWith(item.path) ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <button className="sidebar-logout" onClick={onLogout}>
        <FiLogOut /> Đăng xuất
      </button>
    </aside>
  );
}

export default AdvisorSidebar;

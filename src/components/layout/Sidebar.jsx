import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { 
  FiHome,
  FiCalendar,
  FiUser,
  FiClock,
  FiFileText,
  FiMessageSquare,
  FiStar,
  FiSettings,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Customer menu items
  const customerMenuItems = [
    {
      path: ROUTES.CUSTOMER.DASHBOARD,
      icon: FiHome,
      label: t('menu.dashboard'),
      badge: null
    },
    {
      path: ROUTES.CUSTOMER.BOOKING,
      icon: FiCalendar,
      label: t('menu.booking'),
      badge: null
    },
    {
      path: ROUTES.CUSTOMER.HISTORY,
      icon: FiClock,
      label: t('menu.history'),
      badge: null
    },
    {
      path: ROUTES.CUSTOMER.INVOICES,
      icon: FiFileText,
      label: t('menu.invoices'),
      badge: null
    },
    {
      path: ROUTES.CUSTOMER.CHAT,
      icon: FiMessageSquare,
      label: t('menu.chat'),
      badge: 2 // Mock unread messages
    },
    {
      path: ROUTES.CUSTOMER.RATINGS,
      icon: FiStar,
      label: t('menu.ratings'),
      badge: null
    },
    {
      path: ROUTES.CUSTOMER.PROFILE,
      icon: FiUser,
      label: t('menu.profile'),
      badge: null
    },
    {
      path: ROUTES.CUSTOMER.SETTINGS,
      icon: FiSettings,
      label: t('menu.settings'),
      badge: null
    }
  ];

  // Get menu items based on user role
  const getMenuItems = () => {
    switch (user?.role) {
      case 'customer':
        return customerMenuItems;
      // TODO: Add menu items for other roles
      case 'technician':
        return [];
      case 'advisor':
        return [];
      case 'manager':
        return [];
      case 'admin':
        return [];
      default:
        return customerMenuItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content">
        {/* Menu Items */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
              title={isCollapsed ? item.label : ''}
            >
              <div className="sidebar-item-icon">
                <item.icon size={22} />
              </div>
              {!isCollapsed && (
                <>
                  <span className="sidebar-item-label">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Collapse Toggle Button */}
      <button 
        className="sidebar-collapse-btn"
        onClick={onToggle}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
      </button>
    </aside>
  );
};

export default Sidebar;

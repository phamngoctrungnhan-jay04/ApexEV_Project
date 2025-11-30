import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './CustomerLayout.css';

const CustomerLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    // Desktop: toggle collapse
    // Mobile: toggle open/close
    if (window.innerWidth <= 991) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleCloseMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const location = useLocation();
  const isBookingPage = location.pathname === '/customer/booking';
  const isProfilePage = location.pathname === '/customer/profile';
  return (
    <div className="customer-layout">
      {/* Header */}
      <Header />
      {/* Main Content */}
      <main className="main-content">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;

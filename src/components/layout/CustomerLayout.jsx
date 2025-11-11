import { useState } from 'react';
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

  return (
    <div className="customer-layout">
      {/* Header */}
      <Header 
        onToggleSidebar={handleToggleSidebar}
        showSidebarToggle={true}
      />

      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        className={mobileSidebarOpen ? 'mobile-open' : ''}
      />

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="sidebar-overlay show" 
          onClick={handleCloseMobileSidebar}
        />
      )}

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;

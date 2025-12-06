// File: src/components/layout/ManagerLayout.jsx
// Layout cho trang Manager, gồm Sidebar và nội dung

import React from 'react';
import ManagerSidebar from './ManagerSidebar';
import './ManagerLayout.css';

const ManagerLayout = ({ children }) => {
  return (
    <div className="manager-layout">
      <ManagerSidebar />
      <main className="manager-main-content">
        {children}
      </main>
    </div>
  );
};

export default ManagerLayout;

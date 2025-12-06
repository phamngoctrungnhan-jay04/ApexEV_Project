// File: src/components/layout/TechnicianLayout.jsx
// Layout cho trang Technician (Kỹ thuật viên) - APEX Modern UI

import React from 'react';
import { Outlet } from 'react-router-dom';
import TechnicianSidebar from './TechnicianSidebar';
import './TechnicianLayout.css';

const TechnicianLayout = () => {
  return (
    <div className="technician-layout">
      <TechnicianSidebar />
      <main className="technician-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default TechnicianLayout;

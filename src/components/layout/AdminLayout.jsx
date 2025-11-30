// File: src/components/layout/AdminLayout.jsx
// Layout cho trang Admin, gồm Sidebar và nội dung

import React from 'react';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

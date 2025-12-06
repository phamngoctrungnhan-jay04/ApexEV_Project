// File: src/pages/manager/FinanceDashboard.jsx
// Trang Dashboard Tài chính cho Manager (APEX Modern UI)

import React, { useState, useEffect } from 'react';
import ManagerLayout from '../../components/layout/ManagerLayout';
import CustomAlert from '../../components/common/CustomAlert';
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiRefreshCw,
  FiCalendar,
  FiBarChart2
} from 'react-icons/fi';
import financeService from '../../services/financeService';
import './FinanceDashboard.css';

const FinanceDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, monthlyData, invoicesData, overdueData] = await Promise.all([
        financeService.getStatistics(),
        financeService.getMonthlyStatistics(6),
        financeService.getAllInvoices({ status: 'all' }),
        financeService.getOverdueInvoices()
      ]);

      setStatistics(statsData);
      setMonthlyStats(monthlyData || []);
      setRecentInvoices((invoicesData || []).slice(0, 5));
      setOverdueInvoices(overdueData || []);
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      showAlert('danger', `Lỗi tải dữ liệu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PAID: { label: 'Đã thanh toán', className: 'status-paid' },
      PENDING: { label: 'Chờ thanh toán', className: 'status-pending' },
      CANCELLED: { label: 'Đã hủy', className: 'status-cancelled' }
    };
    const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  // Tính max revenue cho chart
  const maxRevenue = Math.max(...monthlyStats.map(m => m.revenue || 0), 1);

  if (loading) {
    return (
      <ManagerLayout>
        <div className="finance-dashboard-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="finance-dashboard-page">
        {alert.show && (
          <CustomAlert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ show: false })}
          />
        )}

        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <div className="header-icon">
              <FiBarChart2 />
            </div>
            <div className="header-info">
              <h1 className="header-title">Tổng quan Tài chính</h1>
              <p className="header-subtitle">Theo dõi doanh thu và quản lý hóa đơn</p>
            </div>
          </div>
          <button className="btn-refresh" onClick={fetchDashboardData}>
            <FiRefreshCw /> Làm mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-revenue">
            <div className="stat-icon">
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <p className="stat-label">Tổng doanh thu</p>
              <h3 className="stat-value">{formatCurrency(statistics?.totalRevenue)}</h3>
              <p className="stat-change positive">
                <FiTrendingUp /> {statistics?.paidInvoices || 0} hóa đơn đã thanh toán
              </p>
            </div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-icon">
              <FiClock />
            </div>
            <div className="stat-content">
              <p className="stat-label">Chờ thanh toán</p>
              <h3 className="stat-value">{formatCurrency(statistics?.pendingAmount)}</h3>
              <p className="stat-change warning">
                <FiFileText /> {statistics?.pendingInvoices || 0} hóa đơn
              </p>
            </div>
          </div>

          <div className="stat-card stat-overdue">
            <div className="stat-icon">
              <FiAlertTriangle />
            </div>
            <div className="stat-content">
              <p className="stat-label">Quá hạn</p>
              <h3 className="stat-value">{formatCurrency(statistics?.overdueAmount)}</h3>
              <p className="stat-change danger">
                <FiXCircle /> {statistics?.overdueInvoices || 0} hóa đơn quá hạn
              </p>
            </div>
          </div>

          <div className="stat-card stat-total">
            <div className="stat-icon">
              <FiFileText />
            </div>
            <div className="stat-content">
              <p className="stat-label">Tổng hóa đơn</p>
              <h3 className="stat-value">{statistics?.totalInvoices || 0}</h3>
              <p className="stat-change">
                TB: {formatCurrency(statistics?.averageInvoiceAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-content">
          {/* Revenue Chart */}
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h3><FiTrendingUp /> Doanh thu 6 tháng gần nhất</h3>
            </div>
            <div className="chart-container">
              {monthlyStats.length > 0 ? (
                <div className="bar-chart">
                  {monthlyStats.map((month, index) => (
                    <div key={index} className="bar-item">
                      <div className="bar-wrapper">
                        <div
                          className="bar"
                          style={{
                            height: `${(month.revenue / maxRevenue) * 100}%`
                          }}
                        >
                          <span className="bar-value">
                            {(month.revenue / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                      <span className="bar-label">{month.monthLabel}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">Chưa có dữ liệu doanh thu</div>
              )}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="dashboard-card recent-card">
            <div className="card-header">
              <h3><FiFileText /> Hóa đơn gần đây</h3>
              <a href="/manager/invoices" className="view-all">Xem tất cả →</a>
            </div>
            <div className="recent-list">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="recent-item">
                    <div className="item-info">
                      <span className="item-id">#{invoice.id}</span>
                      <span className="item-customer">{invoice.customerName || 'Khách hàng'}</span>
                    </div>
                    <div className="item-meta">
                      <span className="item-amount">{formatCurrency(invoice.totalAmount)}</span>
                      {getStatusBadge(invoice.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">Chưa có hóa đơn nào</div>
              )}
            </div>
          </div>

          {/* Overdue Invoices */}
          <div className="dashboard-card overdue-card">
            <div className="card-header warning-header">
              <h3><FiAlertTriangle /> Hóa đơn quá hạn</h3>
              <span className="count-badge">{overdueInvoices.length}</span>
            </div>
            <div className="overdue-list">
              {overdueInvoices.length > 0 ? (
                overdueInvoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="overdue-item">
                    <div className="overdue-info">
                      <span className="overdue-id">#{invoice.id}</span>
                      <span className="overdue-customer">{invoice.customerName}</span>
                    </div>
                    <div className="overdue-meta">
                      <span className="overdue-amount">{formatCurrency(invoice.totalAmount)}</span>
                      <span className="overdue-days">{invoice.daysOverdue} ngày</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data success-data">
                  <FiCheckCircle /> Không có hóa đơn quá hạn
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="dashboard-card quick-stats-card">
            <div className="card-header">
              <h3><FiBarChart2 /> Thống kê nhanh</h3>
            </div>
            <div className="quick-stats">
              <div className="quick-stat-item">
                <div className="stat-circle paid">
                  <span>{statistics?.paidInvoices || 0}</span>
                </div>
                <p>Đã thanh toán</p>
              </div>
              <div className="quick-stat-item">
                <div className="stat-circle pending">
                  <span>{statistics?.pendingInvoices || 0}</span>
                </div>
                <p>Chờ xử lý</p>
              </div>
              <div className="quick-stat-item">
                <div className="stat-circle overdue">
                  <span>{statistics?.overdueInvoices || 0}</span>
                </div>
                <p>Quá hạn</p>
              </div>
              <div className="quick-stat-item">
                <div className="stat-circle cancelled">
                  <span>{statistics?.cancelledInvoices || 0}</span>
                </div>
                <p>Đã hủy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default FinanceDashboard;

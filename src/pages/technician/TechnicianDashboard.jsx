import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiAlertCircle, FiTool, FiCalendar, FiPackage, FiArrowRight } from 'react-icons/fi';
import technicianWorkService from '../../services/technicianWorkService';
import './TechnicianDashboard.css';

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [activeData, completedData] = await Promise.all([
        technicianWorkService.getMyOrders(),
        technicianWorkService.getMyCompletedOrders()
      ]);
      setOrders(activeData || []);
      setCompletedOrders(completedData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tính toán thống kê
  const stats = {
    completed: completedOrders.filter(o => o.status === 'COMPLETED').length,
    today: orders.length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    pending: orders.filter(o => ['CONFIRMED', 'RECEPTION', 'INSPECTION'].includes(o.status)).length
  };

  const getStatusLabel = (status) => {
    const labels = {
      CONFIRMED: 'Đã xác nhận',
      RECEPTION: 'Tiếp nhận',
      INSPECTION: 'Kiểm tra',
      IN_PROGRESS: 'Đang thực hiện',
      WAITING_FOR_PARTS: 'Chờ phụ tùng',
      READY_FOR_INVOICE: 'Sẵn sàng xuất HĐ',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      CONFIRMED: 'confirmed',
      RECEPTION: 'reception',
      INSPECTION: 'inspection',
      IN_PROGRESS: 'in-progress',
      WAITING_FOR_PARTS: 'waiting-parts',
      READY_FOR_INVOICE: 'ready',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled'
    };
    return classes[status] || '';
  };

  if (loading) {
    return (
      <div className="tech-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="tech-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h2>Dashboard Kỹ thuật viên</h2>
        <div className="header-date">
          Chủ Nhật, {new Date().toLocaleDateString('vi-VN', { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon completed">
            <FiCheckCircle />
          </div>
          <div className="stat-label">Công việc hoàn thành</div>
          <div className="stat-value">{stats.completed}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon today">
            <FiCalendar />
          </div>
          <div className="stat-label">Công việc hôm nay</div>
          <div className="stat-value">{stats.today}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress">
            <FiTool />
          </div>
          <div className="stat-label">Đang thực hiện</div>
          <div className="stat-value">{stats.inProgress}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <FiClock />
          </div>
          <div className="stat-label">Chờ xử lý</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
      </div>

      {/* Hiệu suất làm việc */}
      <div className="performance-section">
        <h3>📊 Hiệu suất làm việc</h3>
        <div className="performance-grid">
          <div className="performance-item">
            <div className="performance-label">Tỷ lệ hoàn thành</div>
            <div className="performance-value">
              {orders.length + completedOrders.length > 0 
                ? Math.round((stats.completed / (orders.length + completedOrders.length)) * 100) 
                : 0}%
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${orders.length + completedOrders.length > 0 
                  ? (stats.completed / (orders.length + completedOrders.length)) * 100 
                  : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="performance-item">
            <div className="performance-label">Đánh giá trung bình</div>
            <div className="performance-value">⭐ 0/5.0</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
          </div>

          <div className="performance-item">
            <div className="performance-label">Hoàn thành đúng giờ</div>
            <div className="performance-value">0%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Công việc hôm nay */}
      <div className="today-tasks-section">
        <div className="section-header">
          <h3>📅 Công việc hôm nay ({orders.length})</h3>
          <button className="view-all-btn" onClick={() => navigate('/technician/jobs')}>
            Xem tất cả <FiArrowRight />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <FiCheckCircle size={48} />
            <p>Không có công việc nào cho hôm nay</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {orders.slice(0, 6).map(order => (
              <div 
                key={order.orderId} 
                className="task-card"
                onClick={() => navigate(`/technician/jobs`)}
              >
                <div className="task-header">
                  <div className="task-order-id">#{order.orderId}</div>
                  <span className={`task-status ${getStatusClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="task-info">
                  <div className="task-info-row">
                    <FiPackage size={16} />
                    <span>{order.customerName}</span>
                  </div>
                  <div className="task-info-row">
                    <FiTool size={16} />
                    <span>{order.vehicleName}</span>
                  </div>
                  <div className="task-info-row">
                    <FiClock size={16} />
                    <span>{order.appointmentTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Công việc hoàn thành gần đây */}
      <div className="recent-completed-section">
        <div className="section-header">
          <h3>✅ Công việc hoàn thành gần đây</h3>
        </div>
        
        {completedOrders.length === 0 ? (
          <div className="empty-state">
            <FiPackage size={48} />
            <p>Chưa có công việc hoàn thành</p>
          </div>
        ) : (
          <div className="completed-list">
            {completedOrders.slice(0, 5).map(order => (
              <div key={order.orderId} className="completed-item">
                <div className="completed-info">
                  <div className="completed-icon">
                    <FiCheckCircle />
                  </div>
                  <div className="completed-details">
                    <h4>Đơn #{order.orderId}</h4>
                    <p>{order.customerName} - {order.vehicleName}</p>
                  </div>
                </div>
                <div className="completed-date">
                  {order.completedAt ? new Date(order.completedAt).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;

// File: src/pages/advisor/AdvisorDashboard.jsx
// Trang Dashboard mới cho Advisor - APEX Modern UI

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiClipboard,
  FiMessageSquare,
  FiUser,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight,
  FiActivity
} from 'react-icons/fi';
import AdvisorLayout from './AdvisorLayout';
import './AdvisorDashboard.css';
import appointmentService from '../../services/appointmentService';

function AdvisorDashboard() {
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    confirmedToday: 0,
    totalThisWeek: 0,
    completedThisMonth: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Cập nhật thời gian mỗi phút
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const appointments = await appointmentService.getPendingAppointments();
        
        // Tính toán stats
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        setStats({
          pendingAppointments: appointments.filter(a => a.status === 'PENDING').length,
          confirmedToday: appointments.filter(a => a.status === 'CONFIRMED').length,
          totalThisWeek: appointments.length,
          completedThisMonth: appointments.filter(a => a.status === 'COMPLETED').length
        });
        
        // Lấy 5 lịch hẹn gần nhất
        setRecentAppointments(appointments.slice(0, 5));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format time array to Date
  const formatAppointmentTime = (arr) => {
    if (Array.isArray(arr) && arr.length >= 5) {
      return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]);
    }
    if (typeof arr === 'string') {
      return new Date(arr);
    }
    return null;
  };

  // Lời chào theo thời gian
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Quick actions
  const quickActions = [
    {
      icon: <FiCalendar />,
      title: 'Lịch hẹn',
      description: 'Xem và xử lý lịch hẹn',
      path: '/advisor/appointments',
      color: 'blue',
      badge: stats.pendingAppointments > 0 ? stats.pendingAppointments : null
    },
    {
      icon: <FiClipboard />,
      title: 'Đơn hàng',
      description: 'Quản lý đơn dịch vụ',
      path: '/advisor/orders',
      color: 'green'
    },
    {
      icon: <FiMessageSquare />,
      title: 'Tin nhắn',
      description: 'Chat với khách hàng',
      path: '/advisor/chat',
      color: 'purple'
    },
    {
      icon: <FiUser />,
      title: 'Hồ sơ',
      description: 'Thông tin cá nhân',
      path: '/advisor/profile',
      color: 'orange'
    }
  ];

  // Stats cards
  const statsCards = [
    {
      icon: <FiClock />,
      value: stats.pendingAppointments,
      label: 'Chờ xác nhận',
      color: 'warning',
      trend: '+2 từ hôm qua'
    },
    {
      icon: <FiCheckCircle />,
      value: stats.confirmedToday,
      label: 'Đã xác nhận',
      color: 'success',
      trend: 'Hôm nay'
    },
    {
      icon: <FiCalendar />,
      value: stats.totalThisWeek,
      label: 'Tuần này',
      color: 'primary',
      trend: 'Tổng lịch hẹn'
    },
    {
      icon: <FiActivity />,
      value: stats.completedThisMonth,
      label: 'Hoàn thành',
      color: 'info',
      trend: 'Tháng này'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  return (
    <AdvisorLayout onLogout={handleLogout}>
      <div className="advisor-dashboard-page">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <div className="welcome-text">
              <span className="greeting">{getGreeting()} 👋</span>
              <h1>Chào mừng trở lại!</h1>
              <p>Đây là tổng quan hoạt động của bạn hôm nay.</p>
            </div>
            <div className="welcome-time">
              <div className="time-display">
                {currentTime.toLocaleTimeString('vi-VN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="date-display">
                {currentTime.toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            {statsCards.map((stat, index) => (
              <div key={index} className={`stat-card ${stat.color}`}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <span className="stat-value">{loading ? '...' : stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-trend">{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Quick Actions */}
          <section className="quick-actions-section">
            <div className="section-header">
              <h2><FiTrendingUp /> Truy cập nhanh</h2>
            </div>
            <div className="actions-grid">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.path} className={`action-card ${action.color}`}>
                  <div className="action-icon">{action.icon}</div>
                  <div className="action-content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  {action.badge && (
                    <span className="action-badge">{action.badge}</span>
                  )}
                  <FiChevronRight className="action-arrow" />
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Appointments */}
          <section className="recent-section">
            <div className="section-header">
              <h2><FiCalendar /> Lịch hẹn gần đây</h2>
              <Link to="/advisor/appointments" className="view-all">
                Xem tất cả <FiChevronRight />
              </Link>
            </div>
            <div className="recent-list">
              {loading ? (
                <div className="loading-placeholder">Đang tải...</div>
              ) : recentAppointments.length === 0 ? (
                <div className="empty-placeholder">
                  <FiCalendar className="empty-icon" />
                  <p>Chưa có lịch hẹn nào</p>
                </div>
              ) : (
                recentAppointments.map((appointment, index) => (
                  <div key={index} className="recent-item">
                    <div className="item-avatar">
                      {appointment.customerFullName?.charAt(0) || '?'}
                    </div>
                    <div className="item-info">
                      <h4>{appointment.customerFullName || 'Khách hàng'}</h4>
                      <p>
                        {appointment.appointmentTime 
                          ? formatAppointmentTime(appointment.appointmentTime)?.toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </p>
                    </div>
                    <div className={`item-status ${appointment.status?.toLowerCase()}`}>
                      {appointment.status === 'PENDING' ? (
                        <><FiClock /> Chờ</>
                      ) : appointment.status === 'CONFIRMED' ? (
                        <><FiCheckCircle /> Xác nhận</>
                      ) : (
                        <><FiAlertCircle /> {appointment.status}</>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Tips Section */}
        <section className="tips-section">
          <div className="tip-card">
            <div className="tip-icon">💡</div>
            <div className="tip-content">
              <h4>Mẹo hôm nay</h4>
              <p>Hãy xác nhận các lịch hẹn đang chờ để khách hàng nhận được thông báo sớm nhất!</p>
            </div>
          </div>
        </section>
      </div>
    </AdvisorLayout>
  );
}

export default AdvisorDashboard;

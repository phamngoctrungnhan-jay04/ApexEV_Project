import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar, Badge } from 'react-bootstrap';
import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiMessageSquare,
  FiTruck,
  FiFileText,
  FiBell,
  FiCheckCircle,
  FiAlertCircle,
  FiTool,
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { CustomButton } from '../../components/common';
import {
  customers,
  vehicles,
  orders,
  invoices,
  notifications,
  technicians,
  services,
  getVehiclesByCustomer,
  getUpcomingOrders,
  getActiveOrders,
  getUnreadNotifications,
  calculateCustomerStats,
} from '../../mockData';
import './Dashboard.css';

function CustomerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Simulate logged-in customer (ID: 1 - Nguyễn Văn An)
  const currentCustomerId = 1;
  const [customerData, setCustomerData] = useState(null);
  const [stats, setStats] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [activeWork, setActiveWork] = useState(null);
  const [userNotifications, setUserNotifications] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Load customer data
    const customer = customers.find(c => c.id === currentCustomerId);
    setCustomerData(customer);

    // Calculate stats
    const customerStats = calculateCustomerStats(currentCustomerId, orders, invoices);
    setStats(customerStats);

    // Get upcoming bookings
    const upcoming = getUpcomingOrders(currentCustomerId, orders)
      .slice(0, 2)
      .map(order => {
        const vehicle = vehicles.find(v => v.id === order.vehicleId);
        const tech = technicians.find(t => t.id === order.technicianId);
        const service = services.find(s => s.id === order.serviceIds[0]);
        return {
          id: order.id,
          service: service?.name || 'N/A',
          date: order.scheduledDate,
          time: order.scheduledTime,
          vehicle: `${vehicle?.brand} ${vehicle?.model} - ${vehicle?.licensePlate}`,
          status: order.status,
          technician: tech?.fullName || 'Chưa phân công',
        };
      });
    setUpcomingBookings(upcoming);

    // Get active work (in-progress order)
    const active = getActiveOrders(currentCustomerId, orders);
    if (active.length > 0) {
      const activeOrder = active[0];
      const vehicle = vehicles.find(v => v.id === activeOrder.vehicleId);
      const tech = technicians.find(t => t.id === activeOrder.technicianId);
      const service = services.find(s => s.id === activeOrder.serviceIds[0]);
      setActiveWork({
        service: service?.name || 'N/A',
        vehicle: `${vehicle?.brand} ${vehicle?.model} - ${vehicle?.licensePlate}`,
        technician: tech?.fullName || 'N/A',
        progress: activeOrder.progress || 0,
        startTime: activeOrder.scheduledTime,
        estimatedCompletion: '10:30', // Mock
        currentStep: activeOrder.internalNotes || 'Đang xử lý',
      });
    }

    // Get notifications
    const unreadNotifs = getUnreadNotifications(currentCustomerId, 'customer', notifications)
      .slice(0, 3)
      .map(notif => ({
        id: notif.id,
        type: notif.type === 'service-completed' ? 'success' : notif.type === 'service-reminder' ? 'warning' : 'info',
        title: notif.title,
        message: notif.message,
        time: new Date(notif.createdAt).toLocaleString('vi-VN'),
        isRead: notif.isRead,
      }));
    setUserNotifications(unreadNotifs);

    // Generate chart data (last 6 months cost from invoices)
    const paidInvoices = invoices
      .filter(inv => inv.customerId === currentCustomerId && inv.status === 'paid')
      .sort((a, b) => new Date(a.paidDate) - new Date(b.paidDate))
      .slice(-6);
    
    const monthlyData = paidInvoices.map(inv => {
      const date = new Date(inv.paidDate);
      return {
        month: `T${date.getMonth() + 1}`,
        amount: inv.totalAmount,
      };
    });
    setChartData(monthlyData.length > 0 ? monthlyData : [
      { month: 'T7', amount: 0 },
      { month: 'T8', amount: 0 },
      { month: 'T9', amount: 0 },
      { month: 'T10', amount: 0 },
      { month: 'T11', amount: 0 },
      { month: 'T12', amount: 0 },
    ]);
  }, [currentCustomerId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      confirmed: { bg: 'success', text: t('status.confirmed') },
      pending: { bg: 'warning', text: t('status.pending') },
      cancelled: { bg: 'danger', text: t('status.cancelled') },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-success" />;
      case 'warning':
        return <FiAlertCircle className="text-warning" />;
      default:
        return <FiBell className="text-info" />;
    }
  };

  return (
    <div className="customer-dashboard">
      <Container fluid>
        {/* Welcome Banner */}
        <Card className="welcome-banner mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <div className="d-flex align-items-center">
                  <div className="user-avatar">
                    <img
                      src={customerData?.avatar || 'https://ui-avatars.com/api/?name=' + (customerData?.fullName || 'User')}
                      alt="Avatar"
                    />
                  </div>
                  <div className="ms-3">
                    <h4 className="mb-1">
                      {t('dashboard.welcome')}, {customerData?.fullName || t('common.welcome')}! 👋
                    </h4>
                    <p className="text-muted mb-0">
                      {t('dashboard.greeting')}
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={4} className="text-end">
                <div className="current-time">
                  <FiClock className="me-2" />
                  {new Date().toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col lg={4} md={6} className="mb-3">
            <Card className="stat-card stat-card-blue">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="stat-icon">
                      <FiTool />
                    </div>
                    <h3 className="stat-number mt-3">{stats?.totalMaintenance || 0}</h3>
                    <p className="stat-label">{t('dashboard.totalMaintenance')}</p>
                  </div>
                  <div className="stat-badge">
                    <Badge bg="primary">+2 {t('dashboard.thisMonth')}</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={6} className="mb-3">
            <Card className="stat-card stat-card-green">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="stat-icon">
                      <FiCalendar />
                    </div>
                    <h3 className="stat-number mt-3">{stats?.upcomingBookings || 0}</h3>
                    <p className="stat-label">{t('dashboard.upcomingBookings')}</p>
                  </div>
                  <div className="stat-badge">
                    <Badge bg="success">{t('dashboard.thisWeek')}</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={6} className="mb-3">
            <Card className="stat-card stat-card-purple">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="stat-icon">
                      <FiDollarSign />
                    </div>
                    <h3 className="stat-number mt-3">{formatCurrency(stats?.totalSpent || 0)}</h3>
                    <p className="stat-label">{t('dashboard.totalSpent')}</p>
                  </div>
                  <div className="stat-badge">
                    <Badge bg="info">{t('dashboard.lastSixMonths')}</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card className="quick-actions-card mb-4">
          <Card.Body>
            <h5 className="mb-3">
              <FiTool className="me-2" />
              {t('dashboard.quickActions')}
            </h5>
            <Row>
              <Col lg={3} md={6} className="mb-3">
                <CustomButton
                  variant="outline-primary"
                  className="w-100 quick-action-btn"
                  onClick={() => navigate('/customer/booking')}
                >
                  <FiCalendar className="mb-2" size={24} />
                  <div>{t('dashboard.bookMaintenance')}</div>
                </CustomButton>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <CustomButton
                  variant="outline-success"
                  className="w-100 quick-action-btn"
                  onClick={() => navigate('/customer/chat')}
                >
                  <FiMessageSquare className="mb-2" size={24} />
                  <div>{t('dashboard.chatWithTechnician')}</div>
                </CustomButton>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <CustomButton
                  variant="outline-info"
                  className="w-100 quick-action-btn"
                  onClick={() => navigate('/customer/history')}
                >
                  <FiFileText className="mb-2" size={24} />
                  <div>{t('dashboard.viewHistory')}</div>
                </CustomButton>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <CustomButton
                  variant="outline-warning"
                  className="w-100 quick-action-btn"
                  onClick={() => navigate('/customer/profile')}
                >
                  <FiTruck className="mb-2" size={24} />
                  <div>{t('dashboard.manageVehicle')}</div>
                </CustomButton>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Row>
          {/* Left Column */}
          <Col lg={8}>
            {/* Active Work Progress */}
            {activeWork && (
              <Card className="active-work-card mb-4">
                <Card.Body>
                  <h5 className="mb-3">
                    <FiTool className="me-2 text-primary" />
                    {t('dashboard.activeWork')}
                  </h5>
                  <div className="work-info mb-3">
                    <Row>
                      <Col md={6}>
                        <div className="info-item">
                          <span className="label">{t('dashboard.service')}:</span>
                          <span className="value">{activeWork.service}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">{t('dashboard.vehicle')}:</span>
                          <span className="value">{activeWork.vehicle}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <span className="label">{t('dashboard.technician')}:</span>
                          <span className="value">{activeWork.technician}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">{t('dashboard.estimatedCompletion')}:</span>
                          <span className="value">{activeWork.estimatedCompletion}</span>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <div className="progress-info mb-2">
                    <span className="current-step">{activeWork.currentStep}</span>
                    <span className="progress-percent">{activeWork.progress}%</span>
                  </div>
                  <ProgressBar
                    now={activeWork.progress}
                    variant="success"
                    className="progress-bar-custom"
                  />
                </Card.Body>
              </Card>
            )}

            {/* Upcoming Bookings */}
            <Card className="bookings-card mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">
                    <FiCalendar className="me-2 text-primary" />
                    {t('dashboard.upcomingBookingsTitle')}
                  </h5>
                  <CustomButton
                    variant="link"
                    size="sm"
                    onClick={() => navigate('/customer/booking')}
                  >
                    {t('common.viewAll')} →
                  </CustomButton>
                </div>
                {upcomingBookings.length > 0 ? (
                  <div className="bookings-list">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="booking-item">
                        <div className="booking-date">
                          <div className="date-day">
                            {new Date(booking.date).getDate()}
                          </div>
                          <div className="date-month">
                            Tháng {new Date(booking.date).getMonth() + 1}
                          </div>
                        </div>
                        <div className="booking-details">
                          <h6 className="booking-service">{booking.service}</h6>
                          <div className="booking-meta">
                            <span>
                              <FiClock className="me-1" />
                              {booking.time}
                            </span>
                            <span>
                              <FiTruck className="me-1" />
                              {booking.vehicle}
                            </span>
                          </div>
                          <div className="booking-footer">
                            <span className="technician">
                              {t('dashboard.technician')}: {booking.technician}
                            </span>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    <FiCalendar size={48} className="mb-2 opacity-25" />
                    <p>{t('dashboard.noBookings')}</p>
                    <CustomButton onClick={() => navigate('/customer/booking')}>
                      {t('dashboard.bookNow')}
                    </CustomButton>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Chart */}
            <Card className="chart-card">
              <Card.Body>
                <h5 className="mb-3">
                  <FiDollarSign className="me-2 text-primary" />
                  {t('dashboard.costChart')}
                </h5>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis
                      stroke="#666"
                      tickFormatter={(value) =>
                        `${(value / 1000000).toFixed(1)}M`
                      }
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Notifications */}
          <Col lg={4}>
            <Card className="notifications-card">
              <Card.Body>
                <h5 className="mb-3">
                  <FiBell className="me-2 text-primary" />
                  {t('dashboard.notifications')}
                </h5>
                <div className="notifications-list">
                  {userNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${
                        !notification.isRead ? 'unread' : ''
                      }`}
                    >
                      <div className="notification-icon">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-content">
                        <h6 className="notification-title">{notification.title}</h6>
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-3">
                  <CustomButton variant="link" size="sm">
                    {t('dashboard.viewAllNotifications')} →
                  </CustomButton>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CustomerDashboard;

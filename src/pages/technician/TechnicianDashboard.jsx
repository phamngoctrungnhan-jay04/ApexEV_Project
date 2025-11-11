import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, ProgressBar } from 'react-bootstrap';
import { FiCheckCircle, FiClock, FiAlertCircle, FiTool, FiTrendingUp, FiAward, FiCalendar, FiUser } from 'react-icons/fi';
import { getOrdersByTechnician } from '../../mockData';
import './TechnicianDashboard.css';

const TechnicianDashboard = () => {
  const currentTechnicianId = 1; // Mock current logged-in technician
  const [allOrders, setAllOrders] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    todayTasks: 0,
    inProgress: 0,
    pending: 0
  });

  useEffect(() => {
    // Load all orders for this technician
    const orders = getOrdersByTechnician(currentTechnicianId);
    setAllOrders(orders);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Filter today's tasks
    const todaysOrders = orders.filter(order => order.scheduledDate === today);
    setTodayTasks(todaysOrders);

    // Calculate stats
    const completed = orders.filter(o => o.status === 'completed').length;
    const inProgress = orders.filter(o => o.status === 'in-progress').length;
    const pending = orders.filter(o => o.status === 'pending' || o.status === 'scheduled').length;

    setStats({
      totalCompleted: completed,
      todayTasks: todaysOrders.length,
      inProgress: inProgress,
      pending: pending
    });
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': { variant: 'success', text: 'Hoàn thành', icon: <FiCheckCircle /> },
      'in-progress': { variant: 'primary', text: 'Đang thực hiện', icon: <FiTool /> },
      'scheduled': { variant: 'info', text: 'Đã lên lịch', icon: <FiCalendar /> },
      'pending': { variant: 'warning', text: 'Chờ xử lý', icon: <FiClock /> },
      'cancelled': { variant: 'danger', text: 'Đã hủy', icon: <FiAlertCircle /> }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <Badge bg={config.variant} className="status-badge">
        {config.icon} {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'high': { variant: 'danger', text: 'Cao' },
      'normal': { variant: 'primary', text: 'Thường' },
      'low': { variant: 'secondary', text: 'Thấp' }
    };

    const config = priorityConfig[priority] || priorityConfig['normal'];
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  // Calculate performance metrics
  const completionRate = allOrders.length > 0 
    ? ((stats.totalCompleted / allOrders.length) * 100).toFixed(1) 
    : 0;

  const avgRating = allOrders.filter(o => o.customerRating).length > 0
    ? (allOrders.filter(o => o.customerRating).reduce((sum, o) => sum + o.customerRating, 0) / 
       allOrders.filter(o => o.customerRating).length).toFixed(1)
    : 0;

  // Calculate on-time completion rate
  const onTimeOrders = allOrders.filter(o => 
    o.status === 'completed' && 
    o.actualDuration <= o.estimatedDuration
  ).length;
  const onTimeRate = stats.totalCompleted > 0 
    ? ((onTimeOrders / stats.totalCompleted) * 100).toFixed(1) 
    : 0;

  return (
    <div className="technician-dashboard">
      <Container fluid>
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h2>Dashboard Nhân viên</h2>
            <p className="text-muted">Chào buổi sáng! Bắt đầu ngày làm việc của bạn.</p>
          </div>
          <div className="header-date">
            <FiCalendar size={20} />
            <span>{new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} sm={6} className="mb-3">
            <Card className="stats-card stats-completed">
              <Card.Body>
                <div className="stats-icon">
                  <FiCheckCircle size={32} />
                </div>
                <div className="stats-content">
                  <h3>{stats.totalCompleted}</h3>
                  <p>Công việc hoàn thành</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6} className="mb-3">
            <Card className="stats-card stats-today">
              <Card.Body>
                <div className="stats-icon">
                  <FiCalendar size={32} />
                </div>
                <div className="stats-content">
                  <h3>{stats.todayTasks}</h3>
                  <p>Công việc hôm nay</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6} className="mb-3">
            <Card className="stats-card stats-progress">
              <Card.Body>
                <div className="stats-icon">
                  <FiTool size={32} />
                </div>
                <div className="stats-content">
                  <h3>{stats.inProgress}</h3>
                  <p>Đang thực hiện</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6} className="mb-3">
            <Card className="stats-card stats-pending">
              <Card.Body>
                <div className="stats-icon">
                  <FiClock size={32} />
                </div>
                <div className="stats-content">
                  <h3>{stats.pending}</h3>
                  <p>Chờ xử lý</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Performance Metrics */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className="performance-card">
              <Card.Body>
                <div className="card-title-section">
                  <h5><FiTrendingUp /> Hiệu suất làm việc</h5>
                </div>
                
                <Row className="mt-3">
                  <Col md={4}>
                    <div className="metric-item">
                      <div className="metric-header">
                        <span>Tỷ lệ hoàn thành</span>
                        <strong>{completionRate}%</strong>
                      </div>
                      <ProgressBar 
                        now={completionRate} 
                        variant="success" 
                        className="mt-2"
                      />
                      <small className="text-muted">{stats.totalCompleted}/{allOrders.length} công việc</small>
                    </div>
                  </Col>

                  <Col md={4}>
                    <div className="metric-item">
                      <div className="metric-header">
                        <span>Đánh giá trung bình</span>
                        <strong className="rating-value">
                          <FiAward className="me-1" />
                          {avgRating}/5.0
                        </strong>
                      </div>
                      <ProgressBar 
                        now={(avgRating / 5) * 100} 
                        variant="warning" 
                        className="mt-2"
                      />
                      <small className="text-muted">
                        {allOrders.filter(o => o.customerRating).length} đánh giá
                      </small>
                    </div>
                  </Col>

                  <Col md={4}>
                    <div className="metric-item">
                      <div className="metric-header">
                        <span>Hoàn thành đúng giờ</span>
                        <strong>{onTimeRate}%</strong>
                      </div>
                      <ProgressBar 
                        now={onTimeRate} 
                        variant="info" 
                        className="mt-2"
                      />
                      <small className="text-muted">{onTimeOrders}/{stats.totalCompleted} công việc</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Today's Tasks */}
        <Row>
          <Col md={12}>
            <Card className="tasks-card">
              <Card.Body>
                <div className="card-title-section">
                  <h5><FiCalendar /> Công việc hôm nay ({todayTasks.length})</h5>
                </div>

                {todayTasks.length === 0 ? (
                  <div className="empty-state">
                    <FiCheckCircle size={48} />
                    <p>Không có công việc nào cho hôm nay</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="tasks-table">
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Khách hàng</th>
                          <th>Dịch vụ</th>
                          <th>Thời gian</th>
                          <th>Ưu tiên</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayTasks.map(task => (
                          <tr key={task.id}>
                            <td>
                              <strong>{task.orderNumber}</strong>
                            </td>
                            <td>
                              <div className="customer-info">
                                <FiUser className="me-1" />
                                Khách hàng #{task.customerId}
                              </div>
                            </td>
                            <td>
                              <span className="service-count">
                                {task.serviceIds.length} dịch vụ
                              </span>
                            </td>
                            <td>
                              <div className="time-info">
                                <FiClock className="me-1" />
                                {task.scheduledTime}
                                <small className="d-block text-muted">
                                  ~{task.estimatedDuration} phút
                                </small>
                              </div>
                            </td>
                            <td>
                              {getPriorityBadge(task.priority)}
                            </td>
                            <td>
                              {getStatusBadge(task.status)}
                            </td>
                            <td>
                              <button className="btn btn-sm btn-primary">
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Completed Jobs (Last 5) */}
        <Row className="mt-4">
          <Col md={12}>
            <Card className="recent-jobs-card">
              <Card.Body>
                <div className="card-title-section">
                  <h5><FiCheckCircle /> Công việc hoàn thành gần đây</h5>
                </div>

                <div className="table-responsive">
                  <Table hover className="recent-jobs-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Ngày hoàn thành</th>
                        <th>Dịch vụ</th>
                        <th>Thời gian thực tế</th>
                        <th>Đánh giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders
                        .filter(o => o.status === 'completed')
                        .slice(0, 5)
                        .map(job => (
                          <tr key={job.id}>
                            <td><strong>{job.orderNumber}</strong></td>
                            <td>
                              {new Date(job.completedDate).toLocaleDateString('vi-VN')}
                              <small className="d-block text-muted">{job.completedTime}</small>
                            </td>
                            <td>{job.serviceIds.length} dịch vụ</td>
                            <td>
                              <span className={job.actualDuration <= job.estimatedDuration ? 'text-success' : 'text-warning'}>
                                {job.actualDuration} phút
                              </span>
                              {job.actualDuration <= job.estimatedDuration && (
                                <small className="d-block text-success">✓ Đúng giờ</small>
                              )}
                            </td>
                            <td>
                              {job.customerRating ? (
                                <div className="rating-stars">
                                  {'★'.repeat(job.customerRating)}
                                  {'☆'.repeat(5 - job.customerRating)}
                                </div>
                              ) : (
                                <span className="text-muted">Chưa đánh giá</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TechnicianDashboard;

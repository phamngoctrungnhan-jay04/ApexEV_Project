import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, Table, Pagination, Modal } from 'react-bootstrap';
import {
  FiClock,
  FiTool,
  FiTruck,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiFilter,
  FiSearch,
  FiEye,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { CustomButton, CustomInput } from '../../components/common';
import { 
  orders, 
  vehicles, 
  technicians, 
  services,
  invoices,
  getOrdersByCustomer,
  getCompletedOrders,
} from '../../mockData';
import './History.css';

function History() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  // Simulate logged-in customer
  const currentCustomerId = 1;

  // States
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // Get customer orders
  const customerOrders = getOrdersByCustomer(currentCustomerId, orders);

  // Filter orders
  const filteredOrders = customerOrders
    .filter(order => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (searchQuery) {
        const vehicle = vehicles.find(v => v.id === order.vehicleId);
        const service = services.find(s => s.id === order.serviceIds[0]);
        const searchLower = searchQuery.toLowerCase();
        return (
          order.orderNumber.toLowerCase().includes(searchLower) ||
          vehicle?.licensePlate.toLowerCase().includes(searchLower) ||
          service?.name.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'warning', text: 'Chờ xử lý', icon: <FiClock /> },
      confirmed: { bg: 'info', text: 'Đã xác nhận', icon: <FiCheckCircle /> },
      'in-progress': { bg: 'primary', text: 'Đang thực hiện', icon: <FiTool /> },
      completed: { bg: 'success', text: 'Hoàn thành', icon: <FiCheckCircle /> },
      cancelled: { bg: 'danger', text: 'Đã hủy', icon: <FiXCircle /> },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Badge bg={statusInfo.bg} className="d-flex align-items-center gap-1">
        {statusInfo.icon}
        {statusInfo.text}
      </Badge>
    );
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Download invoice
  const downloadInvoice = (orderId) => {
    // TODO: Implement invoice download
    console.log('Download invoice for order:', orderId);
    alert('Tính năng tải xuống hóa đơn sẽ được triển khai sau!');
  };

  return (
    <div className="history-page">
      <Container fluid>
        {/* Page Header */}
        <div className="page-header mb-4">
          <h2>
            <FiFileText className="me-2" />
            Lịch sử bảo dưỡng
          </h2>
          <p className="text-muted">
            Theo dõi toàn bộ lịch sử bảo dưỡng và dịch vụ của bạn
          </p>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-info">
                  <FiCheckCircle className="stat-icon text-success" />
                  <div>
                    <div className="stat-value">
                      {customerOrders.filter(o => o.status === 'completed').length}
                    </div>
                    <div className="stat-label">Đã hoàn thành</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-info">
                  <FiClock className="stat-icon text-warning" />
                  <div>
                    <div className="stat-value">
                      {customerOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}
                    </div>
                    <div className="stat-label">Sắp tới</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-info">
                  <FiTool className="stat-icon text-primary" />
                  <div>
                    <div className="stat-value">
                      {customerOrders.filter(o => o.status === 'in-progress').length}
                    </div>
                    <div className="stat-label">Đang thực hiện</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-info">
                  <FiXCircle className="stat-icon text-danger" />
                  <div>
                    <div className="stat-value">
                      {customerOrders.filter(o => o.status === 'cancelled').length}
                    </div>
                    <div className="stat-label">Đã hủy</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FiSearch className="me-2" />
                    Tìm kiếm
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Tìm theo mã đơn, biển số xe, dịch vụ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <FiFilter className="me-2" />
                    Trạng thái
                  </Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="in-progress">Đang thực hiện</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <CustomButton
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Xóa bộ lọc
                </CustomButton>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Orders Table */}
        <Card className="orders-card">
          <Card.Body>
            {currentOrders.length > 0 ? (
              <>
                <div className="table-responsive">
                  <Table hover className="orders-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Ngày</th>
                        <th>Xe</th>
                        <th>Dịch vụ</th>
                        <th>Kỹ thuật viên</th>
                        <th>Trạng thái</th>
                        <th>Chi phí</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.map(order => {
                        const vehicle = vehicles.find(v => v.id === order.vehicleId);
                        const tech = technicians.find(t => t.id === order.technicianId);
                        const service = services.find(s => s.id === order.serviceIds[0]);
                        const invoice = invoices.find(inv => inv.orderId === order.id);

                        return (
                          <tr key={order.id}>
                            <td>
                              <strong>{order.orderNumber}</strong>
                            </td>
                            <td>
                              <FiCalendar className="me-1" />
                              {new Date(order.scheduledDate).toLocaleDateString('vi-VN')}
                              <br />
                              <small className="text-muted">
                                <FiClock className="me-1" />
                                {order.scheduledTime}
                              </small>
                            </td>
                            <td>
                              <FiTruck className="me-1" />
                              {vehicle?.brand} {vehicle?.model}
                              <br />
                              <small className="text-muted">{vehicle?.licensePlate}</small>
                            </td>
                            <td>
                              <FiTool className="me-1" />
                              {currentLang === 'en' ? service?.nameEn : service?.name}
                              {order.serviceIds.length > 1 && (
                                <Badge bg="info" className="ms-1">
                                  +{order.serviceIds.length - 1}
                                </Badge>
                              )}
                            </td>
                            <td>
                              <FiUser className="me-1" />
                              {tech?.fullName || 'Chưa phân công'}
                            </td>
                            <td>{getStatusBadge(order.status)}</td>
                            <td>
                              <strong>{formatCurrency(order.totalAmount)}</strong>
                              <br />
                              {invoice && (
                                <Badge bg={invoice.status === 'paid' ? 'success' : 'warning'} className="mt-1">
                                  {invoice.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </Badge>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <CustomButton
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => viewOrderDetails(order)}
                                >
                                  <FiEye />
                                </CustomButton>
                                {invoice && invoice.status === 'paid' && (
                                  <CustomButton
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => downloadInvoice(order.id)}
                                  >
                                    <FiDownload />
                                  </CustomButton>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.First 
                        onClick={() => setCurrentPage(1)} 
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                          key={index + 1}
                          active={currentPage === index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last 
                        onClick={() => setCurrentPage(totalPages)} 
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <FiFileText size={64} className="text-muted mb-3" />
                <h5 className="text-muted">Không tìm thấy kết quả</h5>
                <p className="text-muted">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Order Detail Modal */}
        <Modal 
          show={showDetailModal} 
          onHide={() => setShowDetailModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết đơn hàng</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (() => {
              const vehicle = vehicles.find(v => v.id === selectedOrder.vehicleId);
              const tech = technicians.find(t => t.id === selectedOrder.technicianId);
              const invoice = invoices.find(inv => inv.orderId === selectedOrder.id);

              return (
                <div className="order-detail">
                  <Row className="mb-3">
                    <Col md={6}>
                      <h6 className="text-muted">Mã đơn hàng</h6>
                      <p className="mb-0"><strong>{selectedOrder.orderNumber}</strong></p>
                    </Col>
                    <Col md={6}>
                      <h6 className="text-muted">Trạng thái</h6>
                      {getStatusBadge(selectedOrder.status)}
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <h6 className="text-muted">Ngày hẹn</h6>
                      <p className="mb-0">
                        {new Date(selectedOrder.scheduledDate).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </Col>
                    <Col md={6}>
                      <h6 className="text-muted">Giờ hẹn</h6>
                      <p className="mb-0">{selectedOrder.scheduledTime}</p>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <h6 className="text-muted">Xe</h6>
                      <p className="mb-0">
                        <strong>{vehicle?.brand} {vehicle?.model} ({vehicle?.year})</strong>
                        <br />
                        Biển số: {vehicle?.licensePlate}
                      </p>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <h6 className="text-muted">Dịch vụ</h6>
                      {selectedOrder.serviceIds.map(serviceId => {
                        const service = services.find(s => s.id === serviceId);
                        return (
                          <div key={serviceId} className="mb-2">
                            <FiCheckCircle className="text-success me-2" />
                            {currentLang === 'en' ? service?.nameEn : service?.name}
                          </div>
                        );
                      })}
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <h6 className="text-muted">Kỹ thuật viên</h6>
                      <p className="mb-0">{tech?.fullName || 'Chưa phân công'}</p>
                    </Col>
                  </Row>

                  {selectedOrder.notes && (
                    <Row className="mb-3">
                      <Col>
                        <h6 className="text-muted">Ghi chú</h6>
                        <p className="mb-0">{selectedOrder.notes}</p>
                      </Col>
                    </Row>
                  )}

                  {selectedOrder.internalNotes && (
                    <Row className="mb-3">
                      <Col>
                        <h6 className="text-muted">Ghi chú nội bộ</h6>
                        <p className="mb-0 text-muted">{selectedOrder.internalNotes}</p>
                      </Col>
                    </Row>
                  )}

                  <hr />

                  <Row>
                    <Col md={6}>
                      <h6 className="text-muted">Tổng chi phí</h6>
                      <h4 className="text-primary mb-0">{formatCurrency(selectedOrder.totalAmount)}</h4>
                    </Col>
                    {invoice && (
                      <Col md={6}>
                        <h6 className="text-muted">Thanh toán</h6>
                        <Badge bg={invoice.status === 'paid' ? 'success' : 'warning'} className="fs-6">
                          {invoice.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </Badge>
                      </Col>
                    )}
                  </Row>
                </div>
              );
            })()}
          </Modal.Body>
          <Modal.Footer>
            <CustomButton variant="outline-secondary" onClick={() => setShowDetailModal(false)}>
              Đóng
            </CustomButton>
            {selectedOrder && invoices.find(inv => inv.orderId === selectedOrder.id)?.status === 'paid' && (
              <CustomButton 
                variant="success" 
                onClick={() => downloadInvoice(selectedOrder.id)}
              >
                <FiDownload className="me-2" />
                Tải hóa đơn
              </CustomButton>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default History;

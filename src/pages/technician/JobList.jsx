import { FaCar } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Form, Button, Modal, InputGroup } from 'react-bootstrap';
import { 
  FiSearch, FiFilter, FiCheckCircle, FiClock, FiAlertCircle, 
  FiTool, FiCalendar, FiUser, FiMapPin, FiPhone, FiMail,
  FiTruck, FiPackage, FiDollarSign, FiFileText, FiX
} from 'react-icons/fi';
import { getOrdersByTechnician } from '../../mockData';
import './JobList.css';

const JobList = () => {
  const currentTechnicianId = 1; // Mock current logged-in technician
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;

  useEffect(() => {
    // Load all jobs for this technician
    const jobs = getOrdersByTechnician(currentTechnicianId);
    setAllJobs(jobs);
    setFilteredJobs(jobs);
  }, []);

  // Filter and search jobs
  useEffect(() => {
    let result = [...allJobs];

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(job => job.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      result = result.filter(job => job.priority === priorityFilter);
    }

    // Search
    if (searchTerm) {
      result = result.filter(job => 
        job.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.internalNotes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(result);
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, searchTerm, allJobs]);

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleViewDetail = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedJob(null);
  };

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
      'high': { variant: 'danger', text: 'Cao', icon: '🔴' },
      'normal': { variant: 'primary', text: 'Thường', icon: '🔵' },
      'low': { variant: 'secondary', text: 'Thấp', icon: '⚪' }
    };

    const config = priorityConfig[priority] || priorityConfig['normal'];
    return (
      <Badge bg={config.variant} className="priority-badge">
        {config.icon} {config.text}
      </Badge>
    );
  };

  // Stats for filter badges
  const stats = {
    all: allJobs.length,
    pending: allJobs.filter(j => j.status === 'pending').length,
    scheduled: allJobs.filter(j => j.status === 'scheduled').length,
    'in-progress': allJobs.filter(j => j.status === 'in-progress').length,
    completed: allJobs.filter(j => j.status === 'completed').length,
    cancelled: allJobs.filter(j => j.status === 'cancelled').length
  };

  return (
    <div className="job-list-page">
      <Container fluid>
        {/* Header */}
        <div className="page-header">
          <div>
            <h2>Danh sách công việc</h2>
            <p className="text-muted">Quản lý và theo dõi tất cả công việc của bạn</p>
          </div>
          <div className="header-stats">
            <span className="stat-item">
              <strong>{filteredJobs.length}</strong> công việc
            </span>
          </div>
        </div>

        {/* Filters */}
        <Card className="filters-card mb-4">
          <Card.Body>
            <Row className="align-items-end">
              {/* Search */}
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Label className="filter-label">
                  <FiSearch /> Tìm kiếm
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Mã đơn, ghi chú..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setSearchTerm('')}
                    >
                      <FiX />
                    </Button>
                  )}
                </InputGroup>
              </Col>

              {/* Status Filter */}
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Label className="filter-label">
                  <FiFilter /> Trạng thái
                </Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tất cả ({stats.all})</option>
                  <option value="pending">Chờ xử lý ({stats.pending})</option>
                  <option value="scheduled">Đã lên lịch ({stats.scheduled})</option>
                  <option value="in-progress">Đang thực hiện ({stats['in-progress']})</option>
                  <option value="completed">Hoàn thành ({stats.completed})</option>
                  <option value="cancelled">Đã hủy ({stats.cancelled})</option>
                </Form.Select>
              </Col>

              {/* Priority Filter */}
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Label className="filter-label">
                  <FiFilter /> Độ ưu tiên
                </Form.Label>
                <Form.Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="high">Cao</option>
                  <option value="normal">Thường</option>
                  <option value="low">Thấp</option>
                </Form.Select>
              </Col>
            </Row>

            {/* Active Filters Display */}
            {(statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm) && (
              <div className="active-filters mt-3">
                <span className="filter-label-text">Bộ lọc đang dùng:</span>
                {statusFilter !== 'all' && (
                  <Badge bg="info" className="me-2">
                    Trạng thái: {statusFilter}
                    <FiX 
                      className="ms-1 cursor-pointer" 
                      onClick={() => setStatusFilter('all')}
                    />
                  </Badge>
                )}
                {priorityFilter !== 'all' && (
                  <Badge bg="warning" className="me-2">
                    Ưu tiên: {priorityFilter}
                    <FiX 
                      className="ms-1 cursor-pointer" 
                      onClick={() => setPriorityFilter('all')}
                    />
                  </Badge>
                )}
                {searchTerm && (
                  <Badge bg="secondary" className="me-2">
                    Tìm kiếm: "{searchTerm}"
                    <FiX 
                      className="ms-1 cursor-pointer" 
                      onClick={() => setSearchTerm('')}
                    />
                  </Badge>
                )}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Jobs Table */}
        <Card className="jobs-table-card">
          <Card.Body>
            {currentJobs.length === 0 ? (
              <div className="empty-state">
                <FiFileText size={48} />
                <p>Không tìm thấy công việc nào</p>
                <small className="text-muted">Thử thay đổi bộ lọc hoặc tìm kiếm</small>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover className="jobs-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Dịch vụ</th>
                        <th>Ngày hẹn</th>
                        <th>Thời gian</th>
                        <th>Ưu tiên</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentJobs.map(job => (
                        <tr key={job.id}>
                          <td>
                            <strong className="order-number">{job.orderNumber}</strong>
                          </td>
                          <td>
                            <div className="customer-info">
                              <FiUser className="me-1" />
                              Khách #{job.customerId}
                            </div>
                          </td>
                          <td>
                            <span className="service-count">
                              {job.serviceIds.length} dịch vụ
                            </span>
                          </td>
                          <td>
                            <div className="date-info">
                              <FiCalendar className="me-1" />
                              {new Date(job.scheduledDate).toLocaleDateString('vi-VN')}
                            </div>
                          </td>
                          <td>
                            <div className="time-info">
                              <FiClock className="me-1" />
                              {job.scheduledTime}
                              <small className="d-block text-muted">
                                ~{job.estimatedDuration} phút
                              </small>
                            </div>
                          </td>
                          <td>
                            {getPriorityBadge(job.priority)}
                          </td>
                          <td>
                            {getStatusBadge(job.status)}
                          </td>
                          <td>
                            <Button 
                              size="sm" 
                              variant="primary"
                              onClick={() => handleViewDetail(job)}
                            >
                              Chi tiết
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-wrapper">
                    <div className="pagination-info">
                      Hiển thị {indexOfFirstJob + 1} - {Math.min(indexOfLastJob, filteredJobs.length)} trong tổng số {filteredJobs.length} công việc
                    </div>
                    <div className="pagination-controls">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        // Show first, last, current, and adjacent pages
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? 'primary' : 'outline-primary'}
                              size="sm"
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                        }
                        return null;
                      })}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {/* Job Detail Modal */}
        <Modal 
          show={showDetailModal} 
          onHide={handleCloseModal}
          size="lg"
          centered
          className="job-detail-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết công việc</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedJob && (
              <div className="job-detail-content">
                {/* Header Info */}
                <div className="detail-header">
                  <div className="detail-title">
                    <h4>{selectedJob.orderNumber}</h4>
                    <div className="detail-badges">
                      {getStatusBadge(selectedJob.status)}
                      {getPriorityBadge(selectedJob.priority)}
                    </div>
                  </div>
                </div>

                <Row className="mt-4">
                  {/* Left Column - Job Info */}
                  <Col md={6}>
                    <div className="info-section">
                      <h6 className="section-title">
                        <FiCalendar /> Thông tin lịch hẹn
                      </h6>
                      <div className="info-item">
                        <span className="label">Ngày hẹn:</span>
                        <span className="value">
                          {new Date(selectedJob.scheduledDate).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">Giờ hẹn:</span>
                        <span className="value">{selectedJob.scheduledTime}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Thời gian ước tính:</span>
                        <span className="value">{selectedJob.estimatedDuration} phút</span>
                      </div>
                      {selectedJob.status === 'completed' && (
                        <>
                          <div className="info-item">
                            <span className="label">Thời gian thực tế:</span>
                            <span className={`value ${selectedJob.actualDuration <= selectedJob.estimatedDuration ? 'text-success' : 'text-warning'}`}>
                              {selectedJob.actualDuration} phút
                              {selectedJob.actualDuration <= selectedJob.estimatedDuration && ' ✓'}
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="label">Hoàn thành lúc:</span>
                            <span className="value">
                              {new Date(selectedJob.completedDate).toLocaleDateString('vi-VN')} {selectedJob.completedTime}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="info-section mt-3">
                      <h6 className="section-title">
                        <FiUser /> Thông tin khách hàng
                      </h6>
                      <div className="info-item">
                        <span className="label">Mã khách hàng:</span>
                        <span className="value">#{selectedJob.customerId}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Xe:</span>
                        <span className="value">
                          <FaCar className="me-1" />
                          Xe #{selectedJob.vehicleId}
                        </span>
                      </div>
                    </div>
                  </Col>

                  {/* Right Column - Service & Payment */}
                  <Col md={6}>
                    <div className="info-section">
                      <h6 className="section-title">
                        <FiPackage /> Dịch vụ
                      </h6>
                      <div className="service-list">
                        {selectedJob.serviceIds.map((serviceId, index) => (
                          <div key={index} className="service-item">
                            <FiCheckCircle className="me-2 text-success" />
                            Dịch vụ #{serviceId}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="info-section mt-3">
                      <h6 className="section-title">
                        <FiDollarSign /> Thanh toán
                      </h6>
                      <div className="info-item">
                        <span className="label">Tổng tiền:</span>
                        <span className="value fw-bold">
                          {selectedJob.totalAmount?.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">Đã thanh toán:</span>
                        <span className="value">
                          {selectedJob.paidAmount?.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">Trạng thái:</span>
                        <Badge bg={selectedJob.paymentStatus === 'paid' ? 'success' : 'warning'}>
                          {selectedJob.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </Badge>
                      </div>
                      {selectedJob.paymentMethod && (
                        <div className="info-item">
                          <span className="label">Phương thức:</span>
                          <span className="value">{selectedJob.paymentMethod}</span>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Notes */}
                {(selectedJob.notes || selectedJob.internalNotes) && (
                  <div className="info-section mt-3">
                    <h6 className="section-title">
                      <FiFileText /> Ghi chú
                    </h6>
                    {selectedJob.notes && (
                      <div className="note-item">
                        <strong>Ghi chú khách hàng:</strong>
                        <p>{selectedJob.notes}</p>
                      </div>
                    )}
                    {selectedJob.internalNotes && (
                      <div className="note-item">
                        <strong>Ghi chú nội bộ:</strong>
                        <p>{selectedJob.internalNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Rating */}
                {selectedJob.customerRating && (
                  <div className="info-section mt-3">
                    <h6 className="section-title">Đánh giá</h6>
                    <div className="rating-display">
                      {'★'.repeat(selectedJob.customerRating)}
                      {'☆'.repeat(5 - selectedJob.customerRating)}
                      <span className="ms-2">({selectedJob.customerRating}/5)</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Đóng
            </Button>
            {selectedJob?.status === 'scheduled' && (
              <Button variant="primary">
                Bắt đầu công việc
              </Button>
            )}
            {selectedJob?.status === 'in-progress' && (
              <Button variant="success">
                Cập nhật tiến độ
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default JobList;

// File: src/pages/advisor/AdvisorAppointments.jsx
// Trang quản lý lịch hẹn cho Advisor - Modern Table UI

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiClock, FiCalendar, FiSearch, FiFilter, FiRefreshCw, FiUserPlus, FiX, FiPhone, FiMail, FiUser } from 'react-icons/fi';
import AdvisorLayout from './AdvisorLayout';
import './AdvisorAppointments.css';
import appointmentService from '../../services/appointmentService';
import { services as serviceList } from '../../mockData/services';

function AdvisorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState(''); // Filter theo ngày
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [advisorNotes, setAdvisorNotes] = useState(''); // Ghi chú của cố vấn
  const [successMessage, setSuccessMessage] = useState(''); // Thông báo thành công

  // Hàm lấy tổng giá dịch vụ từ tên dịch vụ
  function getTotalServicePrice(requestedService) {
    if (!requestedService) return 0;
    let names = Array.isArray(requestedService) ? requestedService : [requestedService];
    let allNames = [];
    names.forEach(name => {
      if (typeof name === 'string' && name.includes(',')) {
        allNames.push(...name.split(',').map(item => item.trim()));
      } else if (typeof name === 'string') {
        allNames.push(name.trim());
      }
    });
    let total = 0;
    allNames.forEach(n => {
      const found = serviceList.find(s => s.name === n);
      if (found) total += found.basePrice;
    });
    return total;
  }

  // Chuyển mảng [2025,12,13,8,0] thành Date object
  function formatAppointmentTime(arr) {
    if (Array.isArray(arr) && arr.length >= 5) {
      return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]);
    }
    if (typeof arr === 'string') {
      return new Date(arr);
    }
    return null;
  }

  // Fetch appointments - cả pending và confirmed
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Fetch cả 2 loại: pending và history (confirmed)
      const [pendingData, historyData] = await Promise.all([
        appointmentService.getPendingAppointments(),
        appointmentService.getMyAdvisorAppointments()
      ]);
      
      // Gộp 2 list, loại bỏ trùng lặp theo id
      const allAppointments = [...pendingData];
      historyData.forEach(histApp => {
        if (!allAppointments.find(a => a.id === histApp.id)) {
          allAppointments.push(histApp);
        }
      });
      
      // Sort theo appointmentTime giảm dần (mới nhất trước)
      allAppointments.sort((a, b) => {
        const dateA = formatAppointmentTime(a.appointmentTime);
        const dateB = formatAppointmentTime(b.appointmentTime);
        return dateB - dateA;
      });
      
      setAppointments(allAppointments);
      setError('');
    } catch (err) {
      console.error('Fetch appointments error:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Xác nhận lịch hẹn (sau khi đã assign technician)
  const handleConfirm = async (id) => {
    try {
      setProcessingId(id);
      await appointmentService.confirmAppointment(id);
      await fetchAppointments();
    } catch (err) {
      setError('Xác nhận thất bại: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Từ chối lịch hẹn
  const handleReject = async (id) => {
    if (!window.confirm('Bạn có chắc muốn từ chối lịch hẹn này?')) return;
    try {
      setProcessingId(id);
      await appointmentService.cancelAppointment(id);
      await fetchAppointments();
    } catch (err) {
      setError('Từ chối thất bại: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Lọc appointments
  const filteredAppointments = appointments.filter(app => {
    const matchSearch = !searchTerm || 
      (app.customerFullName && app.customerFullName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = filterStatus === 'all' || app.status === filterStatus;
    
    // Filter theo ngày
    let matchDate = true;
    if (filterDate) {
      const appDate = formatAppointmentTime(app.appointmentTime);
      if (appDate instanceof Date && !isNaN(appDate)) {
        const appDateStr = appDate.toISOString().split('T')[0]; // YYYY-MM-DD
        matchDate = appDateStr === filterDate;
      }
    }
    
    return matchSearch && matchStatus && matchDate;
  });

  // Mở modal assign technician
  const handleOpenAssignModal = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowAssignModal(true);
    setLoadingTechnicians(true);
    try {
      const techList = await appointmentService.getTechniciansWithWorkload();
      setTechnicians(techList);
    } catch {
      setError('Không thể tải danh sách kỹ thuật viên');
    } finally {
      setLoadingTechnicians(false);
    }
  };

  // Đóng modal
  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedAppointment(null);
    setTechnicians([]);
    setAdvisorNotes(''); // Reset ghi chú
  };

  // Assign technician (bước 2 trong workflow)
  const handleAssignTechnician = async (technicianId, technicianName) => {
    if (!selectedAppointment) return;
    setAssigning(true);
    try {
      const result = await appointmentService.assignTechnician(selectedAppointment.id, technicianId, advisorNotes);
      
      // Cập nhật local state với thông tin từ response
      setAppointments(prev => prev.map(app => 
        app.id === selectedAppointment.id 
          ? { 
              ...app, 
              status: 'CONFIRMED', // Backend đã set status CONFIRMED
              assignedTechnicianId: result.assignedTechnicianId || technicianId, 
              assignedTechnicianName: result.assignedTechnicianName || technicianName 
            }
          : app
      ));
      
      handleCloseAssignModal();
      
      // Hiển thị thông báo thành công
      setSuccessMessage(`✓ Đã phân công ${technicianName} thành công! Trạng thái đơn đã chuyển sang "Đã xác nhận".`);
      
      // Tự động ẩn thông báo sau 5 giây
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Phân công thất bại: ' + err.message);
    } finally {
      setAssigning(false);
    }
  };

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  return (
    <AdvisorLayout onLogout={handleLogout}>
      <div className="advisor-appointments-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1><FiCalendar /> Quản lý lịch hẹn</h1>
            <p>Xem và quản lý tất cả lịch hẹn bảo dưỡng xe điện</p>
          </div>
          <button className="btn-refresh" onClick={fetchAppointments} disabled={loading}>
            <FiRefreshCw className={loading ? 'spin' : ''} />
            Làm mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-row">
          <div className="stat-box pending">
            <FiClock />
            <div>
              <span className="stat-number">{appointments.filter(a => a.status === 'PENDING').length}</span>
              <span className="stat-text">Chờ xác nhận</span>
            </div>
          </div>
          <div className="stat-box confirmed">
            <FiCheckCircle />
            <div>
              <span className="stat-number">{appointments.filter(a => a.status === 'CONFIRMED').length}</span>
              <span className="stat-text">Đã xác nhận</span>
            </div>
          </div>
          <div className="stat-box total">
            <FiCalendar />
            <div>
              <span className="stat-number">{appointments.length}</span>
              <span className="stat-text">Tổng cộng</span>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="success-toast">
            <FiCheckCircle />
            <span>{successMessage}</span>
            <button className="close-toast" onClick={() => setSuccessMessage('')}>×</button>
          </div>
        )}

        {/* Filters */}
        <div className="filters-row">
          <div className="search-input">
            <FiSearch />
            <input
              type="text"
              placeholder="Tìm theo tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="date-filter">
            <FiCalendar />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="date-input"
            />
            {filterDate && (
              <button 
                className="clear-date-btn"
                onClick={() => setFilterDate('')}
                title="Xóa bộ lọc ngày"
              >
                ✕
              </button>
            )}
          </div>
          <div className="filter-select">
            <FiFilter />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="table-container">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <span>Đang tải dữ liệu...</span>
            </div>
          )}

          {error && (
            <div className="error-state">
              <span>{error}</span>
              <button onClick={fetchAppointments}>Thử lại</button>
            </div>
          )}

          {!loading && !error && filteredAppointments.length === 0 && (
            <div className="empty-state">
              <FiCalendar />
              <h3>Không có lịch hẹn nào</h3>
              <p>Chưa có lịch hẹn nào phù hợp với bộ lọc của bạn</p>
            </div>
          )}

          {!loading && !error && filteredAppointments.length > 0 && (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Ngày hẹn</th>
                  <th>Dịch vụ</th>
                  <th>Giá dự kiến</th>
                  <th>Kỹ thuật viên</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(app => {
                  let serviceNames = Array.isArray(app.requestedService) 
                    ? app.requestedService 
                    : [app.requestedService];
                  const totalPrice = getTotalServicePrice(serviceNames);
                  const appointmentDate = formatAppointmentTime(app.appointmentTime);
                  const hasAssignedTech = app.assignedTechnicianId || app.assignedTechnicianName;

                  // Format services display
                  const servicesDisplay = serviceNames.flatMap(name => {
                    if (typeof name === 'string' && name.includes(',')) {
                      return name.split(',').map(item => item.trim());
                    }
                    return [name];
                  });

                  return (
                    <tr key={app.id} className={app.status.toLowerCase()}>
                      {/* Customer Info */}
                      <td>
                        <div className="customer-cell">
                          <div className="avatar">{app.customerFullName?.charAt(0) || '?'}</div>
                          <div className="customer-info">
                            <span className="name">{app.customerFullName || 'N/A'}</span>
                            <span className="contact">
                              <FiPhone /> {app.customerPhone || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td>
                        <div className="datetime-cell">
                          <span className="date">
                            {appointmentDate ? appointmentDate.toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                          <span className="time">
                            {appointmentDate ? appointmentDate.toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''}
                          </span>
                        </div>
                      </td>

                      {/* Services */}
                      <td>
                        <div className="services-cell">
                          {servicesDisplay.slice(0, 2).map((name, idx) => (
                            <span key={idx} className="service-tag">{name}</span>
                          ))}
                          {servicesDisplay.length > 2 && (
                            <span className="service-more">+{servicesDisplay.length - 2}</span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td>
                        <span className="price-cell">{totalPrice.toLocaleString('vi-VN')}đ</span>
                      </td>

                      {/* Technician */}
                      <td>
                        {hasAssignedTech ? (
                          <div className="tech-cell assigned">
                            <FiUser />
                            <span>{app.assignedTechnicianName || 'KTV #' + app.assignedTechnicianId}</span>
                          </div>
                        ) : (
                          <span className="tech-cell unassigned">Chưa phân công</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-badge ${app.status.toLowerCase()}`}>
                          {app.status === 'CONFIRMED' ? (
                            <><FiCheckCircle /> Đã xác nhận</>
                          ) : (
                            <><FiClock /> Chờ xác nhận</>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="actions-cell">
                          {app.status === 'PENDING' && !hasAssignedTech && (
                            <>
                              <button
                                className="btn-action primary"
                                onClick={() => handleOpenAssignModal(app)}
                                disabled={processingId === app.id}
                                title="Phân công kỹ thuật viên"
                              >
                                <FiUserPlus />
                              </button>
                              <button
                                className="btn-action danger"
                                onClick={() => handleReject(app.id)}
                                disabled={processingId === app.id}
                                title="Từ chối"
                              >
                                <FiX />
                              </button>
                            </>
                          )}
                          
                          {app.status === 'PENDING' && hasAssignedTech && (
                            <>
                              <button
                                className="btn-action success"
                                onClick={() => handleConfirm(app.id)}
                                disabled={processingId === app.id}
                                title="Xác nhận"
                              >
                                <FiCheckCircle />
                              </button>
                              <button
                                className="btn-action secondary"
                                onClick={() => handleOpenAssignModal(app)}
                                disabled={processingId === app.id}
                                title="Đổi KTV"
                              >
                                <FiUserPlus />
                              </button>
                              <button
                                className="btn-action danger"
                                onClick={() => handleReject(app.id)}
                                disabled={processingId === app.id}
                                title="Từ chối"
                              >
                                <FiX />
                              </button>
                            </>
                          )}

                          {app.status === 'CONFIRMED' && (
                            <span className="completed-text">
                              <FiCheckCircle /> Hoàn tất
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Assign Technician Modal */}
        {showAssignModal && (
          <div className="modal-overlay" onClick={handleCloseAssignModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3><FiUserPlus /> Phân công kỹ thuật viên</h3>
                <button className="btn-close" onClick={handleCloseAssignModal}>
                  <FiX />
                </button>
              </div>

              <div className="modal-body">
                {selectedAppointment && (
                  <div className="selected-appointment">
                    <p><strong>Khách hàng:</strong> {selectedAppointment.customerFullName}</p>
                    <p><strong>Thời gian:</strong> {formatAppointmentTime(selectedAppointment.appointmentTime)?.toLocaleString('vi-VN')}</p>
                    <p><strong>Dịch vụ:</strong> {selectedAppointment.requestedService || 'N/A'}</p>
                  </div>
                )}

                {/* Ghi chú của cố vấn */}
                <div className="advisor-notes-section">
                  <label htmlFor="advisorNotes"><strong>Ghi chú cho kỹ thuật viên:</strong></label>
                  <textarea
                    id="advisorNotes"
                    className="advisor-notes-input"
                    placeholder="Nhập ghi chú, hướng dẫn cho kỹ thuật viên (nếu có)..."
                    value={advisorNotes}
                    onChange={(e) => setAdvisorNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {loadingTechnicians ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <span>Đang tải danh sách...</span>
                  </div>
                ) : (
                  <div className="technicians-list">
                    {technicians.length === 0 ? (
                      <p className="no-data">Không có kỹ thuật viên nào</p>
                    ) : (
                      technicians.map(tech => (
                        <div 
                          key={tech.userId} 
                          className={`tech-item ${tech.activeWorkCount >= 3 ? 'busy' : 'available'}`}
                        >
                          <div className="tech-avatar">
                            {tech.fullName?.charAt(0) || 'T'}
                          </div>
                          <div className="tech-details">
                            <h4>{tech.fullName}</h4>
                            <p><FiMail /> {tech.email}</p>
                            <div className="tech-status">
                              <span className="workload">{tech.activeWorkCount} công việc</span>
                              <span className={`availability ${tech.isAvailable ? 'available' : 'busy'}`}>
                                {tech.isAvailable ? 'Sẵn sàng' : 'Bận'}
                              </span>
                            </div>
                          </div>
                          <button
                            className="btn-select"
                            onClick={() => handleAssignTechnician(tech.userId, tech.fullName)}
                            disabled={assigning || !tech.isAvailable}
                          >
                            {assigning ? '...' : 'Chọn'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdvisorLayout>
  );
}

export default AdvisorAppointments;

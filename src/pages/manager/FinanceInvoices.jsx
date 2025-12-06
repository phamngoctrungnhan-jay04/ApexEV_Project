// File: src/pages/manager/FinanceInvoices.jsx
// Trang quản lý danh sách hóa đơn (APEX Modern UI)

import React, { useState, useEffect } from 'react';
import ManagerLayout from '../../components/layout/ManagerLayout';
import CustomAlert from '../../components/common/CustomAlert';
import CustomModal from '../../components/common/CustomModal';
import SearchBar from '../../components/common/SearchBar';
import {
  FiFileText,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiUser,

  FiDollarSign,
  FiAlertTriangle,
  FiClock,
  FiDownload,
  FiX,
  FiCheck
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import financeService from '../../services/financeService';
import './FinanceInvoices.css';

const FinanceInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'PENDING', label: 'Chờ thanh toán' },
    { value: 'CANCELLED', label: 'Đã hủy' }
  ];

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, startDate, endDate]);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, invoices]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : null,
        startDate: startDate || null,
        endDate: endDate || null
      };
      const data = await financeService.getAllInvoices(filters);
      setInvoices(data || []);
      setFilteredInvoices(data || []);
    } catch (error) {
      console.error('Fetch invoices error:', error);
      showAlert('danger', `Lỗi tải hóa đơn: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    if (!searchTerm.trim()) {
      setFilteredInvoices(invoices);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = invoices.filter(invoice =>
      invoice.id?.toString().includes(term) ||
      invoice.customerName?.toLowerCase().includes(term) ||
      invoice.customerEmail?.toLowerCase().includes(term) ||
      invoice.customerPhone?.includes(term) ||
      invoice.vehiclePlate?.toLowerCase().includes(term)
    );
    setFilteredInvoices(filtered);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, isOverdue) => {
    if (status === 'PENDING' && isOverdue) {
      return <span className="status-badge status-overdue"><FiAlertTriangle /> Quá hạn</span>;
    }
    const statusMap = {
      PAID: { label: 'Đã thanh toán', className: 'status-paid', icon: <FiCheckCircle /> },
      PENDING: { label: 'Chờ thanh toán', className: 'status-pending', icon: <FiClock /> },
      CANCELLED: { label: 'Đã hủy', className: 'status-cancelled', icon: <FiXCircle /> }
    };
    const statusInfo = statusMap[status] || { label: status, className: 'status-default', icon: null };
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.icon} {statusInfo.label}
      </span>
    );
  };

  // Handlers
  const handleViewDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const handleOpenConfirm = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentMethod('CASH');
    setShowConfirmModal(true);
  };

  const handleOpenCancel = (invoice) => {
    setSelectedInvoice(invoice);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedInvoice) return;

    try {
      await financeService.confirmPayment(selectedInvoice.id, paymentMethod);
      showAlert('success', 'Xác nhận thanh toán thành công!');
      setShowConfirmModal(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      showAlert('danger', `Lỗi: ${error.message}`);
    }
  };

  const handleCancelInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      await financeService.cancelInvoice(selectedInvoice.id, cancelReason);
      showAlert('success', 'Hủy hóa đơn thành công!');
      setShowCancelModal(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      showAlert('danger', `Lỗi: ${error.message}`);
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  return (
    <ManagerLayout>
      <div className="finance-invoices-page">
        {alert.show && (
          <CustomAlert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ show: false })}
          />
        )}

        {/* Header */}
        <div className="invoices-header">
          <div className="header-left">
            <div className="header-icon">
              <FiFileText />
            </div>
            <div className="header-info">
              <h1 className="header-title">Quản lý Hóa đơn</h1>
              <p className="header-subtitle">Tổng: {filteredInvoices.length} hóa đơn</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={clearFilters}>
              <FiX /> Xóa bộ lọc
            </button>
            <button className="btn-refresh" onClick={fetchInvoices}>
              <FiRefreshCw /> Làm mới
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="filters-section">
          <div className="search-wrapper-custom">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo ID, khách hàng, biển số..."
            />
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label><FiFilter /> Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label><FiCalendar /> Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label><FiCalendar /> Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="invoices-table-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="empty-state">
              <FiFileText />
              <p>Không tìm thấy hóa đơn nào</p>
            </div>
          ) : (
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Khách hàng</th>
                  <th>Xe</th>
                  <th>Số tiền</th>
                  <th>Ngày tạo</th>
                  <th>Hạn thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className={invoice.isOverdue ? 'row-overdue' : ''}>
                    <td><span className="invoice-id">#{invoice.id}</span></td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{invoice.customerName || 'N/A'}</span>
                        <span className="customer-phone">{invoice.customerPhone || ''}</span>
                      </div>
                    </td>
                    <td>
                      <div className="vehicle-info">
                        <span className="vehicle-plate">{invoice.vehiclePlate || 'N/A'}</span>
                        <span className="vehicle-model">{invoice.vehicleBrand} {invoice.vehicleModel}</span>
                      </div>
                    </td>
                    <td><span className="amount">{formatCurrency(invoice.totalAmount)}</span></td>
                    <td>{formatDate(invoice.issuedDate)}</td>
                    <td>
                      {invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}
                      {invoice.isOverdue && (
                        <span className="days-overdue">({invoice.daysOverdue} ngày)</span>
                      )}
                    </td>
                    <td>{getStatusBadge(invoice.status, invoice.isOverdue)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewDetail(invoice)}
                          title="Xem chi tiết"
                        >
                          <FiEye />
                        </button>
                        {invoice.status === 'PENDING' && (
                          <>
                            <button
                              className="btn-action btn-confirm"
                              onClick={() => handleOpenConfirm(invoice)}
                              title="Xác nhận thanh toán"
                            >
                              <FiCheck />
                            </button>
                            <button
                              className="btn-action btn-cancel"
                              onClick={() => handleOpenCancel(invoice)}
                              title="Hủy hóa đơn"
                            >
                              <FiX />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedInvoice && (
          <CustomModal
            show={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            title={`Chi tiết Hóa đơn #${selectedInvoice.id}`}
            size="large"
          >
            <div className="invoice-detail-modal">
              <div className="detail-section">
                <h4><FiUser /> Thông tin khách hàng</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Họ tên:</span>
                    <span className="value">{selectedInvoice.customerName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedInvoice.customerEmail || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Điện thoại:</span>
                    <span className="value">{selectedInvoice.customerPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4><FaCar /> Thông tin xe</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Biển số:</span>
                    <span className="value">{selectedInvoice.vehiclePlate || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Xe:</span>
                    <span className="value">{selectedInvoice.vehicleBrand} {selectedInvoice.vehicleModel}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4><FiFileText /> Dịch vụ</h4>
                {selectedInvoice.services && selectedInvoice.services.length > 0 ? (
                  <table className="services-table">
                    <thead>
                      <tr>
                        <th>Dịch vụ</th>
                        <th>SL</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.services.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.serviceName}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.unitPrice)}</td>
                          <td>{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="total-label">Tổng cộng:</td>
                        <td className="total-value">{formatCurrency(selectedInvoice.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p className="no-services">Không có dịch vụ nào</p>
                )}
              </div>

              <div className="detail-section">
                <h4><FiDollarSign /> Thông tin thanh toán</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Trạng thái:</span>
                    {getStatusBadge(selectedInvoice.status, selectedInvoice.isOverdue)}
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày tạo:</span>
                    <span className="value">{formatDate(selectedInvoice.issuedDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Hạn thanh toán:</span>
                    <span className="value">{formatDate(selectedInvoice.dueDate)}</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {selectedInvoice.status === 'PENDING' && (
                  <>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleOpenConfirm(selectedInvoice);
                      }}
                    >
                      <FiCheck /> Xác nhận thanh toán
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleOpenCancel(selectedInvoice);
                      }}
                    >
                      <FiX /> Hủy hóa đơn
                    </button>
                  </>
                )}
                <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </CustomModal>
        )}

        {/* Confirm Payment Modal */}
        {showConfirmModal && selectedInvoice && (
          <CustomModal
            show={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            title="Xác nhận thanh toán"
            size="small"
          >
            <div className="confirm-modal">
              <p className="confirm-message">
                Xác nhận thanh toán cho hóa đơn <strong>#{selectedInvoice.id}</strong>?
              </p>
              <p className="confirm-amount">
                Số tiền: <strong>{formatCurrency(selectedInvoice.totalAmount)}</strong>
              </p>

              <div className="form-group">
                <label>Phương thức thanh toán:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-select"
                >
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                  <option value="CARD">Thẻ</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="btn-primary" onClick={handleConfirmPayment}>
                  <FiCheck /> Xác nhận
                </button>
                <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>
                  Hủy
                </button>
              </div>
            </div>
          </CustomModal>
        )}

        {/* Cancel Invoice Modal */}
        {showCancelModal && selectedInvoice && (
          <CustomModal
            show={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            title="Hủy hóa đơn"
            size="small"
          >
            <div className="cancel-modal">
              <div className="warning-box">
                <FiAlertTriangle />
                <p>Bạn có chắc chắn muốn hủy hóa đơn <strong>#{selectedInvoice.id}</strong>?</p>
              </div>

              <div className="form-group">
                <label>Lý do hủy:</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy hóa đơn..."
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button className="btn-danger" onClick={handleCancelInvoice}>
                  <FiX /> Xác nhận hủy
                </button>
                <button className="btn-secondary" onClick={() => setShowCancelModal(false)}>
                  Quay lại
                </button>
              </div>
            </div>
          </CustomModal>
        )}
      </div>
    </ManagerLayout>
  );
};

export default FinanceInvoices;

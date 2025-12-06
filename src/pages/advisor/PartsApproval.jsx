// File: src/pages/advisor/PartsApproval.jsx
// Trang duyệt yêu cầu phụ tùng cho Advisor - APEX Modern UI
// Flow: Hiện đơn hàng có yêu cầu → Click vào → Hiện các yêu cầu của đơn đó

import { useState, useEffect, useCallback } from 'react';
import {
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiUser,
  FiTool,
  FiCalendar,
  FiX,
  FiChevronRight,
  FiCheck,
  FiLoader,
  FiInbox,
  FiClipboard,
  FiImage,
  FiMessageCircle,
  FiHash,
  FiDollarSign,

} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import AdvisorLayout from './AdvisorLayout';
import './PartsApproval.css';
import {
  getPendingPartRequests,
  getPartRequestsByOrder,
  approvePartRequest,
  rejectPartRequest
} from '../../services/partService';

// Constants
const REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED'
};

const URGENCY_LEVELS = {
  URGENT: 'URGENT',
  HIGH: 'HIGH',
  NORMAL: 'NORMAL',
  LOW: 'LOW'
};

function PartsApproval() {
  // State cho danh sách đơn hàng
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');

  // State cho modal chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderRequests, setOrderRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // State cho modal duyệt/từ chối
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approveNote, setApproveNote] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Toast notification
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalPending: 0,
    urgentCount: 0,
    approvedToday: 0
  });

  // Show toast
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  };

  // Fetch data và nhóm theo đơn hàng
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const requests = await getPendingPartRequests();
      
      // Nhóm requests theo serviceOrderId
      const orderMap = new Map();
      
      requests.forEach(req => {
        const orderId = req.serviceOrderId;
        if (!orderMap.has(orderId)) {
          orderMap.set(orderId, {
            orderId: orderId,
            customerName: req.customerName || 'Khách hàng',
            vehicleInfo: req.vehicleInfo || req.vehiclePlate || 'Không có thông tin',
            technicianName: req.technicianName || 'Kỹ thuật viên',
            requests: [],
            pendingCount: 0,
            urgentCount: 0,
            totalAmount: 0,
            latestRequestTime: null
          });
        }
        
        const order = orderMap.get(orderId);
        order.requests.push(req);
        
        if (req.status === REQUEST_STATUS.PENDING) {
          order.pendingCount++;
        }
        
        if (req.urgency === URGENCY_LEVELS.URGENT) {
          order.urgentCount++;
        }
        
        // Tính tổng tiền
        const price = req.partPrice || req.price || 0;
        const quantity = req.quantity || 1;
        order.totalAmount += price * quantity;
        
        // Lấy thời gian request mới nhất
        const requestTime = req.requestedAt || req.createdAt;
        if (requestTime && (!order.latestRequestTime || new Date(requestTime) > new Date(order.latestRequestTime))) {
          order.latestRequestTime = requestTime;
        }
      });
      
      const ordersList = Array.from(orderMap.values());
      
      // Sắp xếp: Urgent trước, sau đó theo số pending, rồi theo thời gian
      ordersList.sort((a, b) => {
        if (a.urgentCount !== b.urgentCount) return b.urgentCount - a.urgentCount;
        if (a.pendingCount !== b.pendingCount) return b.pendingCount - a.pendingCount;
        return new Date(b.latestRequestTime) - new Date(a.latestRequestTime);
      });
      
      setOrders(ordersList);
      setFilteredOrders(ordersList);
      
      // Tính stats
      const totalPending = requests.filter(r => r.status === REQUEST_STATUS.PENDING).length;
      const urgentCount = requests.filter(r => r.urgency === URGENCY_LEVELS.URGENT && r.status === REQUEST_STATUS.PENDING).length;
      
      setStats({
        totalOrders: ordersList.length,
        totalPending,
        urgentCount,
        approvedToday: 0
      });
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter orders
  useEffect(() => {
    let result = [...orders];
    
    // Tìm kiếm
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order =>
        order.orderId?.toString().includes(term) ||
        order.customerName?.toLowerCase().includes(term) ||
        order.vehicleInfo?.toLowerCase().includes(term) ||
        order.technicianName?.toLowerCase().includes(term)
      );
    }
    
    // Lọc theo urgency
    if (filterUrgency !== 'all') {
      if (filterUrgency === 'urgent') {
        result = result.filter(order => order.urgentCount > 0);
      }
    }
    
    setFilteredOrders(result);
  }, [orders, searchTerm, filterUrgency]);

  // Mở modal chi tiết đơn hàng
  const handleOpenOrderModal = async (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
    setLoadingRequests(true);
    
    try {
      // Lấy danh sách requests của đơn hàng này
      const requests = await getPartRequestsByOrder(order.orderId);
      setOrderRequests(requests);
    } catch (err) {
      console.error('Error fetching order requests:', err);
      // Fallback: dùng data đã có
      setOrderRequests(order.requests || []);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Đóng modal đơn hàng
  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
    setOrderRequests([]);
  };

  // Mở modal duyệt
  const handleOpenApprove = (request) => {
    setSelectedRequest(request);
    setApproveNote('');
    setShowApproveModal(true);
  };

  // Mở modal từ chối
  const handleOpenReject = (request) => {
    setSelectedRequest(request);
    setRejectNote('');
    setRejectError('');
    setShowRejectModal(true);
  };

  // Xử lý duyệt
  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessing(true);
      await approvePartRequest(selectedRequest.id, approveNote || null);
      
      showToast('success', `✓ Đã duyệt & xuất kho "${selectedRequest.partName}" (x${selectedRequest.quantityRequested})`);
      setShowApproveModal(false);
      
      // Refresh data trong modal
      if (selectedOrder) {
        const requests = await getPartRequestsByOrder(selectedOrder.orderId);
        setOrderRequests(requests);
        
        // Cập nhật pending count trong order
        const pendingCount = requests.filter(r => r.status === REQUEST_STATUS.PENDING).length;
        if (pendingCount === 0) {
          // Đóng modal nếu hết request pending
          handleCloseOrderModal();
        }
      }
      
      // Refresh danh sách đơn hàng
      fetchData();
      
    } catch (err) {
      console.error('Error approving:', err);
      // Hiển thị thông báo lỗi chi tiết từ backend
      const errorMsg = err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra. Vui lòng thử lại.';
      showToast('error', errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  // Xử lý từ chối
  const handleReject = async () => {
    if (!selectedRequest) return;
    
    if (!rejectNote.trim()) {
      setRejectError('Vui lòng nhập lý do từ chối');
      return;
    }
    
    try {
      setProcessing(true);
      await rejectPartRequest(selectedRequest.id, rejectNote);
      
      showToast('warning', `Đã từ chối yêu cầu "${selectedRequest.partName}"`);
      setShowRejectModal(false);
      
      // Refresh data trong modal
      if (selectedOrder) {
        const requests = await getPartRequestsByOrder(selectedOrder.orderId);
        setOrderRequests(requests);
        
        const pendingCount = requests.filter(r => r.status === REQUEST_STATUS.PENDING).length;
        if (pendingCount === 0) {
          handleCloseOrderModal();
        }
      }
      
      fetchData();
      
    } catch (err) {
      console.error('Error rejecting:', err);
      showToast('error', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  // Format tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Format thời gian
  const formatTime = (timeData) => {
    if (!timeData) return 'N/A';
    
    let date;
    if (Array.isArray(timeData)) {
      const [year, month, day, hour = 0, minute = 0] = timeData;
      date = new Date(year, month - 1, day, hour, minute);
    } else {
      date = new Date(timeData);
    }
    
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get urgency badge
  const getUrgencyBadge = (urgency) => {
    const config = {
      URGENT: { label: 'Khẩn cấp', class: 'urgency-urgent' },
      HIGH: { label: 'Cao', class: 'urgency-high' },
      NORMAL: { label: 'Bình thường', class: 'urgency-normal' },
      LOW: { label: 'Thấp', class: 'urgency-low' }
    };
    const cfg = config[urgency] || config.NORMAL;
    return <span className={`urgency-badge ${cfg.class}`}>{cfg.label}</span>;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      PENDING: { label: 'Chờ duyệt', class: 'status-pending', icon: <FiClock /> },
      APPROVED: { label: 'Đã duyệt', class: 'status-approved', icon: <FiCheckCircle /> },
      REJECTED: { label: 'Từ chối', class: 'status-rejected', icon: <FiXCircle /> },
      FULFILLED: { label: 'Đã xuất kho', class: 'status-fulfilled', icon: <FiCheck /> },
      CANCELLED: { label: 'Đã hủy', class: 'status-cancelled', icon: <FiX /> }
    };
    const cfg = config[status] || config.PENDING;
    return <span className={`status-badge ${cfg.class}`}>{cfg.icon} {cfg.label}</span>;
  };

  return (
    <AdvisorLayout>
      <div className="parts-approval-page">
        {/* Toast */}
        {toast.show && (
          <div className={`parts-approval-toast ${toast.type}`}>
            {toast.type === 'success' && <FiCheckCircle size={20} />}
            {toast.type === 'error' && <FiXCircle size={20} />}
            {toast.type === 'warning' && <FiAlertTriangle size={20} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <header className="parts-approval-header">
          <div className="parts-approval-title-section">
            <div className="parts-approval-icon-wrapper">
              <FiPackage />
            </div>
            <div>
              <h1 className="parts-approval-title">Duyệt Yêu Cầu Phụ Tùng</h1>
              <p className="parts-approval-subtitle">Xử lý yêu cầu phụ tùng từ kỹ thuật viên theo đơn hàng</p>
            </div>
          </div>
          <button className="parts-approval-refresh-btn" onClick={fetchData}>
            <FiRefreshCw /> Làm mới
          </button>
        </header>

        {/* Stats */}
        <section className="parts-approval-stats">
          <div className="parts-approval-stat-card orders">
            <div className="parts-approval-stat-icon"><FiClipboard /></div>
            <div className="parts-approval-stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Đơn có yêu cầu</p>
            </div>
          </div>
          <div className="parts-approval-stat-card pending">
            <div className="parts-approval-stat-icon"><FiClock /></div>
            <div className="parts-approval-stat-info">
              <h3>{stats.totalPending}</h3>
              <p>Yêu cầu chờ duyệt</p>
            </div>
          </div>
          <div className="parts-approval-stat-card urgent">
            <div className="parts-approval-stat-icon"><FiAlertTriangle /></div>
            <div className="parts-approval-stat-info">
              <h3>{stats.urgentCount}</h3>
              <p>Khẩn cấp</p>
            </div>
          </div>
          <div className="parts-approval-stat-card total">
            <div className="parts-approval-stat-icon"><FiCheckCircle /></div>
            <div className="parts-approval-stat-info">
              <h3>{stats.approvedToday}</h3>
              <p>Đã duyệt hôm nay</p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="parts-approval-filters">
          <div className="parts-approval-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, khách hàng, biển số xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="parts-approval-filter-group">
            <label><FiFilter /> Lọc:</label>
            <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)}>
              <option value="all">Tất cả mức độ</option>
              <option value="urgent">Chỉ khẩn cấp</option>
            </select>
          </div>
        </section>

        {/* Orders List */}
        <section>
          {loading ? (
            <div className="parts-approval-loading">
              <div className="parts-approval-spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="parts-approval-error">
              <div className="parts-approval-error-icon"><FiAlertCircle /></div>
              <h3>Đã xảy ra lỗi</h3>
              <p>{error}</p>
              <button onClick={fetchData}>Thử lại</button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="parts-approval-empty">
              <div className="parts-approval-empty-icon"><FiInbox /></div>
              <h3>Không có đơn hàng cần duyệt</h3>
              <p>Tất cả yêu cầu phụ tùng đã được xử lý</p>
            </div>
          ) : (
            <div className="parts-approval-orders-grid">
              {filteredOrders.map((order) => (
                <div
                  key={order.orderId}
                  className={`parts-approval-order-card ${order.urgentCount > 0 ? 'has-urgent' : ''}`}
                  onClick={() => handleOpenOrderModal(order)}
                >
                  {/* Card Header */}
                  <div className="parts-approval-order-header">
                    <div className="parts-approval-order-info">
                      <div className="parts-approval-order-avatar">
                        <FiClipboard />
                      </div>
                      <div className="parts-approval-order-details">
                        <h3>Đơn hàng #{order.orderId}</h3>
                        <p><FiCalendar /> {formatTime(order.latestRequestTime)}</p>
                      </div>
                    </div>
                    <div className="parts-approval-request-count">
                      <FiPackage /> {order.pendingCount} chờ
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="parts-approval-order-customer">
                    <div className="parts-approval-customer-avatar">
                      <FiUser />
                    </div>
                    <div className="parts-approval-customer-info">
                      <h4>{order.customerName}</h4>
                      <p><FaCar /> {order.vehicleInfo}</p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="parts-approval-order-meta">
                    <div className="parts-approval-meta-item">
                      <FiTool />
                      <span>{order.technicianName}</span>
                    </div>
                    <div className="parts-approval-meta-item">
                      <FiDollarSign />
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="parts-approval-order-footer">
                    <div className="parts-approval-order-urgency">
                      {order.urgentCount > 0 && (
                        <span className="parts-approval-urgency-badge urgent">
                          <FiAlertTriangle /> {order.urgentCount} khẩn
                        </span>
                      )}
                    </div>
                    <button className="parts-approval-view-btn">
                      Xem chi tiết <FiChevronRight />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal Chi tiết Đơn hàng */}
        {showOrderModal && selectedOrder && (
          <div className="parts-approval-modal-overlay" onClick={handleCloseOrderModal}>
            <div className="parts-approval-modal" onClick={(e) => e.stopPropagation()}>
              <div className="parts-approval-modal-header">
                <div className="parts-approval-modal-title">
                  <div className="parts-approval-modal-title-icon">
                    <FiClipboard />
                  </div>
                  <div>
                    <h2>Đơn hàng #{selectedOrder.orderId}</h2>
                    <p>{selectedOrder.customerName} - {selectedOrder.vehicleInfo}</p>
                  </div>
                </div>
                <button className="parts-approval-modal-close" onClick={handleCloseOrderModal}>
                  <FiX />
                </button>
              </div>

              <div className="parts-approval-modal-body">
                {/* Order Info Section */}
                <div className="parts-approval-order-info-section">
                  <div className="parts-approval-order-info-item">
                    <div className="info-icon"><FiUser /></div>
                    <div className="info-content">
                      <h4>Khách hàng</h4>
                      <p>{selectedOrder.customerName}</p>
                    </div>
                  </div>
                  <div className="parts-approval-order-info-item">
                    <div className="info-icon"><FaCar /></div>
                    <div className="info-content">
                      <h4>Xe</h4>
                      <p>{selectedOrder.vehicleInfo}</p>
                    </div>
                  </div>
                  <div className="parts-approval-order-info-item">
                    <div className="info-icon"><FiTool /></div>
                    <div className="info-content">
                      <h4>Kỹ thuật viên</h4>
                      <p>{selectedOrder.technicianName}</p>
                    </div>
                  </div>
                  <div className="parts-approval-order-info-item">
                    <div className="info-icon"><FiDollarSign /></div>
                    <div className="info-content">
                      <h4>Tổng giá trị</h4>
                      <p>{formatCurrency(selectedOrder.totalAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Requests Section */}
                <div className="parts-approval-requests-section">
                  <h3><FiPackage /> Danh sách yêu cầu phụ tùng ({orderRequests.length})</h3>
                  
                  {loadingRequests ? (
                    <div className="parts-approval-loading">
                      <div className="parts-approval-spinner"></div>
                      <p>Đang tải danh sách yêu cầu...</p>
                    </div>
                  ) : orderRequests.length === 0 ? (
                    <div className="parts-approval-empty">
                      <div className="parts-approval-empty-icon"><FiInbox /></div>
                      <h3>Không có yêu cầu</h3>
                      <p>Không có yêu cầu phụ tùng nào cho đơn này</p>
                    </div>
                  ) : (
                    orderRequests.map((request) => (
                      <div key={request.id} className={`parts-approval-request-item ${request.urgency === 'URGENT' ? 'urgent' : ''}`}>
                        {/* Request Header */}
                        <div className="parts-approval-request-header">
                          <div className="parts-approval-request-part">
                            <div className="parts-approval-part-icon">
                              <FiPackage />
                            </div>
                            <div className="parts-approval-part-details">
                              <h4>{request.partName || 'Phụ tùng'}</h4>
                              <p>SKU: {request.partSku || request.partId}</p>
                            </div>
                          </div>
                          <div className="parts-approval-request-badges">
                            <span className={`parts-approval-status-badge ${request.status?.toLowerCase()}`}>
                              {request.status === 'PENDING' && <><FiClock /> Chờ duyệt</>}
                              {request.status === 'APPROVED' && <><FiCheckCircle /> Đã duyệt</>}
                              {request.status === 'REJECTED' && <><FiXCircle /> Từ chối</>}
                            </span>
                            <span className={`parts-approval-urgency-badge ${request.urgency?.toLowerCase()}`}>
                              {request.urgency === 'URGENT' && 'Khẩn cấp'}
                              {request.urgency === 'HIGH' && 'Cao'}
                              {request.urgency === 'NORMAL' && 'Bình thường'}
                              {request.urgency === 'LOW' && 'Thấp'}
                            </span>
                          </div>
                        </div>

                        {/* Request Details */}
                        <div className="parts-approval-request-details">
                          <div className="parts-approval-detail-item">
                            <label>Số lượng</label>
                            <span className="quantity-value">{request.quantityRequested}</span>
                          </div>
                          <div className="parts-approval-detail-item">
                            <label>Đơn giá</label>
                            <span className="price">{formatCurrency(request.partPrice || request.price)}</span>
                          </div>
                          <div className="parts-approval-detail-item">
                            <label>Thành tiền</label>
                            <span className="price total">{formatCurrency((request.partPrice || request.price) * request.quantityRequested)}</span>
                          </div>
                          <div className="parts-approval-detail-item">
                            <label>Thời gian yêu cầu</label>
                            <span>{formatTime(request.requestedAt || request.createdAt)}</span>
                          </div>
                        </div>

                        {/* Notes từ Kỹ thuật viên */}
                        {request.technicianNotes && (
                          <div className="parts-approval-notes technician-notes">
                            <label><FiMessageCircle /> Ghi chú từ kỹ thuật viên:</label>
                            <p>{request.technicianNotes}</p>
                          </div>
                        )}

                        {/* Actions - Only for PENDING */}
                        {request.status === REQUEST_STATUS.PENDING && (
                          <div className="parts-approval-request-actions">
                            <button
                              className="parts-approval-reject-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReject(request);
                              }}
                            >
                              <FiXCircle /> Từ chối
                            </button>
                            <button
                              className="parts-approval-approve-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenApprove(request);
                              }}
                            >
                              <FiCheckCircle /> Duyệt yêu cầu
                            </button>
                          </div>
                        )}

                        {/* Approval/Rejection Info */}
                        {request.status === REQUEST_STATUS.APPROVED && request.approvedBy && (
                          <div className="parts-approval-notes" style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)', borderColor: '#BBF7D0' }}>
                            <label style={{ color: '#15803D' }}><FiCheckCircle /> Đã duyệt:</label>
                            <p style={{ color: '#166534', fontStyle: 'normal' }}>
                              Bởi {request.approvedBy} - {formatTime(request.approvedAt)}
                            </p>
                          </div>
                        )}
                        {request.status === REQUEST_STATUS.REJECTED && (
                          <div className="parts-approval-notes" style={{ background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', borderColor: '#FECACA' }}>
                            <label style={{ color: '#DC2626' }}><FiXCircle /> Đã từ chối:</label>
                            <p style={{ color: '#991B1B', fontStyle: 'normal' }}>
                              {request.rejectionReason || request.approverNotes || 'Không có lý do'}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Duyệt */}
        {showApproveModal && selectedRequest && (
          <div className="parts-approval-modal-overlay" onClick={() => setShowApproveModal(false)}>
            <div className="parts-approval-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="parts-approval-modal-header approve">
                <div className="parts-approval-modal-title">
                  <div className="parts-approval-modal-title-icon">
                    <FiCheckCircle />
                  </div>
                  <div>
                    <h2>Xác nhận duyệt</h2>
                    <p>Duyệt và xuất kho phụ tùng</p>
                  </div>
                </div>
                <button className="parts-approval-modal-close" onClick={() => setShowApproveModal(false)}>
                  <FiX />
                </button>
              </div>
              <div className="parts-approval-confirm-content">
                <div className="parts-approval-confirm-icon approve">
                  <FiCheckCircle />
                </div>
                <h3>Duyệt yêu cầu này?</h3>
                <p>Hệ thống sẽ <strong>tự động trừ kho</strong> và giao cho kỹ thuật viên</p>
                
                <div className="parts-approval-confirm-part">
                  <h4>{selectedRequest.partName}</h4>
                  <div className="confirm-part-details">
                    <div className="confirm-detail-row">
                      <span className="label"><FiHash /> Số lượng yêu cầu:</span>
                      <span className="value quantity">{selectedRequest.quantityRequested}</span>
                    </div>
                    <div className="confirm-detail-row">
                      <span className="label"><FiPackage /> Tồn kho hiện tại:</span>
                      <span className="value stock">{selectedRequest.quantityInStock}</span>
                    </div>
                    <div className="confirm-detail-row">
                      <span className="label"><FiDollarSign /> Đơn giá:</span>
                      <span className="value">{formatCurrency(selectedRequest.partPrice || selectedRequest.price)}</span>
                    </div>
                    <div className="confirm-detail-row total">
                      <span className="label">Thành tiền:</span>
                      <span className="value price">{formatCurrency((selectedRequest.partPrice || selectedRequest.price) * selectedRequest.quantityRequested)}</span>
                    </div>
                  </div>
                </div>

                {/* Hiển thị ghi chú của KTV nếu có */}
                {selectedRequest.technicianNotes && (
                  <div className="parts-approval-ktv-notes">
                    <label><FiMessageCircle /> Ghi chú từ kỹ thuật viên:</label>
                    <p>{selectedRequest.technicianNotes}</p>
                  </div>
                )}
                
                <div className="parts-approval-notes-input">
                  <label>Ghi chú của Advisor (tùy chọn):</label>
                  <textarea
                    value={approveNote}
                    onChange={(e) => setApproveNote(e.target.value)}
                    placeholder="Nhập ghi chú nếu cần..."
                    rows={3}
                  />
                </div>
                
                <div className="parts-approval-confirm-actions">
                  <button className="parts-approval-confirm-cancel" onClick={() => setShowApproveModal(false)}>
                    Hủy bỏ
                  </button>
                  <button className="parts-approval-confirm-submit approve" onClick={handleApprove} disabled={processing}>
                    {processing ? <><FiLoader className="spin" /> Đang xử lý...</> : <><FiCheckCircle /> Duyệt & Xuất kho</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Từ chối */}
        {showRejectModal && selectedRequest && (
          <div className="parts-approval-modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="parts-approval-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="parts-approval-modal-header reject">
                <div className="parts-approval-modal-title">
                  <div className="parts-approval-modal-title-icon">
                    <FiXCircle />
                  </div>
                  <div>
                    <h2>Từ chối yêu cầu</h2>
                    <p>Vui lòng nhập lý do</p>
                  </div>
                </div>
                <button className="parts-approval-modal-close" onClick={() => setShowRejectModal(false)}>
                  <FiX />
                </button>
              </div>
              <div className="parts-approval-confirm-content">
                <div className="parts-approval-confirm-icon reject">
                  <FiXCircle />
                </div>
                <h3>Từ chối yêu cầu này?</h3>
                <p>Bạn đang từ chối yêu cầu phụ tùng sau:</p>
                
                <div className="parts-approval-confirm-part">
                  <h4>{selectedRequest.partName}</h4>
                  <div className="confirm-part-details">
                    <div className="confirm-detail-row">
                      <span className="label"><FiHash /> Số lượng yêu cầu:</span>
                      <span className="value quantity">{selectedRequest.quantityRequested}</span>
                    </div>
                    <div className="confirm-detail-row">
                      <span className="label"><FiDollarSign /> Giá trị:</span>
                      <span className="value">{formatCurrency((selectedRequest.partPrice || selectedRequest.price) * selectedRequest.quantityRequested)}</span>
                    </div>
                  </div>
                </div>

                {/* Hiển thị ghi chú của KTV nếu có */}
                {selectedRequest.technicianNotes && (
                  <div className="parts-approval-ktv-notes">
                    <label><FiMessageCircle /> Ghi chú từ kỹ thuật viên:</label>
                    <p>{selectedRequest.technicianNotes}</p>
                  </div>
                )}
                
                <div className="parts-approval-notes-input">
                  <label>Lý do từ chối: <span style={{ color: '#EF4444' }}>*</span></label>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => {
                      setRejectNote(e.target.value);
                      setRejectError('');
                    }}
                    placeholder="Nhập lý do từ chối..."
                    rows={3}
                    style={rejectError ? { borderColor: '#EF4444' } : {}}
                  />
                  {rejectError && (
                    <p style={{ color: '#EF4444', fontSize: '14px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiAlertCircle /> {rejectError}
                    </p>
                  )}
                </div>
                
                <div className="parts-approval-confirm-actions">
                  <button className="parts-approval-confirm-cancel" onClick={() => setShowRejectModal(false)}>
                    Hủy bỏ
                  </button>
                  <button className="parts-approval-confirm-submit reject" onClick={handleReject} disabled={processing}>
                    {processing ? <><FiLoader className="spin" /> Đang xử lý...</> : <><FiXCircle /> Từ chối</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdvisorLayout>
  );
}

export default PartsApproval;

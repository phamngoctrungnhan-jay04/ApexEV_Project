// File: src/pages/customer/QuoteApproval.jsx
// Trang duyệt báo giá phụ tùng cho Customer - APEX Modern UI

import { useState, useEffect } from 'react';
import {
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
  FiArrowLeft,
  FiLoader,
  FiHash,
  FiTool,
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import './QuoteApproval.css';
import { getPartRequestsByOrder, approveQuote, rejectQuote } from '../../services/partService';

const QuoteApproval = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Modal từ chối
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Toast
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  };

  // Fetch data
  useEffect(() => {
    fetchQuoteData();
  }, [orderId]);

  const fetchQuoteData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPartRequestsByOrder(orderId);

      // Lọc chỉ lấy requests có status QUOTED
      const quotedRequests = data.filter(r => r.status === 'QUOTED');

      if (quotedRequests.length === 0) {
        setError('Không có báo giá nào đang chờ duyệt cho đơn hàng này');
      }

      setRequests(quotedRequests);
      // Mặc định chọn tất cả
      setSelectedItems(new Set(quotedRequests.map(r => r.id)));

      // Extract order info từ request đầu tiên
      if (quotedRequests.length > 0) {
        const first = quotedRequests[0];
        setOrderInfo({
          orderId: first.serviceOrderId,
          customerName: first.customerName,
          vehicleInfo: first.vehicleLicensePlate || 'Xe không xác định',
        });
      }
    } catch (err) {
      console.error('Error fetching quote:', err);
      setError('Không thể tải thông tin báo giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle chọn item
  const toggleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Toggle chọn tất cả
  const toggleSelectAll = () => {
    if (selectedItems.size === requests.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(requests.map(r => r.id)));
    }
  };

  // Tính tổng tiền (chỉ items được chọn)
  const calculateTotal = () => {
    return requests
      .filter(req => selectedItems.has(req.id))
      .reduce((total, req) => {
        return total + (req.partPrice * req.quantityRequested);
      }, 0);
  };

  // Format tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Xử lý duyệt
  const handleApprove = async () => {
    if (selectedItems.size === 0) {
      showToast('error', 'Vui lòng chọn ít nhất một phụ tùng để duyệt');
      return;
    }

    try {
      setProcessing(true);
      await approveQuote(orderId);
      showToast('success', `✓ Đã duyệt ${selectedItems.size} phụ tùng thành công!`);
      setTimeout(() => {
        navigate(`/customer/order-tracking/${orderId}`);
      }, 1500);
    } catch (err) {
      console.error('Error approving quote:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || 'Không thể duyệt báo giá. Vui lòng thử lại.';
      showToast('error', errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  // Xử lý từ chối
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast('error', 'Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setProcessing(true);
      await rejectQuote(orderId, rejectReason);
      showToast('warning', 'Đã từ chối báo giá');
      setTimeout(() => {
        navigate(`/customer/order-tracking/${orderId}`);
      }, 1500);
    } catch (err) {
      console.error('Error rejecting quote:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || 'Không thể từ chối báo giá. Vui lòng thử lại.';
      showToast('error', errorMsg);
    } finally {
      setProcessing(false);
      setShowRejectModal(false);
    }
  };

  if (loading) {
    return (
      <div className="quote-approval-page">
        <div className="quote-approval-loading">
          <div className="quote-approval-spinner"></div>
          <p>Đang tải thông tin báo giá...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quote-approval-page">
        <div className="quote-approval-error">
          <div className="quote-approval-error-icon"><FiAlertCircle /></div>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button className="quote-approval-back-btn" onClick={() => navigate('/customer/order-tracking')}>
            <FiArrowLeft /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-approval-page">
      {/* Toast */}
      {toast.show && (
        <div className={`quote-approval-toast ${toast.type}`}>
          {toast.type === 'success' && <FiCheckCircle />}
          {toast.type === 'error' && <FiXCircle />}
          {toast.type === 'warning' && <FiAlertCircle />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="quote-approval-header">
        <button className="quote-approval-back-btn" onClick={() => navigate('/customer/order-tracking')}>
          <FiArrowLeft /> Quay lại
        </button>
        <div className="quote-approval-title-section">
          <div className="quote-approval-icon-wrapper">
            <FiPackage />
          </div>
          <div>
            <h1 className="quote-approval-title">Báo giá phụ tùng</h1>
            <p className="quote-approval-subtitle">Xem và duyệt báo giá thay thế phụ tùng</p>
          </div>
        </div>
      </div>

      {/* Order Info */}
      {orderInfo && (
        <div className="quote-approval-order-info">
          <div className="quote-approval-info-item">
            <FiHash />
            <div>
              <span className="label">Mã đơn hàng</span>
              <span className="value">#{orderInfo.orderId}</span>
            </div>
          </div>
          <div className="quote-approval-info-item">
            <FaCar />
            <div>
              <span className="label">Xe</span>
              <span className="value">{orderInfo.vehicleInfo}</span>
            </div>
          </div>
        </div>
      )}

      {/* Parts List - Table Layout */}
      <div className="quote-approval-card">
        <div className="quote-approval-card-header">
          <div className="header-left">
            <h2><FiPackage /> Danh sách phụ tùng cần thay ({requests.length})</h2>
            <p className="selected-count">
              Đã chọn: <strong>{selectedItems.size}/{requests.length}</strong> phụ tùng
            </p>
          </div>
          <button 
            className="select-all-btn"
            onClick={toggleSelectAll}
          >
            {selectedItems.size === requests.length ? (
              <><FiCheckCircle /> Bỏ chọn tất cả</>
            ) : (
              <><FiCheckCircle /> Chọn tất cả</>
            )}
          </button>
        </div>
        
        <div className="quote-approval-table-wrapper">
          <table className="quote-approval-table">
            <thead>
              <tr>
                <th className="col-checkbox"></th>
                <th className="col-part">Phụ tùng</th>
                <th className="col-sku">Mã SKU</th>
                <th className="col-qty">Số lượng</th>
                <th className="col-price">Đơn giá</th>
                <th className="col-total">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr 
                  key={req.id} 
                  className={selectedItems.has(req.id) ? 'selected' : ''}
                >
                  <td className="col-checkbox">
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(req.id)}
                        onChange={() => toggleSelectItem(req.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </td>
                  <td className="col-part">
                    <div className="part-info">
                      <div className="part-icon">
                        <FiPackage />
                      </div>
                      <div className="part-details">
                        <h3>{req.partName}</h3>
                        {req.technicianNotes && (
                          <p className="technician-note">
                            <FiTool /> {req.technicianNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="col-sku">
                    <span className="sku-badge">{req.partSku || req.partId}</span>
                  </td>
                  <td className="col-qty">
                    <span className="qty-badge">×{req.quantityRequested}</span>
                  </td>
                  <td className="col-price">
                    <span className="price">{formatCurrency(req.partPrice)}</span>
                  </td>
                  <td className="col-total">
                    <span className="total">{formatCurrency(req.partPrice * req.quantityRequested)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Section */}
      <div className="quote-approval-total-section">
        <div className="quote-approval-total-left">
          <FiAlertCircle />
          <div>
            <p>Vui lòng xem xét và xác nhận báo giá. Sau khi duyệt, chúng tôi sẽ tiến hành thay thế phụ tùng cho xe của bạn.</p>
            <p className="selected-info">
              {selectedItems.size === requests.length ? (
                <span className="all-selected">✓ Đã chọn tất cả {requests.length} phụ tùng</span>
              ) : selectedItems.size > 0 ? (
                <span className="partial-selected">⚠ Chỉ duyệt {selectedItems.size}/{requests.length} phụ tùng được chọn</span>
              ) : (
                <span className="none-selected">⚠ Chưa chọn phụ tùng nào</span>
              )}
            </p>
          </div>
        </div>
        <div className="quote-approval-total-right">
          <span className="quote-approval-total-label">
            Tổng cộng ({selectedItems.size} phụ tùng):
          </span>
          <span className="quote-approval-total-amount">{formatCurrency(calculateTotal())}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="quote-approval-actions">
        <button 
          className="quote-approval-btn reject"
          onClick={() => setShowRejectModal(true)}
          disabled={processing}
        >
          <FiXCircle /> Từ chối
        </button>
        <button 
          className="quote-approval-btn approve"
          onClick={handleApprove}
          disabled={processing || selectedItems.size === 0}
        >
          {processing ? (
            <><FiLoader className="spinning" /> Đang xử lý...</>
          ) : (
            <><FiCheckCircle /> Duyệt {selectedItems.size > 0 ? `${selectedItems.size} phụ tùng` : 'báo giá'}</>
          )}
        </button>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="quote-approval-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="quote-approval-modal" onClick={(e) => e.stopPropagation()}>
            <div className="quote-approval-modal-header">
              <h3><FiXCircle /> Từ chối báo giá</h3>
            </div>
            <div className="quote-approval-modal-body">
              <label>Lý do từ chối <span className="required">*</span></label>
              <textarea
                placeholder="Vui lòng cho biết lý do từ chối báo giá này..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="quote-approval-modal-actions">
              <button className="btn-cancel" onClick={() => setShowRejectModal(false)}>
                Hủy
              </button>
              <button className="btn-confirm" onClick={handleReject} disabled={processing}>
                {processing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteApproval;

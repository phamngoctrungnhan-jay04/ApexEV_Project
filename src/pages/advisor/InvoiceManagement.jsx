import { useState, useEffect } from 'react';
import { FiSearch, FiFileText, FiEye, FiCheckCircle, FiX, FiPackage, FiTool } from 'react-icons/fi';
import invoiceService from '../../services/invoiceService';
import './InvoiceManagement.css';

function InvoiceManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [notification, setNotification] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'detail' hoặc 'confirm'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReadyOrders();
  }, []);

  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getReadyOrders();
      
      // Debug: Xem Backend trả về gì
      console.log('🔍 [InvoiceManagement] API Response:', response);
      console.log('🔍 [InvoiceManagement] Orders count:', response?.length || response.data?.length);
      console.log('🔍 [InvoiceManagement] First order:', response?.[0] || response.data?.[0]);
      
      // Backend trả về array trực tiếp HOẶC có wrapper { data: [...] }
      const orderList = Array.isArray(response) ? response : (response.data || []);
      setOrders(orderList);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
      showNotification('Lỗi khi tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (order) => {
    try {
      setSelectedOrder(order);
      setShowModal(true);
      setModalType('detail');
      setLoadingDetail(true);

      // Gọi API lấy chi tiết đơn hàng với services và parts
      const response = await invoiceService.getOrderDetailForInvoice(order.orderId);
      console.log('🔍 [handleViewDetail] Response:', response);
      console.log('🔍 [handleViewDetail] Response.data:', response.data);
      
      // Backend trả về object trực tiếp hoặc trong response.data
      const detail = response.data || response;
      console.log('🔍 [handleViewDetail] Final detail:', detail);
      setOrderDetail(detail);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', error);
      showNotification('Không thể tải chi tiết đơn hàng', 'error');
      setShowModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedOrder) return;

    try {
      setProcessing(true);
      console.log('🔍 [handleCreateInvoice] Calling API with orderId:', selectedOrder.orderId);
      const response = await invoiceService.createInvoice(selectedOrder.orderId);
      console.log('🔍 [handleCreateInvoice] Response:', response);
      
      // Nếu không có lỗi thì là thành công
      showNotification('Xuất hóa đơn thành công! 🎉', 'success');
      setShowModal(false);
      setSelectedOrder(null);
      setOrderDetail(null);
      // Reload danh sách
      fetchReadyOrders();
    } catch (error) {
      console.error('❌ [handleCreateInvoice] Error:', error);
      console.error('❌ [handleCreateInvoice] Error response:', error.response);
      showNotification(error.response?.data?.message || 'Không thể xuất hóa đơn', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrder?.invoiceId) return;

    try {
      setProcessing(true);
      console.log('🔍 [handleConfirmPayment] Calling API with invoiceId:', selectedOrder.invoiceId);
      const response = await invoiceService.confirmPaymentAndDeliver(selectedOrder.invoiceId);
      console.log('🔍 [handleConfirmPayment] Response:', response);
      
      // Nếu không có lỗi thì là thành công
      showNotification('Đã xác nhận thanh toán và giao xe thành công! 🎉', 'success');
      setShowModal(false);
      setSelectedOrder(null);
      // Reload danh sách
      fetchReadyOrders();
    } catch (error) {
      console.error('❌ [handleConfirmPayment] Error:', error);
      console.error('❌ [handleConfirmPayment] Error response:', error.response);
      showNotification(error.response?.data?.message || 'Không thể xác nhận thanh toán', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toString().includes(searchQuery) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      selectedStatus === 'ALL' ||
      (selectedStatus === 'PENDING' && !order.invoiceId) ||
      (selectedStatus === 'COMPLETED' && order.invoiceId && order.invoiceStatus === 'PAID');

    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter(o => !o.invoiceId).length;
  const completedCount = orders.filter(o => o.invoiceId && o.invoiceStatus === 'PAID').length;

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="invoice-management">
      {/* Header với thống kê */}
      <div className="invoice-header">
        <div className="header-title">
          <FiFileText size={32} />
          <div>
            <h1>Quản lý Hóa đơn</h1>
            <p>Xuất hóa đơn và xác nhận thanh toán</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card pending">
            <div className="stat-icon">
              <FiFileText />
            </div>
            <div className="stat-info">
              <p className="stat-label">Chờ xuất HĐ</p>
              <h3 className="stat-value">{pendingCount}</h3>
            </div>
          </div>

          <div className="stat-card completed">
            <div className="stat-icon">
              <FiCheckCircle />
            </div>
            <div className="stat-info">
              <p className="stat-label">Đã hoàn tất</p>
              <h3 className="stat-value">{completedCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search + Filter */}
      <div className="toolbar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, khách hàng, biển số..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select 
          className="status-filter"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="ALL">Tất cả</option>
          <option value="PENDING">Chờ xuất HĐ</option>
          <option value="COMPLETED">Đã hoàn tất</option>
        </select>
      </div>

      {/* Orders Grid */}
      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <FiFileText size={64} />
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="card-header">
                <div className="order-id">
                  <FiFileText />
                  <span>#{order.orderId}</span>
                </div>
                <span className={`status-badge ${order.invoiceId ? 'completed' : 'pending'}`}>
                  {order.invoiceId ? (order.invoiceStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán') : 'Chờ xuất HĐ'}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <label>Khách hàng:</label>
                  <span>{order.customerName}</span>
                </div>
                <div className="info-row">
                  <label>Biển số:</label>
                  <span className="vehicle-plate">{order.vehiclePlate}</span>
                </div>
                <div className="info-row">
                  <label>Xe:</label>
                  <span>{order.vehicleBrand} {order.vehicleModel}</span>
                </div>
                <div className="info-row">
                  <label>Ngày hoàn thành:</label>
                  <span>{new Date(order.completedAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="info-row total">
                  <label>Tổng tiền:</label>
                  <span className="amount">
                    {new Intl.NumberFormat('vi-VN').format(order.totalAmount)} VNĐ
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleViewDetail(order)}
                >
                  <FiEye /> Chi tiết
                </button>

                {order.invoiceId && order.invoiceStatus === 'PENDING' && (
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setSelectedOrder(order);
                      setModalType('confirm');
                      setShowModal(true);
                    }}
                  >
                    <FiCheckCircle /> Giao xe
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal hiển thị chi tiết hoặc xác nhận */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !processing && setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalType === 'detail' ? (
              <>
                {/* Modal chi tiết đơn hàng */}
                <div className="modal-header">
                  <h2>Chi tiết đơn hàng #{selectedOrder?.orderId}</h2>
                  <button 
                    className="close-btn"
                    onClick={() => setShowModal(false)}
                    disabled={processing}
                  >
                    <FiX />
                  </button>
                </div>

                <div className="modal-body">
                  {loadingDetail ? (
                    <div className="loading-spinner small">
                      <div className="spinner"></div>
                      <p>Đang tải chi tiết...</p>
                    </div>
                  ) : orderDetail ? (
                    <>
                      {/* Thông tin khách hàng */}
                      <div className="detail-section">
                        <h3>Thông tin khách hàng</h3>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <label>Họ tên:</label>
                            <span>{orderDetail.customerName}</span>
                          </div>
                          <div className="detail-item">
                            <label>Số điện thoại:</label>
                            <span>{orderDetail.customerPhone}</span>
                          </div>
                          <div className="detail-item">
                            <label>Email:</label>
                            <span>{orderDetail.customerEmail}</span>
                          </div>
                        </div>
                      </div>

                      {/* Thông tin xe */}
                      <div className="detail-section">
                        <h3>Thông tin xe</h3>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <label>Biển số:</label>
                            <span className="vehicle-plate">{orderDetail.vehiclePlate}</span>
                          </div>
                          <div className="detail-item">
                            <label>Xe:</label>
                            <span>{orderDetail.vehicleBrand} {orderDetail.vehicleModel}</span>
                          </div>
                          <div className="detail-item">
                            <label>VIN:</label>
                            <span>{orderDetail.vehicleVin || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Danh sách dịch vụ */}
                      {orderDetail.services && orderDetail.services.length > 0 && (
                        <div className="detail-section">
                          <h3><FiTool /> Dịch vụ đã thực hiện</h3>
                          <div className="items-list">
                            {orderDetail.services.map((service, index) => (
                              <div key={index} className="item-row">
                                <div className="item-info">
                                  <strong>{service.serviceName}</strong>
                                  {service.serviceDescription && <p className="item-desc">{service.serviceDescription}</p>}
                                </div>
                                <div className="item-price">
                                  <span className="qty">x{service.quantity}</span>
                                  <span className="price">
                                    {new Intl.NumberFormat('vi-VN').format(service.subtotal)} VNĐ
                                  </span>
                                </div>
                              </div>
                            ))}
                            <div className="subtotal-row">
                              <strong>Tổng dịch vụ:</strong>
                              <strong className="price">
                                {new Intl.NumberFormat('vi-VN').format(orderDetail.totalServiceCost)} VNĐ
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Danh sách phụ tùng */}
                      {orderDetail.parts && orderDetail.parts.length > 0 && (
                        <div className="detail-section">
                          <h3><FiPackage /> Phụ tùng thay thế</h3>
                          <div className="items-list">
                            {orderDetail.parts.map((part, index) => (
                              <div key={index} className="item-row">
                                <div className="item-info">
                                  <strong>{part.partName}</strong>
                                  <p className="item-desc">Mã: {part.partCode}</p>
                                </div>
                                <div className="item-price">
                                  <span className="qty">x{part.quantity}</span>
                                  <span className="price">
                                    {new Intl.NumberFormat('vi-VN').format(part.subtotal)} VNĐ
                                  </span>
                                </div>
                              </div>
                            ))}
                            <div className="subtotal-row">
                              <strong>Tổng phụ tùng:</strong>
                              <strong className="price">
                                {new Intl.NumberFormat('vi-VN').format(orderDetail.totalPartCost)} VNĐ
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tổng cộng */}
                      <div className="total-section">
                        <div className="total-row">
                          <h2>Tổng cộng:</h2>
                          <h2 className="grand-total">
                            {new Intl.NumberFormat('vi-VN').format(orderDetail.grandTotal)} VNĐ
                          </h2>
                        </div>
                      </div>

                      {/* Ghi chú */}
                      {orderDetail.notes && (
                        <div className="detail-section">
                          <h3>Ghi chú</h3>
                          <p className="notes-text">{orderDetail.notes}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="error-text">Không thể tải chi tiết đơn hàng</p>
                  )}
                </div>

                <div className="modal-footer">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={processing}
                  >
                    Đóng
                  </button>

                  {!selectedOrder?.invoiceId && (
                    <button 
                      className="btn-primary"
                      onClick={handleCreateInvoice}
                      disabled={processing || loadingDetail}
                    >
                      {processing ? 'Đang xử lý...' : 'Xuất hóa đơn'}
                    </button>
                  )}

                  {selectedOrder?.invoiceId && selectedOrder?.invoiceStatus === 'PENDING' && (
                    <button 
                      className="btn-success"
                      onClick={() => setModalType('confirm')}
                      disabled={processing || loadingDetail}
                    >
                      Xác nhận thanh toán
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Modal xác nhận thanh toán */}
                <div className="modal-header">
                  <h2>Xác nhận thanh toán</h2>
                  <button 
                    className="close-btn"
                    onClick={() => setShowModal(false)}
                    disabled={processing}
                  >
                    <FiX />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="confirm-message">
                    <div className="confirm-icon">
                      <FiCheckCircle size={64} />
                    </div>
                    <h3>Xác nhận giao xe cho khách hàng?</h3>
                    <div className="confirm-details">
                      <p><strong>Đơn hàng:</strong> #{selectedOrder?.orderId}</p>
                      <p><strong>Khách hàng:</strong> {selectedOrder?.customerName}</p>
                      <p><strong>Biển số:</strong> {selectedOrder?.vehiclePlate}</p>
                      <p className="total-amount">
                        <strong>Số tiền:</strong> 
                        <span>{new Intl.NumberFormat('vi-VN').format(selectedOrder?.totalAmount)} VNĐ</span>
                      </p>
                    </div>
                    <p className="warning-text">
                      Sau khi xác nhận, đơn hàng sẽ được đánh dấu đã thanh toán và hoàn thành.
                    </p>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={processing}
                  >
                    Hủy
                  </button>
                  <button 
                    className="btn-success"
                    onClick={handleConfirmPayment}
                    disabled={processing}
                  >
                    {processing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? <FiCheckCircle /> : <FiX />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}

export default InvoiceManagement;

import { FaCar } from 'react-icons/fa';
import '../../styles/HistoryModern.css';
import { CustomButton } from '../../components/common';
import { useState } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getUserHistory, getCompletedHistory, getPendingHistory, getConfirmedHistory } from '../../services/bookingService';
import vehicleService from '../../services/vehicleService';
import { Container, Row, Col, Card, Badge, Form, Table } from 'react-bootstrap';
import MaintenanceDetailModal from '../../components/features/MaintenanceDetailModal';
import {
  FiClock,
  // ...other icon imports...
  FiTool,

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
  FiActivity
} from 'react-icons/fi';

function History() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [customerOrders, setCustomerOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    setLoading(true);
    let fetchFn = getUserHistory;
    if (tab === 'completed') fetchFn = getCompletedHistory;
    else if (tab === 'pending') fetchFn = getPendingHistory;
    else if (tab === 'confirmed') fetchFn = getConfirmedHistory;
    else if (tab === 'in_service') {
      // Đang bảo dưỡng: bao gồm các trạng thái RECEPTION, INSPECTION, QUOTING, WAITING_FOR_PARTS, IN_PROGRESS, READY_FOR_INVOICE
      fetchFn = async () => {
        const all = await getUserHistory();
        return (all || []).filter(order => 
          ['RECEPTION', 'INSPECTION', 'QUOTING', 'WAITING_FOR_PARTS', 'IN_PROGRESS', 'READY_FOR_INVOICE', 'IN_SERVICE'].includes(order.serviceOrderStatus || order.status)
        );
      };
    }
    else if (tab === 'cancelled') {
      fetchFn = async () => {
        const all = await getUserHistory();
        return (all || []).filter(order => order.status === 'CANCELLED' || order.serviceOrderStatus === 'CANCELLED');
      };
    }
    Promise.all([
      fetchFn(),
      vehicleService.getMyVehicles()
    ]).then(([orders, vehiclesData]) => {
      // Sắp xếp theo thứ tự từ mới nhất đến cũ nhất (theo ID giảm dần)
      const sortedOrders = (orders || []).sort((a, b) => b.id - a.id);
      setCustomerOrders(sortedOrders);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [tab]);

  // Filter and paginate orders
  const filteredOrders = customerOrders
    .filter(order => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (searchQuery) {
        // Simple search by code, vehicle, service
        const searchLower = searchQuery.toLowerCase();
        return (
          (order.code || '').toLowerCase().includes(searchLower) ||
          (order.vehicleName || '').toLowerCase().includes(searchLower) ||
          (order.serviceName || '').toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  
  // Hiển thị tất cả appointments (không phân trang)
  const currentOrders = filteredOrders;

  return (
    <>
      <Container fluid>
        <div className="page-header mb-4">
          <h2>
            <FiFileText className="me-2" />
            Lịch sử bảo dưỡng
          </h2>
          <p className="text-muted">
            Theo dõi toàn bộ lịch sử bảo dưỡng và dịch vụ của bạn
          </p>
        </div>
        {/* Tabs cho các loại lịch sử */}
        <div className="mb-3 d-flex gap-2 flex-wrap">
          <CustomButton variant={tab === 'all' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setTab('all')}>Tất cả</CustomButton>
          <CustomButton variant={tab === 'pending' ? 'warning' : 'outline-warning'} size="sm" onClick={() => setTab('pending')}>Chờ xác nhận</CustomButton>
          <CustomButton variant={tab === 'confirmed' ? 'info' : 'outline-info'} size="sm" onClick={() => setTab('confirmed')}>Đã xác nhận</CustomButton>
          <CustomButton variant={tab === 'in_service' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setTab('in_service')}>Đang bảo dưỡng</CustomButton>
          <CustomButton variant={tab === 'completed' ? 'success' : 'outline-success'} size="sm" onClick={() => setTab('completed')}>Đã hoàn thành</CustomButton>
          <CustomButton variant={tab === 'cancelled' ? 'danger' : 'outline-danger'} size="sm" onClick={() => setTab('cancelled')}>Đã hủy</CustomButton>
        </div>
        <Card className="orders-card">
          <Card.Body>
            {currentOrders.length > 0 ? (
              <div className="table-responsive">
                <div className="apex-glass-card" style={{
                  borderRadius: '14px',
                  boxShadow: '0 4px 12px rgba(51, 138, 243, 0.18)',
                  backdropFilter: 'blur(12px)',
                  background: 'rgba(255,255,255,0.85)',
                  padding: '24px',
                  marginBottom: '24px',
                  border: 'none'
                }}>
                  <Table className="history-table" responsive style={{marginBottom:0}}>
                    <thead>
                      <tr style={{background:'rgba(51,138,243,0.08)'}}>
                        <th style={{borderRadius:'12px 0 0 12px',padding:'12px 0'}}>Mã đơn</th>
                        <th>Ngày</th>
                        <th>Xe</th>
                        <th>Dịch vụ</th>
                        <th>Kỹ thuật viên</th>
                        <th>Trạng thái</th>
                        <th style={{borderRadius:'0 12px 12px 0'}}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} style={{textAlign:'center',padding:'48px 0'}}>
                            <div className="apex-loading">
                              <span className="spinner-border text-primary" style={{width:32,height:32}}></span>
                              <div className="mt-3 text-primary fw-bold">Đang tải dữ liệu...</div>
                            </div>
                          </td>
                        </tr>
                      ) : currentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{textAlign:'center',padding:'48px 0'}}>
                            <div className="apex-empty">
                              <FiAlertCircle size={32} className="text-gray-400 mb-2" />
                              <div className="text-muted">Không có lịch sử bảo dưỡng nào.</div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentOrders.map(order => {
                          // Format ngày/thời gian từ appointmentTime (LocalDateTime dạng "2025-12-01T08:00:00" hoặc mảng [yyyy,MM,dd,HH,mm])
                          let dateStr = '';
                          let timeStr = '';
                          if (order.appointmentTime) {
                            let dateObj = null;
                            if (Array.isArray(order.appointmentTime) && order.appointmentTime.length >= 5) {
                              dateObj = new Date(
                                order.appointmentTime[0],
                                order.appointmentTime[1] - 1,
                                order.appointmentTime[2],
                                order.appointmentTime[3],
                                order.appointmentTime[4]
                              );
                            } else if (typeof order.appointmentTime === 'string') {
                              let dateStrRaw = order.appointmentTime.trim();
                              if (dateStrRaw.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)) {
                                dateStrRaw = dateStrRaw.replace(' ', 'T');
                              }
                              if (dateStrRaw.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
                                dateStrRaw += ':00';
                              }
                              dateObj = new Date(dateStrRaw);
                            } else if (typeof order.appointmentTime === 'number') {
                              dateObj = new Date(order.appointmentTime);
                            }
                            if (dateObj && !isNaN(dateObj.getTime())) {
                              dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                              timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                            } else {
                              dateStr = 'Không xác định';
                              timeStr = '';
                            }
                          } else {
                            dateStr = 'Không xác định';
                            timeStr = '';
                          }
                          return (
                            <tr key={order.id} className="order-row" style={{transition:'all 0.3s cubic-bezier(.4,0,.2,1)'}}>
                              <td style={{fontWeight:'bold',padding:'12px 0'}}>{order.id}</td>
                              <td>
                                <div style={{lineHeight:'1.3'}}>
                                  <FiCalendar className="me-1 text-primary" />
                                  {dateStr}
                                  <br />
                                  <small className="text-muted">
                                    <FiClock className="me-1" />
                                    {timeStr}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <FaCar className="me-1 text-success" />
                                <span style={{fontWeight:'500'}}>{(() => {
                                  const found = vehicles.find(v => v.id === order.vehicleId);
                                  if (found) {
                                    return `${found.brand || ''} ${found.model || ''}`.trim() || found.licensePlate || 'Chưa cập nhật';
                                  }
                                  return order.vehicleLicensePlate || 'Chưa cập nhật';
                                })()}</span>
                              </td>
                              <td>
                                <FiTool className="me-1 text-blue" />
                                {order.requestedService || '---'}
                              </td>
                              <td>
                                <FiUser className="me-1 text-gray-500" />
                                {order.assignedTechnicianName || 'Chưa phân công'}
                              </td>
                              <td>
                                {(() => {
                                  // Hiển thị serviceOrderStatus nếu có, nếu không thì hiển thị appointmentStatus
                                  const displayStatus = order.serviceOrderStatus || order.status;
                                  const getStatusStyle = (status) => {
                                    const styles = {
                                      'PENDING': { bg: '#FEF3C7', color: '#F59E0B', shadow: 'none' },
                                      'CONFIRMED': { bg: 'var(--primary-bg,#E0F2FE)', color: '#338AF3', shadow: '0 2px 8px rgba(51,138,243,0.12)' },
                                      'IN_SERVICE': { bg: 'var(--primary-bg,#E0F2FE)', color: '#338AF3', shadow: '0 2px 8px rgba(51,138,243,0.12)' },
                                      'RECEPTION': { bg: 'var(--info-bg,#E0F2FE)', color: '#0EA5E9', shadow: '0 2px 8px rgba(14,165,233,0.12)' },
                                      'INSPECTION': { bg: 'var(--primary-bg,#E0F2FE)', color: '#338AF3', shadow: '0 2px 8px rgba(51,138,243,0.12)' },
                                      'QUOTING': { bg: '#FEF3C7', color: '#F59E0B', shadow: '0 2px 8px rgba(245,158,11,0.12)' },
                                      'WAITING_FOR_PARTS': { bg: '#FEF3C7', color: '#F59E0B', shadow: '0 2px 8px rgba(245,158,11,0.12)' },
                                      'IN_PROGRESS': { bg: 'var(--primary-bg,#E0F2FE)', color: '#338AF3', shadow: '0 2px 8px rgba(51,138,243,0.12)' },
                                      'READY_FOR_INVOICE': { bg: 'var(--success-bg,#D1FADF)', color: '#34c759', shadow: '0 2px 8px rgba(52,199,89,0.12)' },
                                      'COMPLETED': { bg: 'var(--success-bg,#D1FADF)', color: '#34c759', shadow: '0 2px 8px rgba(52,199,89,0.12)' },
                                      'CANCELLED': { bg: 'var(--danger-bg,#FEE2E2)', color: '#EF4444', shadow: '0 2px 8px rgba(239,68,68,0.12)' }
                                    };
                                    return styles[status] || { bg: '#F3F4F6', color: '#6B7280', shadow: 'none' };
                                  };
                                  const getStatusLabel = (status) => {
                                    const labels = {
                                      'PENDING': 'Chờ xác nhận',
                                      'CONFIRMED': 'Đã xác nhận',
                                      'IN_SERVICE': 'Đang bảo dưỡng',
                                      'RECEPTION': 'Đã tiếp nhận',
                                      'INSPECTION': 'Đang kiểm tra',
                                      'QUOTING': 'Đang báo giá',
                                      'WAITING_FOR_PARTS': 'Chờ phụ tùng',
                                      'IN_PROGRESS': 'Đang thực hiện',
                                      'READY_FOR_INVOICE': 'Sẵn sàng thanh toán',
                                      'COMPLETED': 'Hoàn thành',
                                      'CANCELLED': 'Đã hủy'
                                    };
                                    return labels[status] || status;
                                  };
                                  const style = getStatusStyle(displayStatus);
                                  return (
                                    <span className={`status-badge status-${displayStatus.toLowerCase()}`} style={{
                                      borderRadius:'8px',
                                      padding:'4px 16px',
                                      fontWeight:'bold',
                                      background: style.bg,
                                      color: style.color,
                                      boxShadow: style.shadow,
                                      transition:'all 0.3s cubic-bezier(.4,0,.2,1)'
                                    }}>
                                      {getStatusLabel(displayStatus)}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  {/* Hiển thị nút "Theo dõi" khi appointment đã có ServiceOrder */}
                                  {order.serviceOrderId && (
                                    <CustomButton
                                      className="action-btn"
                                      icon={<FiActivity />}
                                      size="sm"
                                      variant="success"
                                      style={{
                                        minWidth:36,
                                        borderRadius:'12px',
                                        background:'linear-gradient(90deg,#34c759 0%,#28a745 100%)',
                                        color:'#fff',
                                        boxShadow:'0 2px 8px rgba(52,199,89,0.18)',
                                        transition:'all 0.3s cubic-bezier(.4,0,.2,1)',
                                        fontWeight:'bold',
                                        padding:'10px 20px',
                                        transform:'scale(1)',
                                      }}
                                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.04)'}
                                      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                                      onClick={() => navigate(`/customer/order-tracking/${order.serviceOrderId}`)}
                                    >
                                      Theo dõi
                                    </CustomButton>
                                  )}
                                  <CustomButton
                                    className="action-btn"
                                    icon={<FiEye />}
                                    size="sm"
                                    variant="primary"
                                    style={{
                                      minWidth:36,
                                      borderRadius:'12px',
                                      background:'linear-gradient(90deg,#338AF3 0%,#6B47DC 100%)',
                                      color:'#fff',
                                      boxShadow:'0 2px 8px rgba(51,138,243,0.18)',
                                      transition:'all 0.3s cubic-bezier(.4,0,.2,1)',
                                      fontWeight:'bold',
                                      padding:'10px 20px',
                                      transform:'scale(1)',
                                    }}
                                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.04)'}
                                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                                    onClick={() => setSelectedOrder(order) || setShowDetailModal(true)}
                                  >
                                    Chi tiết
                                  </CustomButton>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted py-5">
                Không có đơn bảo dưỡng nào.
              </div>
            )}
          </Card.Body>
        </Card>
        <MaintenanceDetailModal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          order={selectedOrder ? {
            ...selectedOrder,
            vehicleModel: (() => {
              const found = vehicles.find(v => v.id === selectedOrder.vehicleId);
              if (found) {
                return found.model || '';
              }
              return selectedOrder.vehicleModel || '';
            })(),
            vehicleBrand: (() => {
              const found = vehicles.find(v => v.id === selectedOrder.vehicleId);
              if (found) {
                return found.brand || '';
              }
              return selectedOrder.vehicleBrand || '';
            })(),
            vehicleLicensePlate: (() => {
              const found = vehicles.find(v => v.id === selectedOrder.vehicleId);
              if (found) {
                return found.licensePlate || '';
              }
              return selectedOrder.vehicleLicensePlate || '';
            })(),
            yearManufactured: (() => {
              const found = vehicles.find(v => v.id === selectedOrder.vehicleId);
              if (found) {
                return found.yearManufactured || '';
              }
              return selectedOrder.yearManufactured || '';
            })(),
          } : null}
        />
      </Container>
    </>
  );
}

export default History;

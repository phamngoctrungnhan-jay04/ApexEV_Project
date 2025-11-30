import React from 'react';
import './MaintenanceDetailModal.css';

function MaintenanceDetailModal({ open, onClose, order }) {
  if (!open || !order) return null;

  // Format ngày giờ
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
    }
  }

  // Dịch vụ (nếu là mảng)
  let serviceList = [];
  if (Array.isArray(order.requestedService)) {
    serviceList = order.requestedService;
  } else if (order.requestedService) {
    serviceList = [order.requestedService];
  }

  return (
    <div className="maintenance-modal-overlay">
      <div className="maintenance-modal-card maintenance-modal-card--large">
        <div className="maintenance-modal-header">
          <span className="maintenance-modal-title">Chi tiết đơn bảo dưỡng</span>
          <button className="maintenance-modal-close" onClick={onClose} type="button">×</button>
        </div>
        <div className="maintenance-modal-content">
          <div className="maintenance-info-row">
            <span className="maintenance-info-label">Mã đơn:</span>
            <span className="maintenance-info-value">{order.id || order.code}</span>
          </div>
          <div className="maintenance-info-row">
            <span className="maintenance-info-label">Trạng thái:</span>
            <span className="maintenance-info-value status">{order.status}</span>
          </div>
          <div className="maintenance-info-row">
            <span className="maintenance-info-label">Ngày giờ:</span>
            <span className="maintenance-info-value">{dateStr} {timeStr && (<span style={{marginLeft:8}}>{timeStr}</span>)}</span>
          </div>
          <div className="maintenance-info-row">
            <span className="maintenance-info-label">Khách hàng:</span>
            <span className="maintenance-info-value">{order.customerFullName || '--'}</span>
          </div>
          {order.customerEmail && (
            <div className="maintenance-info-row">
              <span className="maintenance-info-label">Email khách:</span>
              <span className="maintenance-info-value">{order.customerEmail}</span>
            </div>
          )}
          {order.customerPhone && (
            <div className="maintenance-info-row">
              <span className="maintenance-info-label">SĐT khách:</span>
              <span className="maintenance-info-value">{order.customerPhone}</span>
            </div>
          )}
          <div className="maintenance-info-row">
            <span className="maintenance-info-label">Model xe:</span>
            <span className="maintenance-info-value">{order.vehicleModel || '--'}</span>
          </div>
          <div className="maintenance-info-row">
            <span className="maintenance-info-label">Xe:</span>
            <span className="maintenance-info-value">{order.vehicleBrand ? `${order.vehicleBrand} ` : ''}{order.vehicleLicensePlate ? `- ${order.vehicleLicensePlate}` : ''}</span>
          </div>
          {order.yearManufactured && (
            <div className="maintenance-info-row">
              <span className="maintenance-info-label">Năm sản xuất:</span>
              <span className="maintenance-info-value">{order.yearManufactured}</span>
            </div>
          )}
          <div className="maintenance-info-row">
            <span className="maintenance-info-label">Dịch vụ:</span>
            <span className="maintenance-info-value">
              {serviceList.length > 0 ? (
                <ul style={{margin:0,paddingLeft:18}}>
                  {serviceList.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              ) : '--'}
            </span>
          </div>
          {order.totalCost && (
            <div className="maintenance-info-row">
              <span className="maintenance-info-label">Tổng chi phí:</span>
              <span className="maintenance-info-value" style={{color:'#34c759'}}>{order.totalCost.toLocaleString('vi-VN')} ₫</span>
            </div>
          )}
          <div className="maintenance-info-row">
            <span className="maintenance-info-label">Kỹ thuật viên/Cố vấn:</span>
            <span className="maintenance-info-value">{order.serviceAdvisorName || order.technicianName || '--'}</span>
          </div>
          <div className="maintenance-info-row">
            <span className="maintenance-info-label">Ghi chú:</span>
            <span className="maintenance-info-value">{order.notes || order.note || '--'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceDetailModal;

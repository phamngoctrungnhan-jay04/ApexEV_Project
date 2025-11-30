import React, { useEffect, useState } from 'react';
import { FiBell, FiCheckCircle, FiDollarSign, FiCalendar, FiXCircle, FiTrash2 } from 'react-icons/fi';
// Giả sử bạn import đúng service
import notificationService from '../../services/notificationService'; 
import './NotificationList.css';

const iconMap = {
  'booking-confirmed': <FiCheckCircle color="#34c759" />,
  'service-completed': <FiCheckCircle color="#338AF3" />,
  'payment-received': <FiDollarSign color="#10B981" />,
  'service-reminder': <FiCalendar color="#F59E0B" />,
  'cancelled': <FiXCircle color="#EF4444" />,
  'default': <FiBell color="#338AF3" />
};

function getTypeFromMessage(message) {
  if (!message) return 'default';
  const msg = message.toLowerCase();
  if (msg.includes('từ chối') || msg.includes('hủy')) return 'cancelled';
  if (msg.includes('xác nhận')) return 'booking-confirmed';
  if (msg.includes('thành công')) return 'booking-confirmed';
  if (msg.includes('hoàn thành')) return 'service-completed';
  if (msg.includes('nhắc lịch')) return 'service-reminder';
  if (msg.includes('thanh toán')) return 'payment-received';
  return 'default';
}

function NotificationList({ onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    notificationService.getMyNotifications()
      .then(data => {
        let notifs = Array.isArray(data) ? data : (data ? [data] : []);
        setNotifications(notifs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi tải thông báo:', err);
        setError('Không thể tải thông báo');
        setLoading(false);
      });
  };

  // Hàm xóa tất cả (Đưa ra ngoài vòng lặp render)
  const handleDeleteAll = async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  // Helper format thời gian
  const formatTime = (createdAt) => {
    if (!createdAt) return '---';
    try {
        if (Array.isArray(createdAt)) {
            const [y, m, d, h, min, s] = createdAt;
            return new Date(y, m - 1, d, h, min, s).toLocaleString('vi-VN');
        }
        return new Date(createdAt).toLocaleString('vi-VN');
    } catch (e) {
        return '---';
    }
  };

  return (
    <div className="notification-modal">
      {/* 1. Header cố định */}
      <div className="notification-header">
        <span className="title">Thông báo</span>
        <button className="close-btn" onClick={onClose}><FiXCircle size={20} /></button>
      </div>

      {/* 2. Body có thanh cuộn */}
      <div className="notification-body custom-scrollbar">
        {loading && <div className="state-text">Đang tải...</div>}
        {error && <div className="state-text error">{error}</div>}
        {!loading && notifications.length === 0 && (
          <div className="state-text empty">Không có thông báo mới</div>
        )}

        <ul className="notification-items">
          {notifications.map(notif => {
            const id = notif.id || notif.notification_id;
            const isRead = notif.isRead === true || notif.is_read === '01';
            const type = getTypeFromMessage(notif.message);
            
            return (
              <li key={id} className={`notification-item ${isRead ? 'read' : 'unread'}`}>
                <div className="item-icon">{iconMap[type]}</div>
                <div className="item-content">
                  <p className="item-message">{notif.message}</p>
                  <span className="item-time">{formatTime(notif.createdAt || notif.created_at)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 3. Footer cố định (chỉ hiện khi có thông báo) */}
      {notifications.length > 0 && (
        <div className="notification-footer">
          <button className="delete-all-btn" onClick={handleDeleteAll}>
            <FiTrash2 /> Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationList;
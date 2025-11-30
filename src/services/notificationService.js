
import axios from 'axios';

const API_BASE = '/api/notifications';

const getAuthToken = () => localStorage.getItem('accessToken');

const notificationService = {
  getMyNotifications: async () => {
    const res = await axios.get(`${API_BASE}/my-notifications`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    console.log('[notificationService] API /my-notifications trả về:', res.data);
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await axios.get(`${API_BASE}/unread-count`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    return res.data.unreadCount;
  },
  markAsRead: async (id) => {
    await axios.patch(`${API_BASE}/${id}/mark-read`, {}, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
  },
  markAllAsRead: async () => {
    await axios.patch(`${API_BASE}/mark-all-read`, {}, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
  },
  deleteAllNotifications: async () => {
    await axios.delete(`${API_BASE}/delete-all`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
  }
};

export default notificationService;

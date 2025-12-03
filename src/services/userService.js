// File: src/services/userService.js
// Service gọi API quản lý user (ProfileController)

// Xây dựng BASE_URL an toàn: nếu biến môi trường không tồn tại sẽ fallback local
const RAW_BASE = import.meta.env.VITE_API_URL;
const API_BASE_URL = (RAW_BASE && RAW_BASE.trim())
  ? `${RAW_BASE.replace(/\/$/, '')}/user-profile`
  : 'http://localhost:8081/user-profile';
// console.debug('[userService] API_BASE_URL =', API_BASE_URL);

const userService = {
  async getUsersByRole(role) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/list?role=${role}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) {
      throw new Error('Không thể lấy danh sách user');
    }
    const result = await response.json();
    return result.data;
  },

  async toggleUserActive(userId, isActive) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/toggle-active`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ userId, isActive })
    });
    if (!response.ok) {
      throw new Error('Không thể cập nhật trạng thái hoạt động');
    }
    return await response.json();
  },

  async updateUserRole(userId, newRole) {
    const token = localStorage.getItem('accessToken');
    const payload = { userId, newRole };
    const response = await fetch(`${API_BASE_URL}/update-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      // Thử đọc thông điệp lỗi cụ thể từ backend nếu có
      let detail;
      try { detail = await response.json(); } catch (_) {}
      const message = detail?.message || `Không thể cập nhật vai trò (status ${response.status})`;
      throw new Error(message);
    }
    return await response.json();
  },

  async deleteUser(userId) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ userId })
    });
    if (!response.ok) {
      throw new Error('Không thể xóa tài khoản');
    }
    return await response.json();
  }
};

export default userService;

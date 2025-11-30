// File: src/services/userService.js
// Service gọi API lấy danh sách user theo role

const API_BASE_URL = import.meta.env.VITE_API_URL + '/user-profile' || 'http://localhost:8081/user-profile';

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
    const response = await fetch(`${API_BASE_URL}/update-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ userId, newRole })
    });
    if (!response.ok) {
      throw new Error('Không thể cập nhật vai trò');
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

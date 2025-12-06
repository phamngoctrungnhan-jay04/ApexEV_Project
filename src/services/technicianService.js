// File: src/services/technicianService.js
// Service API cho Kỹ thuật viên - APEX EV

const API_BASE = 'http://localhost:8081/api';

// Helper function để lấy token
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Helper function xử lý response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Lấy danh sách công việc của kỹ thuật viên hiện tại
 * GET /api/technician/my-works
 */
export const getMyWorks = async () => {
  try {
    const response = await fetch(`${API_BASE}/technician/my-works`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('getMyWorks error:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một công việc
 * GET /api/technician/works/{id}
 */
export const getWorkDetail = async (workId) => {
  try {
    const response = await fetch(`${API_BASE}/technician/works/${workId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('getWorkDetail error:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái công việc
 * PATCH /api/technician/works/{id}/status
 * @param {number} workId - ID công việc
 * @param {string} newStatus - Trạng thái mới (IN_PROGRESS, READY_FOR_INVOICE, etc.)
 */
export const updateWorkStatus = async (workId, newStatus) => {
  try {
    const response = await fetch(`${API_BASE}/technician/works/${workId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newStatus })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('updateWorkStatus error:', error);
    throw error;
  }
};

/**
 * Cập nhật ghi chú công việc
 * PATCH /api/technician/works/{id}/notes
 * @param {number} workId - ID công việc
 * @param {string} notes - Ghi chú mới
 */
export const updateWorkNotes = async (workId, notes) => {
  try {
    const response = await fetch(`${API_BASE}/technician/works/${workId}/notes`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('updateWorkNotes error:', error);
    throw error;
  }
};

/**
 * Lấy thống kê dashboard của kỹ thuật viên
 * (Frontend tự tính từ danh sách công việc)
 */
export const getDashboardStats = async () => {
  try {
    const works = await getMyWorks();
    
    const today = new Date().toISOString().split('T')[0];
    
    // Tính toán thống kê
    const stats = {
      totalCompleted: works.filter(w => w.status === 'COMPLETED').length,
      todayTasks: works.filter(w => {
        const workDate = w.scheduledDate || w.appointmentDate;
        return workDate && workDate.split('T')[0] === today;
      }).length,
      inProgress: works.filter(w => w.status === 'IN_PROGRESS').length,
      pending: works.filter(w => w.status === 'ASSIGNED' || w.status === 'PENDING').length
    };
    
    // Công việc hôm nay
    const todayWorks = works.filter(w => {
      const workDate = w.scheduledDate || w.appointmentDate;
      return workDate && workDate.split('T')[0] === today;
    });
    
    // Công việc đã hoàn thành gần đây (5 gần nhất)
    const recentCompleted = works
      .filter(w => w.status === 'COMPLETED')
      .sort((a, b) => new Date(b.completedDate || b.updatedAt) - new Date(a.completedDate || a.updatedAt))
      .slice(0, 5);
    
    return {
      stats,
      todayWorks,
      recentCompleted,
      allWorks: works
    };
  } catch (error) {
    console.error('getDashboardStats error:', error);
    throw error;
  }
};

export default {
  getMyWorks,
  getWorkDetail,
  updateWorkStatus,
  updateWorkNotes,
  getDashboardStats
};

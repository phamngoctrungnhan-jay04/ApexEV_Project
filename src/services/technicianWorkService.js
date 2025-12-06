// File: src/services/technicianWorkService.js
// Service API cho công việc của Kỹ thuật viên - APEX EV

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
  // Handle empty response (204 No Content)
  if (response.status === 204) {
    return [];
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : [];
};

/**
 * Lấy danh sách orders được phân công cho technician
 * GET /api/technician/my-works
 */
export const getMyOrders = async () => {
  try {
    const response = await fetch(`${API_BASE}/technician/my-works`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const works = await handleResponse(response);
    
    // Transform to consistent format for JobList
    return works.map(work => {
      // Parse appointmentTime (ngày hẹn) - có thể là string ISO hoặc array từ LocalDateTime Java
      let appointmentDate = null;
      let appointmentTime = null;
      
      if (work.appointmentTime) {
        if (typeof work.appointmentTime === 'string') {
          // ISO string format: "2025-12-05T10:30:00"
          appointmentDate = work.appointmentTime.split('T')[0];
          appointmentTime = work.appointmentTime.split('T')[1]?.substring(0, 5);
        } else if (Array.isArray(work.appointmentTime)) {
          // Java LocalDateTime array format: [2025, 12, 5, 10, 30, 0]
          const [year, month, day, hour = 0, minute = 0] = work.appointmentTime;
          appointmentDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          appointmentTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        }
      }

      // Parse createdAt (thời gian đặt lịch)
      let createdAt = null;
      if (work.createdAt) {
        if (typeof work.createdAt === 'string') {
          createdAt = work.createdAt;
        } else if (Array.isArray(work.createdAt)) {
          const [year, month, day, hour = 0, minute = 0, second = 0] = work.createdAt;
          createdAt = new Date(year, month - 1, day, hour, minute, second).toISOString();
        }
      }

      return {
        orderId: work.id,
        status: work.status,
        customerName: work.customerName,
        customerPhone: work.customerPhone,
        vehicleBrand: work.vehicleBrand,
        vehicleModel: work.vehicleModel,
        licensePlate: work.vehicleLicensePlate,
        appointmentDate,
        appointmentTime,
        createdAt,
        notes: work.customerDescription
      };
    });
  } catch (error) {
    console.error('getMyOrders error:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết các items trong order
 * GET /api/technician/works/{orderId}
 * Returns: { orderItems, advisorNotes, technicianNotes, ... }
 */
export const getOrderItems = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE}/technician/works/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const detail = await handleResponse(response);
    
    // Debug log để xem response từ backend
    console.log('[DEBUG] getOrderItems response:', detail);
    console.log('[DEBUG] orderItems:', detail.orderItems);
    
    // Return full detail including orderItems and notes
    return {
      orderItems: detail.orderItems || [],
      advisorNotes: detail.advisorNotes || '',
      technicianNotes: detail.technicianNotes || '',
      customerDescription: detail.customerDescription || ''
    };
  } catch (error) {
    console.error('getOrderItems error:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái công việc (generic)
 * PATCH /api/technician/works/{orderId}/status
 */
export const updateWorkStatus = async (orderId, newStatus) => {
  try {
    const response = await fetch(`${API_BASE}/technician/works/${orderId}/status`, {
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
 * Bắt đầu công việc - cập nhật trạng thái order sang IN_PROGRESS
 * PATCH /api/technician/works/{orderId}/status
 * @deprecated Sử dụng updateWorkStatus thay thế
 */
export const startWork = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE}/technician/works/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newStatus: 'IN_PROGRESS' })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('startWork error:', error);
    throw error;
  }
};

/**
 * Hoàn thành công việc - cập nhật trạng thái order sang READY_FOR_INVOICE
 * PATCH /api/technician/works/{orderId}/status
 */
export const completeWork = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE}/technician/works/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newStatus: 'READY_FOR_INVOICE' })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('completeWork error:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một order
 * GET /api/technician/works/{orderId}
 */
export const getOrderDetail = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE}/technician/works/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('getOrderDetail error:', error);
    throw error;
  }
};

/**
 * Cập nhật ghi chú của technician cho order
 * PATCH /api/technician/works/{orderId}/notes
 */
export const updateOrderNotes = async (orderId, notes) => {
  try {
    const response = await fetch(`${API_BASE}/technician/works/${orderId}/notes`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('updateOrderNotes error:', error);
    throw error;
  }
};

export default {
  getMyOrders,
  getOrderItems,
  updateWorkStatus,
  startWork,
  completeWork,
  getOrderDetail,
  updateOrderNotes
};

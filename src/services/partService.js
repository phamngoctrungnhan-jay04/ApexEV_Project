import axios from 'axios';

const API_URL = 'http://localhost:8081/api/parts';

// Lấy token từ localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Lấy danh sách tất cả phụ tùng
 */
export const getAllParts = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('getAllParts error:', error);
    throw error;
  }
};

/**
 * Tìm kiếm phụ tùng
 */
export const searchParts = async (keyword) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { keyword },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('searchParts error:', error);
    throw error;
  }
};

/**
 * Tạo yêu cầu phụ tùng mới
 */
export const createPartRequest = async (serviceOrderId, partId, quantity, urgency = 'NORMAL', notes = null) => {
  try {
    const response = await axios.post(`${API_URL}/requests`, {
      serviceOrderId,
      partId,
      quantity,
      urgency,
      notes
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('createPartRequest error:', error);
    throw error;
  }
};

/**
 * Lấy danh sách yêu cầu của technician hiện tại
 */
export const getMyPartRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/requests/my`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('getMyPartRequests error:', error);
    throw error;
  }
};

/**
 * Lấy yêu cầu theo service order
 */
export const getPartRequestsByOrder = async (serviceOrderId) => {
  try {
    const response = await axios.get(`${API_URL}/requests/order/${serviceOrderId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('getPartRequestsByOrder error:', error);
    throw error;
  }
};

/**
 * Lấy tất cả yêu cầu đang chờ duyệt (Advisor/Admin)
 */
export const getPendingPartRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/requests/pending`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('getPendingPartRequests error:', error);
    throw error;
  }
};

/**
 * Duyệt yêu cầu (Advisor/Admin)
 */
export const approvePartRequest = async (requestId, notes = null) => {
  try {
    const response = await axios.patch(
      `${API_URL}/requests/${requestId}/approve`,
      null,
      {
        params: { notes },
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error('approvePartRequest error:', error);
    throw error;
  }
};

/**
 * Từ chối yêu cầu (Advisor/Admin)
 */
export const rejectPartRequest = async (requestId, notes = null) => {
  try {
    const response = await axios.patch(
      `${API_URL}/requests/${requestId}/reject`,
      null,
      {
        params: { notes },
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error('rejectPartRequest error:', error);
    throw error;
  }
};

/**
 * Hủy yêu cầu (Technician)
 */
export const cancelPartRequest = async (requestId) => {
  try {
    const response = await axios.delete(`${API_URL}/requests/${requestId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('cancelPartRequest error:', error);
    throw error;
  }
};

// ==================== ADMIN CRUD APIs ====================

const ADMIN_API_URL = 'http://localhost:8081/api/parts/admin';

/**
 * Lấy tất cả phụ tùng cho Admin (entity đầy đủ)
 */
export const getAllPartsForAdmin = async () => {
  try {
    const response = await axios.get(`${ADMIN_API_URL}/all`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('getAllPartsForAdmin error:', error);
    throw error;
  }
};

/**
 * Lấy phụ tùng theo ID (Admin)
 */
export const getPartById = async (partId) => {
  try {
    const response = await axios.get(`${ADMIN_API_URL}/${partId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('getPartById error:', error);
    throw error;
  }
};

/**
 * Tạo phụ tùng mới (Admin)
 */
export const createPart = async (partData) => {
  try {
    const response = await axios.post(ADMIN_API_URL, partData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('createPart error:', error);
    throw error;
  }
};

/**
 * Cập nhật phụ tùng (Admin)
 */
export const updatePart = async (partId, partData) => {
  try {
    const response = await axios.put(`${ADMIN_API_URL}/${partId}`, partData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('updatePart error:', error);
    throw error;
  }
};

/**
 * Xóa phụ tùng (Admin)
 */
export const deletePart = async (partId) => {
  try {
    const response = await axios.delete(`${ADMIN_API_URL}/${partId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('deletePart error:', error);
    throw error;
  }
};

/**
 * Cập nhật số lượng tồn kho (Admin)
 * @param {number} partId - ID phụ tùng
 * @param {number} quantity - Số lượng
 * @param {string} action - "add" (nhập), "subtract" (xuất), "set" (đặt cố định)
 */
export const updateStock = async (partId, quantity, action = 'add') => {
  try {
    const response = await axios.patch(
      `${ADMIN_API_URL}/${partId}/stock`,
      null,
      {
        params: { quantity, action },
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error('updateStock error:', error);
    throw error;
  }
};

export default {
  getAllParts,
  searchParts,
  getAllPartsForAdmin,
  getPartById,
  createPart,
  updatePart,
  deletePart,
  updateStock,
  createPartRequest,
  getMyPartRequests,
  getPartRequestsByOrder,
  getPendingPartRequests,
  approvePartRequest,
  rejectPartRequest,
  cancelPartRequest
};

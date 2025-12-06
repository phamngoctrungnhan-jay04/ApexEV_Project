// File: src/services/customerOrderService.js
// API Service cho Customer theo dõi đơn hàng bảo dưỡng

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

function getAuthHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Lấy danh sách tất cả đơn hàng bảo dưỡng của Customer
 * Endpoint: GET /service-orders/my-history
 */
export const getMyOrders = async () => {
  const res = await axios.get(`${API_BASE}/service-orders/my-history`, {
    headers: getAuthHeader()
  });
  return res.data;
};

/**
 * Lấy chi tiết 1 đơn hàng bảo dưỡng
 * Endpoint: GET /service-orders/{id}
 */
export const getOrderDetail = async (orderId) => {
  const res = await axios.get(`${API_BASE}/service-orders/${orderId}`, {
    headers: getAuthHeader()
  });
  return res.data;
};

/**
 * Lấy thông tin hóa đơn của đơn hàng (bao gồm phụ tùng phát sinh)
 * Endpoint: GET /invoices/order/{orderId}
 */
export const getOrderInvoice = async (orderId) => {
  try {
    const res = await axios.get(`${API_BASE}/invoices/order/${orderId}`, {
      headers: getAuthHeader()
    });
    return res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Chưa có invoice
    }
    throw error;
  }
};

/**
 * Export default object
 */
const customerOrderService = {
  getMyOrders,
  getOrderDetail,
  getOrderInvoice
};

export default customerOrderService;

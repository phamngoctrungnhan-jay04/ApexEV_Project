// File: src/services/invoiceService.js
// Service để quản lý Invoice - Xuất hóa đơn cho customer

import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/invoices`;

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken'); // Sửa từ 'token' thành 'accessToken'
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Lấy danh sách đơn hàng sẵn sàng xuất hóa đơn (READY_FOR_INVOICE)
 */
export const getOrdersReadyForInvoice = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/ready-orders`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('getOrdersReadyForInvoice error:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết đơn hàng để hiển thị trước khi xuất hóa đơn
 */
export const getOrderDetailForInvoice = async (orderId) => {
  try {
    const response = await axios.get(
      `${API_URL}/order-detail/${orderId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('getOrderDetailForInvoice error:', error);
    throw error;
  }
};

/**
 * Tạo hóa đơn cho đơn hàng
 */
export const createInvoice = async (orderId, invoiceData) => {
  try {
    const response = await axios.post(
      `${API_URL}/create/${orderId}`,
      invoiceData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('createInvoice error:', error);
    throw error;
  }
};

/**
 * Xác nhận thanh toán và giao xe
 */
export const confirmPaymentAndDeliver = async (invoiceId) => {
  try {
    const response = await axios.post(
      `${API_URL}/${invoiceId}/confirm-payment`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('confirmPaymentAndDeliver error:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết hóa đơn
 */
export const getInvoiceDetail = async (invoiceId) => {
  try {
    const response = await axios.get(
      `${API_URL}/${invoiceId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('getInvoiceDetail error:', error);
    throw error;
  }
};

/**
 * Cập nhật hóa đơn
 */
export const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    const response = await axios.put(
      `${API_URL}/${invoiceId}`,
      invoiceData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('updateInvoice error:', error);
    throw error;
  }
};

/**
 * Gửi hóa đơn qua email cho customer
 */
export const sendInvoiceEmail = async (invoiceId) => {
  try {
    const response = await axios.post(
      `${API_URL}/${invoiceId}/send-email`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('sendInvoiceEmail error:', error);
    throw error;
  }
};

/**
 * In/tải xuống hóa đơn PDF
 */
export const downloadInvoicePDF = async (invoiceId) => {
  try {
    const response = await axios.get(
      `${API_URL}/${invoiceId}/download`,
      {
        headers: getAuthHeader(),
        responseType: 'blob'
      }
    );
    return response.data;
  } catch (error) {
    console.error('downloadInvoicePDF error:', error);
    throw error;
  }
};

export default {
  getOrdersReadyForInvoice,
  getReadyOrders: getOrdersReadyForInvoice, // Alias
  getOrderDetailForInvoice,
  createInvoice,
  confirmPaymentAndDeliver,
  getInvoiceDetail,
  updateInvoice,
  sendInvoiceEmail,
  downloadInvoicePDF
};

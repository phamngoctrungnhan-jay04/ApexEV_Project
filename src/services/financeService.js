// File: src/services/financeService.js
// Service gọi API quản lý tài chính

const API_BASE_URL = 'http://localhost:8081/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const financeService = {
  /**
   * Lấy tất cả hóa đơn (có filter)
   * @param {Object} filters - { status, startDate, endDate }
   */
  getAllInvoices: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/finance/invoices${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể tải danh sách hóa đơn');
    }

    return response.json();
  },

  /**
   * Lấy chi tiết hóa đơn
   * @param {number} invoiceId
   */
  getInvoiceDetail: async (invoiceId) => {
    const response = await fetch(`${API_BASE_URL}/finance/invoices/${invoiceId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể tải chi tiết hóa đơn');
    }

    return response.json();
  },

  /**
   * Lấy thống kê tài chính
   * @param {Object} filters - { startDate, endDate }
   */
  getStatistics: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/finance/statistics${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể tải thống kê tài chính');
    }

    return response.json();
  },

  /**
   * Lấy thống kê theo tháng
   * @param {number} months - Số tháng cần lấy (mặc định 6)
   */
  getMonthlyStatistics: async (months = 6) => {
    const response = await fetch(`${API_BASE_URL}/finance/statistics/monthly?months=${months}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể tải thống kê theo tháng');
    }

    return response.json();
  },

  /**
   * Xác nhận thanh toán
   * @param {number} invoiceId
   * @param {string} paymentMethod - Phương thức thanh toán
   */
  confirmPayment: async (invoiceId, paymentMethod = 'CASH') => {
    const params = new URLSearchParams();
    if (paymentMethod) {
      params.append('paymentMethod', paymentMethod);
    }

    const response = await fetch(
      `${API_BASE_URL}/finance/invoices/${invoiceId}/confirm-payment?${params.toString()}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể xác nhận thanh toán');
    }

    return response.json();
  },

  /**
   * Hủy hóa đơn
   * @param {number} invoiceId
   * @param {string} reason - Lý do hủy
   */
  cancelInvoice: async (invoiceId, reason = '') => {
    const params = new URLSearchParams();
    if (reason) {
      params.append('reason', reason);
    }

    const response = await fetch(
      `${API_BASE_URL}/finance/invoices/${invoiceId}/cancel?${params.toString()}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể hủy hóa đơn');
    }

    return response.json();
  },

  /**
   * Lấy danh sách hóa đơn quá hạn
   */
  getOverdueInvoices: async () => {
    const response = await fetch(`${API_BASE_URL}/finance/invoices/overdue`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể tải hóa đơn quá hạn');
    }

    return response.json();
  }
};

export default financeService;

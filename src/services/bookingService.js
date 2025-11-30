import axios from 'axios';

// Helper: get JWT token from localStorage
import authService from './authService';

function getAuthHeader() {
  return authService.getAuthHeader();
}

// Lấy lịch sử bảo dưỡng của khách hàng (tất cả)
export async function getUserHistory() {
  try {
    const response = await axios.get('/api/appointments/my-appointment-customer', {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user history:', error);
    return [];
  }
}

// Lấy lịch sử bảo dưỡng đã hoàn thành
export async function getCompletedHistory() {
  try {
    const response = await axios.get('/api/appointments/my-appointment-customer', {
      headers: getAuthHeader()
    });
    return (response.data || []).filter(order => order.status === 'COMPLETED');
  } catch (error) {
    console.error('Error fetching completed history:', error);
    return [];
  }
}

// Lấy lịch sử bảo dưỡng chờ xác nhận (PENDING)
export async function getPendingHistory() {
  try {
    const response = await axios.get('/api/appointments/my-appointment-customer', {
      headers: getAuthHeader()
    });
    return (response.data || []).filter(order => order.status === 'PENDING');
  } catch (error) {
    console.error('Error fetching pending history:', error);
    return [];
  }
}

// Lấy lịch sử bảo dưỡng đã xác nhận (CONFIRMED)
export async function getConfirmedHistory() {
  try {
    const response = await axios.get('/api/appointments/my-appointment-customer', {
      headers: getAuthHeader()
    });
    return (response.data || []).filter(order => order.status === 'CONFIRMED');
  } catch (error) {
    console.error('Error fetching confirmed history:', error);
    return [];
  }
}

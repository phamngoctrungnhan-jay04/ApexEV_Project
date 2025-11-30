// Service client for fetching available services
const API_BASE_URL = import.meta.env.VITE_API_URL + '/api/services' || 'http://localhost:8081/api/services';

class ServiceService {
  getAuthToken() {
    return localStorage.getItem('accessToken');
  }

  // Lấy danh sách dịch vụ bảo dưỡng
  async getAllServices() {
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });
      if (!res.ok) {
        console.error('Failed to fetch services', res.status);
        return [];
      }
      return await res.json();
    } catch (err) {
      console.error('getAllServices error', err);
      return [];
    }
  }
}

const serviceService = new ServiceService();
export default serviceService;

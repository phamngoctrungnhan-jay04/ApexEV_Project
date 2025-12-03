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

  // Thêm dịch vụ mới
  async createService(serviceData) {
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(serviceData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Thêm dịch vụ thất bại');
      }
      return await res.json();
    } catch (err) {
      console.error('createService error', err);
      throw err;
    }
  }

  // Cập nhật dịch vụ
  async updateService(serviceId, serviceData) {
    try {
      const res = await fetch(`${API_BASE_URL}/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(serviceData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Cập nhật dịch vụ thất bại');
      }
      return await res.json();
    } catch (err) {
      console.error('updateService error', err);
      throw err;
    }
  }

  // Xóa dịch vụ
  async deleteService(serviceId) {
    try {
      const res = await fetch(`${API_BASE_URL}/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });
      if (!res.ok) {
        // Nếu response có body thì parse, nếu không thì dùng statusText
        let errorMessage = 'Xóa dịch vụ thất bại';
        try {
          const error = await res.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      // Response 204 No Content không có body, không cần parse JSON
      return { success: true };
    } catch (err) {
      console.error('deleteService error', err);
      throw err;
    }
  }
}

const serviceService = new ServiceService();
export default serviceService;

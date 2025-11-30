// Vehicle Service for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL + '/vehicles' || 'http://localhost:8081/vehicles';

class VehicleService {
  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('accessToken');
  }

  // Add new vehicle
  async addVehicle(vehicleData) {
    try {
      // Clean data: nếu vinNumber rỗng, set null thay vì chuỗi rỗng
      const cleanData = {
        ...vehicleData,
        vinNumber: vehicleData.vinNumber?.trim() || null
      };
      
      console.log('Adding vehicle:', cleanData);
      
      const response = await fetch(`${API_BASE_URL}/createVehicle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(cleanData),
      });

      console.log('Add vehicle response:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Add vehicle failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        // Parse validation errors
        if (response.status === 400 && errorData.message) {
          throw new Error(errorData.message);
        }
        
        throw new Error('Không thể thêm xe. Vui lòng thử lại.');
      }

      const data = await response.json();
      console.log('✅ Vehicle added:', data);
      return data;
    } catch (error) {
      console.error('Add vehicle error:', error);
      throw error;
    }
  }

  // Get my vehicles
  async getMyVehicles() {
    try {
      console.log('Getting my vehicles...');
      
      const response = await fetch(`${API_BASE_URL}/my-vehicles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      console.log('Get my vehicles response:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Get my vehicles failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorData.message || 'Không thể lấy danh sách xe.');
      }

      const data = await response.json();
      console.log('✅ My vehicles:', data);
      return data;
    } catch (error) {
      console.error('Get my vehicles error:', error);
      throw error;
    }
  }

  // Get vehicle by ID
  async getVehicleById(vehicleId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vehicleId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Get vehicle failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        if (response.status === 404) {
          throw new Error('Không tìm thấy xe.');
        }
        
        throw new Error(errorData.message || 'Không thể lấy thông tin xe.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get vehicle error:', error);
      throw error;
    }
  }

  // Update vehicle
  async updateVehicle(vehicleId, vehicleData) {
    try {
      // Clean data: nếu vinNumber rỗng, set null thay vì chuỗi rỗng
      const cleanData = {
        ...vehicleData,
        vinNumber: vehicleData.vinNumber?.trim() || null
      };
      
      console.log('Updating vehicle:', vehicleId, cleanData);
      
      const response = await fetch(`${API_BASE_URL}/update/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(cleanData),
      });

      console.log('Update vehicle response:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Update vehicle failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        if (response.status === 404) {
          throw new Error('Không tìm thấy xe.');
        }
        
        // Parse validation errors
        if (response.status === 400 && errorData.message) {
          throw new Error(errorData.message);
        }
        
        throw new Error('Không thể cập nhật thông tin xe. Vui lòng thử lại.');
      }

      const data = await response.json();
      console.log('✅ Vehicle updated:', data);
      return data;
    } catch (error) {
      console.error('Update vehicle error:', error);
      throw error;
    }
  }

  // Delete vehicle
  async deleteVehicle(vehicleId) {
    try {
      console.log('Deleting vehicle:', vehicleId);
      
      const response = await fetch(`${API_BASE_URL}/delete/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      console.log('Delete vehicle response:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Delete vehicle failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        if (response.status === 404) {
          throw new Error('Không tìm thấy xe.');
        }
        
        throw new Error(errorData.message || 'Không thể xóa xe. Vui lòng thử lại.');
      }

      console.log('✅ Vehicle deleted');
      return true;
    } catch (error) {
      console.error('Delete vehicle error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const vehicleService = new VehicleService();
export default vehicleService;

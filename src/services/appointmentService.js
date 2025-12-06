// Appointment Service for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL + '/api/appointments' || 'http://localhost:8081/api/appointments';

class AppointmentService {
  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('accessToken');
  }

  // Lấy danh sách lịch hẹn trạng thái PENDING cho advisor
  async getPendingAppointments() {
    try {
      const response = await fetch(`${API_BASE_URL}/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể lấy danh sách lịch hẹn chờ xác nhận.');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Create appointment (Đặt lịch)
  async createAppointment(appointmentData) {
    try {
      console.log('Creating appointment:', appointmentData);
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(appointmentData),
      });

      console.log('Create appointment response:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Create appointment failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorData.message || 'Không thể đặt lịch hẹn. Vui lòng thử lại.');
      }

      const data = await response.json();
      console.log('✅ Appointment created:', data);
      return data;
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  }

  // Reschedule appointment (Dời lịch)
  async rescheduleAppointment(appointmentId, newAppointmentTime) {
    try {
      console.log('Rescheduling appointment:', appointmentId, newAppointmentTime);
      
      const response = await fetch(`${API_BASE_URL}/${appointmentId}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ newAppointmentTime }),
      });

      console.log('Reschedule response:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Reschedule failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorData.message || 'Không thể dời lịch hẹn. Vui lòng thử lại.');
      }

      const data = await response.json();
      console.log('✅ Appointment rescheduled:', data);
      return data;
    } catch (error) {
      console.error('Reschedule error:', error);
      throw error;
    }
  }

  // Cancel appointment (Hủy lịch)
  async cancelAppointment(appointmentId) {
    try {
      console.log('Cancelling appointment:', appointmentId);
      
      const response = await fetch(`${API_BASE_URL}/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      console.log('Cancel response:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Cancel failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorData.message || 'Không thể hủy lịch hẹn. Vui lòng thử lại.');
      }

      const data = await response.json();
      console.log('✅ Appointment cancelled:', data);
      return data;
    } catch (error) {
      console.error('Cancel error:', error);
      throw error;
    }
  }

  // Confirm appointment (Cố vấn xác nhận lịch hẹn)
  async confirmAppointment(appointmentId) {
    try {
      console.log('Confirming appointment:', appointmentId);
      
      const response = await fetch(`${API_BASE_URL}/${appointmentId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      console.log('Confirm response:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Confirm failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        if (response.status === 403) {
          throw new Error('Bạn không có quyền xác nhận lịch hẹn.');
        }
        
        throw new Error(errorData.message || 'Không thể xác nhận lịch hẹn. Vui lòng thử lại.');
      }

      const data = await response.json();
      console.log('✅ Appointment confirmed:', data);
      return data;
    } catch (error) {
      console.error('Confirm error:', error);
      throw error;
    }
  }

  // Get appointment by ID
  async getAppointmentById(appointmentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${appointmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Get appointment failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorData.message || 'Không thể lấy thông tin lịch hẹn.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get appointment error:', error);
      throw error;
    }
  }

  // Get my appointments (Customer)
  async getMyAppointments() {
    try {
      console.log('Getting my appointments...');
      
      const response = await fetch(`${API_BASE_URL}/my-appointment-customer`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      console.log('Get my appointments response:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Get my appointments failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorData.message || 'Không thể lấy danh sách lịch hẹn.');
      }

      const data = await response.json();
      console.log('✅ My appointments:', data);
      return data;
    } catch (error) {
      console.error('Get my appointments error:', error);
      throw error;
    }
  }

  // Get appointments for customer by ID (Service Advisor)
  async getAppointmentsForCustomer(customerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/${customerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Get customer appointments failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        if (response.status === 403) {
          throw new Error('Bạn không có quyền xem lịch hẹn của khách hàng này.');
        }
        
        throw new Error(errorData.message || 'Không thể lấy lịch hẹn của khách hàng.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get customer appointments error:', error);
      throw error;
    }
  }

  // Get my advisor appointments (Service Advisor)
  async getMyAdvisorAppointments() {
    try {
      const response = await fetch(`${API_BASE_URL}/my-appointment-advisor`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Get my advisor appointments failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorData.message || 'Không thể lấy danh sách lịch hẹn.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get my advisor appointments error:', error);
      throw error;
    }
  }

  // Lấy danh sách technicians với số công việc đang làm
  async getTechniciansWithWorkload() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/technician/available`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể lấy danh sách kỹ thuật viên.');
      }

      return await response.json();
    } catch (error) {
      console.error('Get technicians with workload error:', error);
      throw error;
    }
  }

  // Assign technician cho appointment (kèm ghi chú của cố vấn)
  async assignTechnician(appointmentId, technicianId, advisorNotes = '') {
    try {
      console.log(`Assigning technician ${technicianId} to appointment ${appointmentId}`);
      
      const response = await fetch(`${API_BASE_URL}/${appointmentId}/assign-technician`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ technicianId, advisorNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Assign technician failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }

        if (response.status === 403) {
          throw new Error('Bạn không có quyền phân công kỹ thuật viên.');
        }
        
        throw new Error(errorData.message || 'Không thể phân công kỹ thuật viên. Vui lòng thử lại.');
      }

      const data = await response.json();
      console.log('✅ Technician assigned:', data);
      return data;
    } catch (error) {
      console.error('Assign technician error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const appointmentService = new AppointmentService();
export default appointmentService;

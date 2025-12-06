// Authentication Service for API calls

const API_BASE_URL = import.meta.env.VITE_API_URL + '/api/auth' || 'http://localhost:8081/api/auth';

// Normalize role from backend to FE
function normalizeRole(role) {
  if (!role) return '';
  // Remove ROLE_ prefix if present
  if (role.startsWith('ROLE_')) {
    role = role.replace('ROLE_', '');
  }
  switch (role) {
    case 'SERVICE_ADVISOR':
      return 'SERVICE_ADVISOR';
    case 'CUSTOMER':
      return 'CUSTOMER';
    case 'ADMIN':
      return 'ADMIN';
    case 'TECHNICIAN':
      return 'TECHNICIAN';
    case 'MANAGER':
      return 'MANAGER';
    default:
      return role.toUpperCase();
  }
}

class AuthService {
  // Login user
  async login(emailOrPhone, password) {
    try {
      // Log request for debugging
      console.log('Login request:', { emailOrPhone, password: '***' });
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrPhone,
          password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, data });
      console.log('📋 Full response data:', JSON.stringify(data, null, 2));
      console.log('⏩ Checkpoint 1: After logging response data');
      console.log('🆕 [2024-12-03 14:05] VERSION CHECK - If you see this, browser cache is cleared!');

      if (!response.ok) {
        // Handle different error formats
        const errorMessage = data.error || data.message || JSON.stringify(data) || 'Đăng nhập thất bại';
        console.error('❌ Login failed with error:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('⏩ Checkpoint 2: response.ok = true, proceeding...');

      // Clear old tokens first (prevent role mismatch)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('user');
      console.log('⏩ Checkpoint 3: LocalStorage cleared');

      // Store tokens in localStorage
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('tokenType', data.type || 'Bearer');


        // Store user info - Map backend field names to frontend
        const userInfo = {
          id: data.userId,           // Backend: userId -> Frontend: id
          email: data.email,
          phone: data.phone,
          fullName: data.fullName,
          role: normalizeRole(data.userRole), // FE dùng role đã normalize
        };
        localStorage.setItem('user', JSON.stringify(userInfo));
      }

      // Return normalized data for consistency
      const normalizedRole = normalizeRole(data.userRole);
      console.log('🔍 Role normalization:', { 
        original: data.userRole, 
        normalized: normalizedRole 
      });
      
      return {
        id: data.userId,
        email: data.email,
        phone: data.phone,
        fullName: data.fullName,
        role: normalizedRole,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        type: data.type
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register staff (Admin creates staff with specific role)
  async registerStaff(staffData) {
    try {
      console.log('Register staff request:', { ...staffData, password: '***' });
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('Vui lòng đăng nhập để thực hiện chức năng này');
      }
      
      const response = await fetch(`${API_BASE_URL}/register-staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(staffData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        data = { error: 'Server response error' };
      }
      
      console.log('Register staff response:', { status: response.status, data });

      if (!response.ok) {
        let errorMessage = 'Đăng ký nhân sự thất bại';
        
        if (data.message) {
          const msg = data.message.toLowerCase();
          if (msg.includes('email') && msg.includes('already')) {
            errorMessage = '❌ Email này đã được sử dụng';
          } else if (msg.includes('phone') && msg.includes('already')) {
            errorMessage = '❌ Số điện thoại này đã được sử dụng';
          } else {
            errorMessage = data.message;
          }
        } else if (data.error) {
          errorMessage = data.error;
        }
        
        console.error('❌ Register staff failed:', errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Register staff error:', error);
      throw error;
    }
  }

  // Register user
  async register(userData) {
    try {
      console.log('Register request:', { ...userData, password: '***' });
      
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        data = { error: 'Server response error' };
      }
      
      console.log('Register response:', { status: response.status, data });
      console.log('📋 Full register response:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        // Try to extract detailed error message
        let errorMessage = 'Đăng ký thất bại';
        
        if (data.message) {
          // Backend returns specific error message
          const msg = data.message.toLowerCase();
          if (msg.includes('email') && msg.includes('already') && msg.includes('exist')) {
            errorMessage = '❌ Email này đã được sử dụng. Vui lòng sử dụng email khác.';
          } else if (msg.includes('phone') && msg.includes('already') && msg.includes('exist')) {
            errorMessage = '❌ Số điện thoại này đã được sử dụng. Vui lòng sử dụng số khác.';
          } else if (msg.includes('duplicate')) {
            errorMessage = '❌ Thông tin đã tồn tại. Email hoặc số điện thoại đã được đăng ký.';
          } else {
            errorMessage = data.message;
          }
        } else if (data.error) {
          const err = data.error.toLowerCase();
          if (err === 'internal server error') {
            // Most likely duplicate email/phone causing database constraint violation
            errorMessage = '❌ Email hoặc số điện thoại đã tồn tại trong hệ thống.\n\nVui lòng kiểm tra lại thông tin hoặc thử đăng nhập nếu bạn đã có tài khoản.';
          } else {
            errorMessage = data.error;
          }
        } else if (response.status === 400) {
          errorMessage = '❌ Thông tin không hợp lệ. Email hoặc số điện thoại có thể đã được sử dụng.';
        } else if (response.status === 500) {
          errorMessage = '❌ Email hoặc số điện thoại đã tồn tại trong hệ thống.\n\nVui lòng kiểm tra lại thông tin hoặc thử đăng nhập nếu bạn đã có tài khoản.';
        }
        
        console.error('❌ Register failed with error:', errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Refresh token failed');
      }

      // Update access token
      localStorage.setItem('accessToken', data.accessToken);
      return data;
    } catch (error) {
      console.error('Refresh token error:', error);
      // Clear all auth data if refresh fails
      this.logout();
      throw error;
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('userInfo');
  }

  // Get stored user info
  getCurrentUser() {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Get access token
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Get authorization header
  getAuthHeader() {
    const token = this.getAccessToken();
    const tokenType = localStorage.getItem('tokenType') || 'Bearer';
    return token ? { Authorization: `${tokenType} ${token}` } : {};
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;

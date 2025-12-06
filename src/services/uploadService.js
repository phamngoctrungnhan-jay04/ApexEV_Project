import axios from 'axios';

const API_URL = 'http://localhost:8081/api/files';

// Lấy token từ localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Upload file cho Technician (checklist, invoice...)
 * @param {File} file - File để upload
 * @param {string} folder - Thư mục lưu trữ ('checklist', 'invoice', 'evidence')
 */
export const uploadTechnicianFile = async (file, folder = 'checklist') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await axios.post(`${API_URL}/technician/upload`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('uploadTechnicianFile error:', error);
    throw error;
  }
};

/**
 * Upload file cho Customer (avatar, vehicle)
 * @param {File} file - File để upload
 * @param {string} type - Loại file ('avatar' hoặc 'vehicle')
 */
export const uploadCustomerFile = async (file, type) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axios.post(`${API_URL}/customer/upload`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('uploadCustomerFile error:', error);
    throw error;
  }
};

/**
 * Lấy URL xem file (Presigned URL)
 * @param {string} s3Key - Key của file trên S3
 * @param {number} expiration - Thời gian hết hạn (phút)
 */
export const getFileViewUrl = async (s3Key, expiration = 60) => {
  try {
    const response = await axios.get(`${API_URL}/view`, {
      params: {
        key: s3Key,
        expiration
      },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('getFileViewUrl error:', error);
    throw error;
  }
};

/**
 * Xóa file
 * @param {string} s3Key - Key của file trên S3
 */
export const deleteFile = async (s3Key) => {
  try {
    const response = await axios.delete(`${API_URL}/delete`, {
      params: { key: s3Key },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('deleteFile error:', error);
    throw error;
  }
};

/**
 * Kiểm tra file có hợp lệ không
 * @param {File} file - File để kiểm tra
 * @param {Object} options - Các tùy chọn
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB mặc định
    allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'],
    allowedTypes = null // null = cho phép cả image và video
  } = options;

  const errors = [];

  // Kiểm tra kích thước
  if (file.size > maxSize) {
    errors.push(`Kích thước file quá lớn. Tối đa ${Math.round(maxSize / (1024 * 1024))}MB.`);
  }

  // Kiểm tra định dạng
  const allAllowedTypes = allowedTypes || [...allowedImageTypes, ...allowedVideoTypes];
  if (!allAllowedTypes.includes(file.type)) {
    errors.push(`Định dạng file không hợp lệ. Chỉ chấp nhận: ${allAllowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Lấy loại media từ file type
 */
export const getMediaType = (fileType) => {
  if (fileType.startsWith('image/')) return 'IMAGE';
  if (fileType.startsWith('video/')) return 'VIDEO';
  return 'UNKNOWN';
};

export default {
  uploadTechnicianFile,
  uploadCustomerFile,
  getFileViewUrl,
  deleteFile,
  validateFile,
  getMediaType
};

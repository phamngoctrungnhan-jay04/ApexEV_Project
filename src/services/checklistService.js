import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/checklist`;

// Lấy token từ localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Lấy danh sách templates
 */
export const getTemplates = async () => {
  try {
    const response = await axios.get(`${API_URL}/templates`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('getTemplates error:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một template
 */
export const getTemplateById = async (templateId) => {
  try {
    const response = await axios.get(`${API_URL}/templates/${templateId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('getTemplateById error:', error);
    throw error;
  }
};

/**
 * Lấy template theo service ID (auto-match)
 */
export const getTemplateByServiceId = async (serviceId) => {
  try {
    const response = await axios.get(`${API_URL}/templates/service/${serviceId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 204) {
      return null; // Không có template cho service này
    }
    console.error('getTemplateByServiceId error:', error);
    throw error;
  }
};

/**
 * Tạo checklist cho service order
 */
export const createChecklistForOrder = async (serviceOrderId, templateId) => {
  try {
    const response = await axios.post(
      `${API_URL}/service-order/${serviceOrderId}?templateId=${templateId}`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('createChecklistForOrder error:', error);
    throw error;
  }
};

/**
 * Lấy danh sách checklists của một service order (API CŨ)
 */
export const getChecklistsByOrder = async (serviceOrderId) => {
  try {
    const response = await axios.get(`${API_URL}/service-order/${serviceOrderId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('getChecklistsByOrder error:', error);
    throw error;
  }
};

/**
 * API MỚI: Lấy service checklist items cho order kèm results
 * Trả về tất cả checklist items của service, kèm theo kết quả đã submit (nếu có)
 * @param {number} serviceOrderId 
 * @returns {Promise<Array>} Array of ServiceChecklistItemWithResultResponse
 */
export const getServiceChecklistItemsForOrder = async (serviceOrderId) => {
  try {
    const fullUrl = `${API_URL}/service-order/${serviceOrderId}/items`;
    console.log('🌐 [checklistService] Calling API:', fullUrl);
    console.log('🔑 [checklistService] Auth header:', getAuthHeader());
    
    const response = await axios.get(fullUrl, {
      headers: getAuthHeader()
    });
    
    console.log('✅ [checklistService] API Success:', response.status, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [checklistService] getServiceChecklistItemsForOrder error:', error);
    console.error('❌ Error details:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

/**
 * Lấy kết quả của một checklist
 */
export const getChecklistResults = async (checklistId) => {
  try {
    const response = await axios.get(`${API_URL}/${checklistId}/results`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('getChecklistResults error:', error);
    throw error;
  }
};

/**
 * ✅ Lấy tất cả kết quả checklist theo service order ID
 * GET /api/checklist/service-order/{serviceOrderId}/results
 * @param {number} serviceOrderId - ID của service order
 * @returns {Array} Danh sách results với needsReplacement flag
 */
export const getChecklistResultsByOrder = async (serviceOrderId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/checklist/service-order/${serviceOrderId}/results`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 204 || error.response?.status === 404) {
      return []; // Chưa có kết quả nào
    }
    console.error('getChecklistResultsByOrder error:', error);
    throw error;
  }
};

/**
 * Submit kết quả một hạng mục checklist
 */
export const submitChecklistItem = async (checklistId, templateItemId, status, technicianNotes = null, s3Key = null) => {
  try {
    const response = await axios.post(
      `${API_URL}/submit`,
      {
        checklistId,
        templateItemId,
        status, // 'PASSED', 'FAILED', 'NEEDS_ATTENTION'
        technicianNotes,
        s3Key
      },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('submitChecklistItem error:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một kết quả checklist
 */
export const getChecklistItem = async (resultId) => {
  try {
    const response = await axios.get(`${API_URL}/result/${resultId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('getChecklistItem error:', error);
    throw error;
  }
};

/**
 * Lấy danh sách checklist items theo service ID
 * Dùng cho inline checklist trong JobList
 */
export const getChecklistItemsByService = async (serviceId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/service-checklist-items/service/${serviceId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 204 || error.response?.status === 404) {
      return []; // Không có checklist items cho service này
    }
    console.error('getChecklistItemsByService error:', error);
    throw error;
  }
};

/**
 * Lưu kết quả checklist item (auto-save) - API ĐƠN GIẢN
 * POST /api/checklist/service-order/{serviceOrderId}/items/{itemId}/result
 * @param {number} serviceOrderId - ID của service order
 * @param {number} itemId - ID của service_checklist_item
 * @param {string} status - PENDING, PASSED, FAILED, NEEDS_ATTENTION, NEEDS_REPLACEMENT
 * @param {string} technicianNotes - Ghi chú của kỹ thuật viên
 * @param {string} s3Key - S3 key của ảnh (nếu có)
 */
export const saveChecklistItemResult = async (serviceOrderId, itemId, status, technicianNotes = '', s3Key = null) => {
  try {
    const params = new URLSearchParams();
    params.append('status', status);
    if (technicianNotes) params.append('technicianNotes', technicianNotes);
    if (s3Key) params.append('s3Key', s3Key);

    const response = await axios.post(
      `${API_URL}/service-order/${serviceOrderId}/items/${itemId}/result?${params.toString()}`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('saveChecklistItemResult error:', error);
    throw error;
  }
};

/**
 * Đánh dấu tất cả checklist của service order đã hoàn thành
 * Được gọi khi kỹ thuật viên bấm "Hoàn tất kiểm tra"
 * Endpoint: POST /api/checklist/service-order/{serviceOrderId}/complete
 */
export const completeServiceOrderChecklists = async (serviceOrderId) => {
  try {
    const response = await axios.post(
      `${API_URL}/service-order/${serviceOrderId}/complete`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('completeServiceOrderChecklists error:', error);
    throw error;
  }
};

export default {
  getTemplates,
  getTemplateById,
  getTemplateByServiceId,
  createChecklistForOrder,
  getChecklistsByOrder,
  getChecklistResults,
  getChecklistResultsByOrder,
  getServiceChecklistItemsForOrder,
  submitChecklistItem,
  getChecklistItem,
  getChecklistItemsByService,
  saveChecklistItemResult,
  completeServiceOrderChecklists
};

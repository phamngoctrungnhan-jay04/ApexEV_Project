import axios from 'axios';

const API_URL = 'http://localhost:8081/api/checklist';

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
 * Lấy danh sách checklists của một service order
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
      `http://localhost:8081/api/service-checklist-items/service/${serviceId}`,
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

export default {
  getTemplates,
  getTemplateById,
  getTemplateByServiceId,
  createChecklistForOrder,
  getChecklistsByOrder,
  getChecklistResults,
  submitChecklistItem,
  getChecklistItem,
  getChecklistItemsByService
};

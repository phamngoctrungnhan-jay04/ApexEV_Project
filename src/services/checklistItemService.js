// Service Checklist Items API Service
// Quản lý các bước kiểm tra (checklist) cho từng dịch vụ xe điện

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Helper để lấy token từ localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Lấy tất cả checklist items của một dịch vụ
 * @param {number} serviceId - ID của dịch vụ
 * @returns {Promise<Array>} Danh sách checklist items
 */
export const getChecklistItemsByServiceId = async (serviceId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/service-checklist-items/service/${serviceId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching checklist items:', error);
        console.error('Response data:', error.response?.data);
        console.error('Status code:', error.response?.status);
        throw error;
    }
};

/**
 * Lấy checklist items đang active của một dịch vụ
 * @param {number} serviceId - ID của dịch vụ
 * @returns {Promise<Array>} Danh sách checklist items active
 */
export const getActiveChecklistItemsByServiceId = async (serviceId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/service-checklist-items/service/${serviceId}/active`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching active checklist items:', error);
        throw error;
    }
};

/**
 * Lấy checklist items theo category của một dịch vụ
 * @param {number} serviceId - ID của dịch vụ
 * @param {string} category - Category (battery, motor, bms, regen, cooling, software, brake, etc.)
 * @returns {Promise<Array>} Danh sách checklist items theo category
 */
export const getChecklistItemsByCategory = async (serviceId, category) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/service-checklist-items/service/${serviceId}/category/${category}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching checklist items by category:', error);
        throw error;
    }
};

/**
 * Đếm số checklist items của một dịch vụ
 * @param {number} serviceId - ID của dịch vụ
 * @returns {Promise<Object>} Object chứa serviceId và totalItems
 */
export const countChecklistItems = async (serviceId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/service-checklist-items/service/${serviceId}/count`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error counting checklist items:', error);
        throw error;
    }
};

/**
 * Kiểm tra service có checklist items không
 * @param {number} serviceId - ID của dịch vụ
 * @returns {Promise<Object>} Object chứa serviceId và hasChecklistItems
 */
export const hasChecklistItems = async (serviceId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/service-checklist-items/service/${serviceId}/exists`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error checking checklist items existence:', error);
        throw error;
    }
};

/**
 * Map category code sang tên hiển thị tiếng Việt
 */
export const categoryDisplayNames = {
    battery: 'Pin cao áp',
    motor: 'Động cơ điện',
    bms: 'Hệ thống BMS',
    regen: 'Phanh tái sinh',
    cooling: 'Làm mát',
    software: 'Phần mềm',
    brake: 'Phanh',
    tire: 'Lốp xe',
    hvac: 'Điều hòa',
    suspension: 'Hệ thống treo',
    electrical: 'Hệ thống điện',
    cleaning: 'Vệ sinh',
    emergency: 'Cứu hộ',
    inspection: 'Kiểm tra'
};

/**
 * Lấy tên category tiếng Việt
 * @param {string} categoryCode - Mã category
 * @returns {string} Tên hiển thị tiếng Việt
 */
export const getCategoryDisplayName = (categoryCode) => {
    return categoryDisplayNames[categoryCode] || categoryCode;
};

/**
 * Nhóm checklist items theo category
 * @param {Array} items - Danh sách checklist items
 * @returns {Object} Object chứa items được nhóm theo category
 */
export const groupItemsByCategory = (items) => {
    return items.reduce((groups, item) => {
        const category = item.category || 'other';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(item);
        return groups;
    }, {});
};

/**
 * Tạo mới checklist item (Admin only)
 * @param {Object} itemData - Dữ liệu item: { serviceId, itemName, itemNameEn, itemDescription, itemDescriptionEn, stepOrder, category, estimatedTime, isRequired, isActive }
 * @returns {Promise<Object>} Checklist item vừa tạo
 */
export const createChecklistItem = async (itemData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/service-checklist-items`,
            itemData,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating checklist item:', error);
        throw error;
    }
};

/**
 * Cập nhật checklist item (Admin only)
 * @param {number} itemId - ID của item cần update
 * @param {Object} itemData - Dữ liệu update (partial)
 * @returns {Promise<Object>} Checklist item sau khi update
 */
export const updateChecklistItem = async (itemId, itemData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/service-checklist-items/${itemId}`,
            itemData,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating checklist item:', error);
        throw error;
    }
};

/**
 * Xóa checklist item (Admin only)
 * @param {number} itemId - ID của item cần xóa
 * @returns {Promise<Object>} Message confirm xóa
 */
export const deleteChecklistItem = async (itemId) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/api/service-checklist-items/${itemId}`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting checklist item:', error);
        throw error;
    }
};

/**
 * Toggle trạng thái active/inactive (Admin only)
 * @param {number} itemId - ID của item cần toggle
 * @returns {Promise<Object>} Item sau khi toggle
 */
export const toggleChecklistItemActive = async (itemId) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/api/service-checklist-items/${itemId}/toggle-active`,
            {},
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error toggling checklist item active status:', error);
        throw error;
    }
};

/**
 * Lấy thông tin 1 checklist item theo ID
 * @param {number} itemId - ID của item
 * @returns {Promise<Object>} Chi tiết checklist item
 */
export const getChecklistItemById = async (itemId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/service-checklist-items/${itemId}`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching checklist item by ID:', error);
        throw error;
    }
};

export default {
    getChecklistItemsByServiceId,
    getActiveChecklistItemsByServiceId,
    getChecklistItemsByCategory,
    countChecklistItems,
    hasChecklistItems,
    getCategoryDisplayName,
    groupItemsByCategory,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    toggleChecklistItemActive,
    getChecklistItemById
};

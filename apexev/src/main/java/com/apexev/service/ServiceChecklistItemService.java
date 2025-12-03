package com.apexev.service;

import com.apexev.dto.response.ServiceChecklistItemResponse;

import java.util.List;

public interface ServiceChecklistItemService {
    
    /**
     * Lấy tất cả checklist items theo service ID
     */
    List<ServiceChecklistItemResponse> getChecklistItemsByServiceId(Long serviceId);
    
    /**
     * Lấy checklist items active theo service ID
     */
    List<ServiceChecklistItemResponse> getActiveChecklistItemsByServiceId(Long serviceId);
    
    /**
     * Lấy checklist items theo service ID và category
     */
    List<ServiceChecklistItemResponse> getChecklistItemsByServiceIdAndCategory(Long serviceId, String category);
    
    /**
     * Đếm số checklist items của một service
     */
    Long countChecklistItemsByServiceId(Long serviceId);
    
    /**
     * Kiểm tra service có checklist items không
     */
    boolean hasChecklistItems(Long serviceId);
}

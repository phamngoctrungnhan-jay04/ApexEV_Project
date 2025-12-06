package com.apexev.service;

import com.apexev.dto.request.checklistRequest.CreateChecklistItemRequest;
import com.apexev.dto.request.checklistRequest.UpdateChecklistItemRequest;
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

    /**
     * Tạo checklist item mới (ADMIN only)
     */
    ServiceChecklistItemResponse createChecklistItem(CreateChecklistItemRequest request);

    /**
     * Cập nhật checklist item (ADMIN only)
     */
    ServiceChecklistItemResponse updateChecklistItem(Long itemId, UpdateChecklistItemRequest request);

    /**
     * Xóa checklist item (ADMIN only)
     */
    void deleteChecklistItem(Long itemId);

    /**
     * Toggle active status của checklist item (ADMIN only)
     */
    ServiceChecklistItemResponse toggleActiveStatus(Long itemId);

    /**
     * Lấy checklist item theo ID
     */
    ServiceChecklistItemResponse getChecklistItemById(Long itemId);
}

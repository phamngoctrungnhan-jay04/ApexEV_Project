package com.apexev.service.impl;

import com.apexev.dto.response.ServiceChecklistItemResponse;
import com.apexev.entity.ServiceChecklistItem;
import com.apexev.repository.maintenance.ServiceChecklistItemRepository;
import com.apexev.service.ServiceChecklistItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceChecklistItemServiceImpl implements ServiceChecklistItemService {
    
    @Autowired
    private ServiceChecklistItemRepository checklistItemRepository;
    
    @Override
    public List<ServiceChecklistItemResponse> getChecklistItemsByServiceId(Long serviceId) {
        List<ServiceChecklistItem> items = checklistItemRepository.findByServiceIdOrderByStepOrderAsc(serviceId);
        return items.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ServiceChecklistItemResponse> getActiveChecklistItemsByServiceId(Long serviceId) {
        List<ServiceChecklistItem> items = checklistItemRepository.findByServiceIdAndIsActiveTrueOrderByStepOrderAsc(serviceId);
        return items.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ServiceChecklistItemResponse> getChecklistItemsByServiceIdAndCategory(Long serviceId, String category) {
        List<ServiceChecklistItem> items = checklistItemRepository.findByServiceIdAndCategoryOrderByStepOrderAsc(serviceId, category);
        return items.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public Long countChecklistItemsByServiceId(Long serviceId) {
        return checklistItemRepository.countByServiceId(serviceId);
    }
    
    @Override
    public boolean hasChecklistItems(Long serviceId) {
        return checklistItemRepository.existsByServiceId(serviceId);
    }
    
    /**
     * Map Entity sang Response DTO (Manual Mapping - tuân thủ quy tắc APEX EV)
     */
    private ServiceChecklistItemResponse mapToResponse(ServiceChecklistItem item) {
        ServiceChecklistItemResponse response = new ServiceChecklistItemResponse();
        response.setId(item.getId());
        response.setItemName(item.getItemName());
        response.setItemNameEn(item.getItemNameEn());
        response.setItemDescription(item.getItemDescription());
        response.setItemDescriptionEn(item.getItemDescriptionEn());
        response.setStepOrder(item.getStepOrder());
        response.setCategory(item.getCategory());
        response.setEstimatedTime(item.getEstimatedTime());
        response.setIsRequired(item.getIsRequired());
        response.setIsActive(item.getIsActive());
        
        // Lấy service ID từ entity (không trả về toàn bộ service object để tránh circular reference)
        if (item.getService() != null) {
            response.setServiceId(item.getService().getId());
            response.setServiceName(item.getService().getName());
        }
        
        return response;
    }
}

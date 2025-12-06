package com.apexev.service.impl;

import com.apexev.dto.request.checklistRequest.CreateChecklistItemRequest;
import com.apexev.dto.request.checklistRequest.UpdateChecklistItemRequest;
import com.apexev.dto.response.ServiceChecklistItemResponse;
import com.apexev.entity.MaintenanceService;
import com.apexev.entity.ServiceChecklistItem;
import com.apexev.repository.maintenance.ServiceChecklistItemRepository;
import com.apexev.repository.coreBussiness.MaintenanceServiceRepository;
import com.apexev.service.ServiceChecklistItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceChecklistItemServiceImpl implements ServiceChecklistItemService {

    @Autowired
    private ServiceChecklistItemRepository checklistItemRepository;

    @Autowired
    private MaintenanceServiceRepository maintenanceServiceRepository;

    @Override
    public List<ServiceChecklistItemResponse> getChecklistItemsByServiceId(Long serviceId) {
        List<ServiceChecklistItem> items = checklistItemRepository.findByServiceIdOrderByStepOrderAsc(serviceId);
        return items.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceChecklistItemResponse> getActiveChecklistItemsByServiceId(Long serviceId) {
        List<ServiceChecklistItem> items = checklistItemRepository
                .findByServiceIdAndIsActiveTrueOrderByStepOrderAsc(serviceId);
        return items.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceChecklistItemResponse> getChecklistItemsByServiceIdAndCategory(Long serviceId, String category) {
        List<ServiceChecklistItem> items = checklistItemRepository
                .findByServiceIdAndCategoryOrderByStepOrderAsc(serviceId, category);
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

        // Lấy service ID từ entity - Xử lý an toàn với LAZY loading
        try {
            if (item.getService() != null) {
                response.setServiceId(item.getService().getId());
                response.setServiceName(item.getService().getName());
            }
        } catch (Exception e) {
            // Nếu có lỗi lazy loading, bỏ qua (service info không bắt buộc trong response)
            System.err.println("Warning: Cannot fetch service info for checklist item " + item.getId());
        }

        return response;
    }

    @Override
    @Transactional
    public ServiceChecklistItemResponse createChecklistItem(CreateChecklistItemRequest request) {
        // Validate service exists
        MaintenanceService service = maintenanceServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service không tồn tại với ID: " + request.getServiceId()));

        ServiceChecklistItem item = new ServiceChecklistItem();
        item.setService(service);
        item.setItemName(request.getItemName());
        item.setItemNameEn(request.getItemNameEn());
        item.setItemDescription(request.getItemDescription());
        item.setItemDescriptionEn(request.getItemDescriptionEn());
        item.setStepOrder(request.getStepOrder());
        item.setCategory(request.getCategory());
        item.setEstimatedTime(request.getEstimatedTime());
        item.setIsRequired(request.getIsRequired());
        item.setIsActive(request.getIsActive());

        ServiceChecklistItem saved = checklistItemRepository.save(item);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ServiceChecklistItemResponse updateChecklistItem(Long itemId, UpdateChecklistItemRequest request) {
        ServiceChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Checklist item không tồn tại với ID: " + itemId));

        if (request.getItemName() != null)
            item.setItemName(request.getItemName());
        if (request.getItemNameEn() != null)
            item.setItemNameEn(request.getItemNameEn());
        if (request.getItemDescription() != null)
            item.setItemDescription(request.getItemDescription());
        if (request.getItemDescriptionEn() != null)
            item.setItemDescriptionEn(request.getItemDescriptionEn());
        if (request.getStepOrder() != null)
            item.setStepOrder(request.getStepOrder());
        if (request.getCategory() != null)
            item.setCategory(request.getCategory());
        if (request.getEstimatedTime() != null)
            item.setEstimatedTime(request.getEstimatedTime());
        if (request.getIsRequired() != null)
            item.setIsRequired(request.getIsRequired());
        if (request.getIsActive() != null)
            item.setIsActive(request.getIsActive());

        ServiceChecklistItem updated = checklistItemRepository.save(item);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteChecklistItem(Long itemId) {
        if (!checklistItemRepository.existsById(itemId)) {
            throw new RuntimeException("Checklist item không tồn tại với ID: " + itemId);
        }
        checklistItemRepository.deleteById(itemId);
    }

    @Override
    @Transactional
    public ServiceChecklistItemResponse toggleActiveStatus(Long itemId) {
        ServiceChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Checklist item không tồn tại với ID: " + itemId));

        item.setIsActive(!item.getIsActive());
        ServiceChecklistItem updated = checklistItemRepository.save(item);
        return mapToResponse(updated);
    }

    @Override
    public ServiceChecklistItemResponse getChecklistItemById(Long itemId) {
        ServiceChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Checklist item không tồn tại với ID: " + itemId));
        return mapToResponse(item);
    }
}

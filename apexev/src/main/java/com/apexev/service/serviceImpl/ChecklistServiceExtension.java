package com.apexev.service.serviceImpl;

import com.apexev.dto.response.ChecklistItemResponse;
import com.apexev.entity.ServiceChecklistItem;
import com.apexev.entity.ServiceOrder;
import com.apexev.entity.ServiceOrderItem;
import com.apexev.entity.ServiceChecklist;
import com.apexev.entity.ServiceChecklistResult;
import com.apexev.entity.ChecklistTemplate;
import com.apexev.entity.ChecklistTemplateItem;
import com.apexev.entity.User;
import com.apexev.enums.ChecklistItemStatus;
import com.apexev.enums.UserRole;
import com.apexev.repository.coreBussiness.ServiceOrderRepository;
import com.apexev.repository.maintenance.ServiceChecklistItemRepository;
import com.apexev.repository.maintenance.ServiceChecklistRepository;
import com.apexev.repository.maintenance.ServiceChecklistResultRepository;
import com.apexev.repository.maintenance.ChecklistTemplateRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Extension cho ChecklistService - Submit kết quả đơn giản hơn
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ChecklistServiceExtension {

    private final ServiceChecklistItemRepository checklistItemRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final ServiceChecklistRepository checklistRepository;
    private final ServiceChecklistResultRepository resultRepository;
    private final ChecklistTemplateRepository templateRepository;
    private final ChecklistService checklistService;

    /**
     * Submit kết quả cho service order item (đơn giản hơn)
     * - Không cần checklistId
     * - Tự động tạo ServiceChecklist nếu chưa có
     * - Tự động tạo/cập nhật ServiceChecklistResult
     */
    @Transactional
    public ChecklistItemResponse submitServiceOrderItemResult(
            Long serviceOrderId,
            Long itemId,
            String statusStr,
            String technicianNotes,
            String s3Key,
            User technician) {

        // Validate technician role
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Chỉ kỹ thuật viên mới có thể submit checklist");
        }

        // Parse status
        ChecklistItemStatus status;
        try {
            status = ChecklistItemStatus.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status không hợp lệ: " + statusStr);
        }

        // Tìm ServiceChecklistItem
        ServiceChecklistItem checklistItem = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy checklist item với ID: " + itemId));

        // Tìm ServiceOrder
        ServiceOrder serviceOrder = serviceOrderRepository.findById(serviceOrderId)
                .orElseThrow(
                        () -> new EntityNotFoundException("Không tìm thấy service order với ID: " + serviceOrderId));

        // Tìm hoặc tạo ServiceChecklist cho service order này
        List<ServiceChecklist> checklists = checklistRepository.findByServiceOrderId(serviceOrderId);
        ServiceChecklist checklist;

        if (checklists.isEmpty()) {
            // Tạo mới nếu chưa có (KHÔNG BẮT BUỘC TEMPLATE)
            // Template có thể null vì một số service không cần template cố định
            Long serviceId = checklistItem.getService().getId();
            ChecklistTemplate template = templateRepository.findByServiceId(serviceId).orElse(null);

            checklist = new ServiceChecklist();
            checklist.setServiceOrder(serviceOrder);
            checklist.setTemplate(template); // Có thể null
            checklist.setTechnician(technician);
            checklist = checklistRepository.save(checklist);
            log.info("Created new ServiceChecklist for serviceOrderId={}, template={}",
                    serviceOrderId, template != null ? template.getId() : "null");
        } else {
            checklist = checklists.get(0);
        }

        // Tìm ServiceChecklistResult đã tồn tại cho item này
        List<ServiceChecklistResult> existingResults = resultRepository.findByServiceChecklistId(checklist.getId());
        ServiceChecklistResult result = null;

        // Tìm ChecklistTemplateItem tương ứng trong template (NẾU CÓ)
        ChecklistTemplateItem templateItem = null;
        if (checklist.getTemplate() != null && checklist.getTemplate().getItems() != null) {
            for (ChecklistTemplateItem ti : checklist.getTemplate().getItems()) {
                if (ti.getItemName().equals(checklistItem.getItemName())) {
                    templateItem = ti;
                    break;
                }
            }
        }

        // Tìm result đã có theo serviceChecklistItem.id (chính xác hơn so với
        // templateItem)
        for (ServiceChecklistResult r : existingResults) {
            if (r.getServiceChecklistItem() != null &&
                    r.getServiceChecklistItem().getId().equals(checklistItem.getId())) {
                result = r;
                break;
            }
        }

        if (result == null) {
            result = new ServiceChecklistResult();
            result.setServiceChecklist(checklist);
            result.setServiceChecklistItem(checklistItem); // BẮT BUỘC - item gốc
            result.setTemplateItem(templateItem); // Có thể null nếu không có template
        }

        // Cập nhật kết quả
        result.setStatus(status);
        result.setTechnicianNotes(technicianNotes);
        result.setS3Key(s3Key);

        result = resultRepository.save(result);
        log.info("Saved checklist result: serviceOrderId={}, itemId={}, status={}",
                serviceOrderId, itemId, status);

        // Sử dụng method convertToResponse từ ChecklistService
        return ChecklistItemResponse.builder()
                .id(result.getId())
                .checklistId(result.getServiceChecklist().getId())
                .itemName(checklistItem.getItemName())
                .status(result.getStatus())
                .technicianNotes(result.getTechnicianNotes())
                .s3Key(result.getS3Key())
                .build();
    }

    /**
     * Đánh dấu tất cả checklist của service order đã hoàn thành
     * Được gọi khi kỹ thuật viên bấm "Hoàn tất kiểm tra"
     */
    @Transactional
    public void completeServiceOrderChecklists(Long serviceOrderId) {
        ServiceOrder serviceOrder = serviceOrderRepository.findById(serviceOrderId)
                .orElseThrow(() -> new RuntimeException("Service order not found: " + serviceOrderId));

        // Tìm tất cả checklist của service order này
        List<ServiceChecklist> checklists = checklistRepository.findByServiceOrderId(serviceOrderId);

        // Đánh dấu tất cả là completed
        LocalDateTime now = LocalDateTime.now();
        for (ServiceChecklist checklist : checklists) {
            checklist.setIsCompleted(true);
            checklist.setCompletedAt(now);
            checklistRepository.save(checklist);
        }
    }
}

package com.apexev.service.serviceImpl;

import com.apexev.dto.request.SubmitChecklistItemRequest;
import com.apexev.dto.response.ChecklistItemResponse;
import com.apexev.entity.ChecklistTemplateItem;
import com.apexev.entity.ServiceChecklist;
import com.apexev.entity.ServiceChecklistResult;
import com.apexev.entity.User;
import com.apexev.enums.UserRole;
import com.apexev.repository.maintenance.ChecklistTemplateItemRepository;
import com.apexev.repository.maintenance.ServiceChecklistRepository;
import com.apexev.repository.maintenance.ServiceChecklistResultRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChecklistService {

    private final ServiceChecklistRepository checklistRepository;
    private final ServiceChecklistResultRepository resultRepository;
    private final ChecklistTemplateItemRepository templateItemRepository;
    private final S3Service s3Service;

    /**
     * Submit một hạng mục checklist với S3 key
     */
    @Transactional
    public ChecklistItemResponse submitChecklistItem(SubmitChecklistItemRequest request, User technician) {
        // Validate technician role
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Chỉ kỹ thuật viên mới có thể submit checklist");
        }

        // Tìm checklist
        ServiceChecklist checklist = checklistRepository.findById(request.getChecklistId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy checklist với ID: " + request.getChecklistId()));

        // Kiểm tra quyền sở hữu (technician phải là người được assign)
        if (!checklist.getTechnician().getUserId().equals(technician.getUserId())) {
            throw new AccessDeniedException("Bạn không có quyền submit checklist này");
        }

        // Tìm template item
        ChecklistTemplateItem templateItem = templateItemRepository.findById(request.getTemplateItemId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy template item với ID: " + request.getTemplateItemId()));

        // Kiểm tra xem đã submit hạng mục này chưa
        ServiceChecklistResult existingResult = resultRepository
                .findByServiceChecklistIdAndTemplateItemId(request.getChecklistId(), request.getTemplateItemId());

        ServiceChecklistResult result;
        if (existingResult != null) {
            // Update existing result
            result = existingResult;
            result.setStatus(request.getStatus());
            result.setTechnicianNotes(request.getTechnicianNotes());
            result.setS3Key(request.getS3Key());
            log.info("Updated checklist result: checklistId={}, templateItemId={}", 
                    request.getChecklistId(), request.getTemplateItemId());
        } else {
            // Create new result
            result = new ServiceChecklistResult();
            result.setServiceChecklist(checklist);
            result.setTemplateItem(templateItem);
            result.setStatus(request.getStatus());
            result.setTechnicianNotes(request.getTechnicianNotes());
            result.setS3Key(request.getS3Key());
            log.info("Created new checklist result: checklistId={}, templateItemId={}", 
                    request.getChecklistId(), request.getTemplateItemId());
        }

        // Save to database
        result = resultRepository.save(result);

        // Convert to response
        return convertToResponse(result);
    }

    /**
     * Lấy tất cả kết quả của một checklist
     */
    public List<ChecklistItemResponse> getChecklistResults(Long checklistId, User user) {
        // Tìm checklist
        ServiceChecklist checklist = checklistRepository.findById(checklistId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy checklist với ID: " + checklistId));

        // Kiểm tra quyền truy cập
        if (user.getRole() == UserRole.TECHNICIAN) {
            if (!checklist.getTechnician().getUserId().equals(user.getUserId())) {
                throw new AccessDeniedException("Bạn không có quyền xem checklist này");
            }
        }
        // Customer, Service Advisor, Admin có thể xem

        // Lấy tất cả results
        List<ServiceChecklistResult> results = resultRepository.findByServiceChecklistId(checklistId);

        // Convert to response
        return results.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy một hạng mục checklist cụ thể
     */
    public ChecklistItemResponse getChecklistItem(Long resultId, User user) {
        ServiceChecklistResult result = resultRepository.findById(resultId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy checklist result với ID: " + resultId));

        // Kiểm tra quyền truy cập
        if (user.getRole() == UserRole.TECHNICIAN) {
            if (!result.getServiceChecklist().getTechnician().getUserId().equals(user.getUserId())) {
                throw new AccessDeniedException("Bạn không có quyền xem checklist này");
            }
        }

        return convertToResponse(result);
    }

    /**
     * Convert entity to response DTO
     */
    private ChecklistItemResponse convertToResponse(ServiceChecklistResult result) {
        ChecklistItemResponse response = ChecklistItemResponse.builder()
                .id(result.getId())
                .checklistId(result.getServiceChecklist().getId())
                .templateItemId(result.getTemplateItem().getId())
                .itemName(result.getTemplateItem().getItemName())
                .status(result.getStatus())
                .technicianNotes(result.getTechnicianNotes())
                .s3Key(result.getS3Key())
                .build();

        // Generate pre-signed URL nếu có s3Key
        if (result.getS3Key() != null && !result.getS3Key().isEmpty()) {
            try {
                String presignedUrl = s3Service.generatePresignedUrl(result.getS3Key(), 60);
                response.setMediaUrl(presignedUrl);
                
                // Determine media type from s3Key
                String mediaType = determineMediaType(result.getS3Key());
                response.setMediaType(mediaType);
            } catch (Exception e) {
                log.error("Error generating pre-signed URL for s3Key: {}", result.getS3Key(), e);
            }
        }

        return response;
    }

    /**
     * Determine media type from file extension
     */
    private String determineMediaType(String s3Key) {
        if (s3Key == null) return "UNKNOWN";
        
        String lowerKey = s3Key.toLowerCase();
        if (lowerKey.endsWith(".jpg") || lowerKey.endsWith(".jpeg") || 
            lowerKey.endsWith(".png") || lowerKey.endsWith(".webp")) {
            return "IMAGE";
        } else if (lowerKey.endsWith(".mp4") || lowerKey.endsWith(".mov")) {
            return "VIDEO";
        }
        return "UNKNOWN";
    }
}
package com.apexev.controller;

import com.apexev.dto.request.SubmitChecklistItemRequest;
import com.apexev.dto.response.ChecklistItemResponse;
import com.apexev.dto.response.ChecklistTemplateResponse;
import com.apexev.dto.response.ServiceChecklistResponse;
import com.apexev.dto.response.ServiceChecklistItemWithResultResponse;
import com.apexev.dto.response.ServiceOrderChecklistResponse;
import com.apexev.dto.response.ServiceOrderChecklistResponse;
import com.apexev.entity.User;
import com.apexev.service.serviceImpl.ChecklistService;
import com.apexev.service.serviceImpl.ChecklistServiceExtension;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklist")
@RequiredArgsConstructor
@Slf4j
public class ChecklistController {

    private final ChecklistService checklistService;
    private final ChecklistServiceExtension checklistServiceExtension;

    /**
     * Lấy danh sách templates có sẵn
     * Endpoint: GET /api/checklist/templates
     */
    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<List<ChecklistTemplateResponse>> getTemplates() {
        log.info("Get all checklist templates");
        List<ChecklistTemplateResponse> templates = checklistService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }

    /**
     * Lấy chi tiết một template
     * Endpoint: GET /api/checklist/templates/{templateId}
     */
    @GetMapping("/templates/{templateId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ChecklistTemplateResponse> getTemplateById(@PathVariable Long templateId) {
        log.info("Get template by id: {}", templateId);
        ChecklistTemplateResponse template = checklistService.getTemplateById(templateId);
        return ResponseEntity.ok(template);
    }

    /**
     * Lấy template theo service ID (để auto-match checklist cho dịch vụ)
     * Endpoint: GET /api/checklist/templates/by-service/{serviceId}
     */
    @GetMapping("/templates/by-service/{serviceId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ChecklistTemplateResponse> getTemplateByServiceId(@PathVariable Long serviceId) {
        log.info("Get template by service id: {}", serviceId);
        ChecklistTemplateResponse template = checklistService.getTemplateByServiceId(serviceId);
        if (template == null) {
            return ResponseEntity.noContent().build(); // 204 nếu không có template cho service này
        }
        return ResponseEntity.ok(template);
    }

    /**
     * Tạo checklist cho một service order
     * Endpoint: POST /api/checklist/service-order/{serviceOrderId}
     */
    @PostMapping("/service-order/{serviceOrderId}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceChecklistResponse> createChecklistForOrder(
            @PathVariable Long serviceOrderId,
            @RequestParam Long templateId,
            @AuthenticationPrincipal User technician) {
        log.info("Create checklist for serviceOrderId={}, templateId={}, technicianId={}",
                serviceOrderId, templateId, technician.getUserId());
        ServiceChecklistResponse response = checklistService.createChecklistForOrder(serviceOrderId, templateId,
                technician);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy checklist của một service order
     * Endpoint: GET /api/checklist/service-order/{serviceOrderId}
     */
    @GetMapping("/service-order/{serviceOrderId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<ServiceChecklistResponse>> getChecklistsByOrder(
            @PathVariable Long serviceOrderId,
            @AuthenticationPrincipal User user) {
        log.info("Get checklists for serviceOrderId={}, userId={}", serviceOrderId, user.getUserId());
        List<ServiceChecklistResponse> checklists = checklistService.getChecklistsByOrder(serviceOrderId, user);
        return ResponseEntity.ok(checklists);
    }

    /**
     * API MỚI: Lấy tất cả service_checklist_items của order kèm kết quả
     * Endpoint: GET /api/checklist/service-order/{serviceOrderId}/items
     * - Trả về tất cả checklist items của service trong order
     * - Kèm theo kết quả đã submit (nếu technician đã làm)
     * - Customer có thể xem ngay cả khi technician chưa submit
     * - Bao gồm trạng thái isCompleted (đã hoàn tất kiểm tra chưa)
     */
    @GetMapping("/service-order/{serviceOrderId}/items")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'CUSTOMER', 'ADMIN')")
    public ResponseEntity<ServiceOrderChecklistResponse> getServiceChecklistItemsForOrder(
            @PathVariable Long serviceOrderId,
            @AuthenticationPrincipal User user) {
        log.info("Get service checklist items for serviceOrderId={}, userId={}", serviceOrderId, user.getUserId());
        ServiceOrderChecklistResponse response = checklistService.getServiceChecklistItemsForOrder(serviceOrderId,
                user);
        return ResponseEntity.ok(response);
    }

    /**
     * Submit một hạng mục checklist với S3 key
     * Endpoint: POST /api/checklist/submit
     * 
     * @param request    SubmitChecklistItemRequest
     * @param technician User (từ JWT)
     * @return ChecklistItemResponse
     */
    @PostMapping("/submit")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ChecklistItemResponse> submitChecklistItem(
            @Valid @RequestBody SubmitChecklistItemRequest request,
            @AuthenticationPrincipal User technician) {
        log.info("Submit checklist item request: checklistId={}, templateItemId={}, status={}, hasMedia={}",
                request.getChecklistId(),
                request.getTemplateItemId(),
                request.getStatus(),
                request.getS3Key() != null);

        ChecklistItemResponse response = checklistService.submitChecklistItem(request, technician);

        return ResponseEntity.ok(response);
    }

    /**
     * Lấy tất cả kết quả của một checklist
     * Endpoint: GET /api/checklist/{checklistId}/results
     * 
     * @param checklistId Checklist ID
     * @param user        User (từ JWT)
     * @return List<ChecklistItemResponse>
     */
    @GetMapping("/{checklistId}/results")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<ChecklistItemResponse>> getChecklistResults(
            @PathVariable Long checklistId,
            @AuthenticationPrincipal User user) {
        log.info("Get checklist results request: checklistId={}, userId={}", checklistId, user.getUserId());

        List<ChecklistItemResponse> results = checklistService.getChecklistResults(checklistId, user);

        return ResponseEntity.ok(results);
    }

    /**
     * Lấy một hạng mục checklist cụ thể
     * Endpoint: GET /api/checklist/result/{resultId}
     * 
     * @param resultId Result ID
     * @param user     User (từ JWT)
     * @return ChecklistItemResponse
     */
    @GetMapping("/result/{resultId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'CUSTOMER', 'ADMIN')")
    public ResponseEntity<ChecklistItemResponse> getChecklistItem(
            @PathVariable Long resultId,
            @AuthenticationPrincipal User user) {
        log.info("Get checklist item request: resultId={}, userId={}", resultId, user.getUserId());

        ChecklistItemResponse response = checklistService.getChecklistItem(resultId, user);

        return ResponseEntity.ok(response);
    }

    /**
     * API MỚI: Submit kết quả checklist item cho service order
     * Endpoint: POST
     * /api/checklist/service-order/{serviceOrderId}/items/{itemId}/result
     * - Đơn giản hơn, không cần checklistId
     * - Tự động tạo/cập nhật ServiceChecklistResult
     * 
     * @param serviceOrderId  ID của service order
     * @param itemId          ID của service_checklist_item
     * @param status          Status (PASSED, FAILED, NEEDS_ATTENTION,
     *                        NEEDS_REPLACEMENT)
     * @param technicianNotes Ghi chú
     * @param s3Key           S3 key của ảnh
     * @param technician      User (từ JWT)
     * @return ChecklistItemResponse
     */
    @PostMapping("/service-order/{serviceOrderId}/items/{itemId}/result")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ChecklistItemResponse> submitServiceOrderItemResult(
            @PathVariable Long serviceOrderId,
            @PathVariable Long itemId,
            @RequestParam String status,
            @RequestParam(required = false) String technicianNotes,
            @RequestParam(required = false) String s3Key,
            @AuthenticationPrincipal User technician) {
        log.info("Submit service order item result: serviceOrderId={}, itemId={}, status={}, technicianId={}",
                serviceOrderId, itemId, status, technician.getUserId());

        ChecklistItemResponse response = checklistServiceExtension.submitServiceOrderItemResult(
                serviceOrderId, itemId, status, technicianNotes, s3Key, technician);

        return ResponseEntity.ok(response);
    }

    /**
     * Đánh dấu tất cả checklist của service order đã hoàn thành
     * Được gọi khi kỹ thuật viên bấm "Hoàn tất kiểm tra"
     * Endpoint: POST /api/checklist/service-order/{serviceOrderId}/complete
     */
    @PostMapping("/service-order/{serviceOrderId}/complete")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<Void> completeServiceOrderChecklists(
            @PathVariable Long serviceOrderId,
            @AuthenticationPrincipal User technician) {
        log.info("Complete service order checklists: serviceOrderId={}, technicianId={}",
                serviceOrderId, technician.getUserId());

        checklistServiceExtension.completeServiceOrderChecklists(serviceOrderId);

        return ResponseEntity.ok().build();
    }
}

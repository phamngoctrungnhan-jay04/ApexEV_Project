package com.apexev.controller;

import com.apexev.dto.request.SubmitChecklistItemRequest;
import com.apexev.dto.response.ChecklistItemResponse;
import com.apexev.entity.User;
import com.apexev.service.serviceImpl.ChecklistService;
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

    /**
     * Submit một hạng mục checklist với S3 key
     * Endpoint: POST /api/checklist/submit
     * 
     * @param request SubmitChecklistItemRequest
     * @param technician User (từ JWT)
     * @return ChecklistItemResponse
     */
    @PostMapping("/submit")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ChecklistItemResponse> submitChecklistItem(
            @Valid @RequestBody SubmitChecklistItemRequest request,
            @AuthenticationPrincipal User technician
    ) {
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
     * @param user User (từ JWT)
     * @return List<ChecklistItemResponse>
     */
    @GetMapping("/{checklistId}/results")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<ChecklistItemResponse>> getChecklistResults(
            @PathVariable Long checklistId,
            @AuthenticationPrincipal User user
    ) {
        log.info("Get checklist results request: checklistId={}, userId={}", checklistId, user.getUserId());

        List<ChecklistItemResponse> results = checklistService.getChecklistResults(checklistId, user);

        return ResponseEntity.ok(results);
    }

    /**
     * Lấy một hạng mục checklist cụ thể
     * Endpoint: GET /api/checklist/result/{resultId}
     * 
     * @param resultId Result ID
     * @param user User (từ JWT)
     * @return ChecklistItemResponse
     */
    @GetMapping("/result/{resultId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'CUSTOMER', 'ADMIN')")
    public ResponseEntity<ChecklistItemResponse> getChecklistItem(
            @PathVariable Long resultId,
            @AuthenticationPrincipal User user
    ) {
        log.info("Get checklist item request: resultId={}, userId={}", resultId, user.getUserId());

        ChecklistItemResponse response = checklistService.getChecklistItem(resultId, user);

        return ResponseEntity.ok(response);
    }
}

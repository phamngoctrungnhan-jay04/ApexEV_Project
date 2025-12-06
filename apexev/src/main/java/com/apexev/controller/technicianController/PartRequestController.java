package com.apexev.controller.technicianController;

import com.apexev.dto.request.technicianRequest.CreatePartRequestRequest;
import com.apexev.dto.response.technicianResponse.PartRequestResponse;
import com.apexev.dto.response.technicianResponse.PartResponse;
import com.apexev.entity.User;
import com.apexev.service.serviceImpl.PartRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
@Slf4j
public class PartRequestController {

    private final PartRequestService partRequestService;

    /**
     * Lấy danh sách tất cả phụ tùng
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<List<PartResponse>> getAllParts() {
        log.info("Get all parts");
        List<PartResponse> parts = partRequestService.getAllParts();
        return ResponseEntity.ok(parts);
    }

    /**
     * Tìm kiếm phụ tùng
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<List<PartResponse>> searchParts(@RequestParam String keyword) {
        log.info("Search parts with keyword: {}", keyword);
        List<PartResponse> parts = partRequestService.searchParts(keyword);
        return ResponseEntity.ok(parts);
    }

    /**
     * Tạo yêu cầu phụ tùng mới
     */
    @PostMapping("/requests")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<PartRequestResponse> createPartRequest(
            @Valid @RequestBody CreatePartRequestRequest request,
            @AuthenticationPrincipal User technician) {
        log.info("Create part request: partId={}, orderId={}, quantity={}",
                request.getPartId(), request.getServiceOrderId(), request.getQuantity());
        PartRequestResponse response = partRequestService.createPartRequest(request, technician);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách yêu cầu của technician
     */
    @GetMapping("/requests/my")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<PartRequestResponse>> getMyPartRequests(
            @AuthenticationPrincipal User technician) {
        log.info("Get my part requests for technician: {}", technician.getUserId());
        List<PartRequestResponse> requests = partRequestService.getMyPartRequests(technician);
        return ResponseEntity.ok(requests);
    }

    /**
     * Lấy yêu cầu theo service order
     */
    @GetMapping("/requests/order/{serviceOrderId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<List<PartRequestResponse>> getPartRequestsByOrder(
            @PathVariable Long serviceOrderId,
            @AuthenticationPrincipal User user) {
        log.info("Get part requests for order: {}", serviceOrderId);
        List<PartRequestResponse> requests = partRequestService.getPartRequestsByOrder(serviceOrderId, user);
        return ResponseEntity.ok(requests);
    }

    /**
     * Lấy tất cả yêu cầu đang chờ duyệt
     */
    @GetMapping("/requests/pending")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<List<PartRequestResponse>> getPendingPartRequests(
            @AuthenticationPrincipal User user) {
        log.info("Get pending part requests");
        List<PartRequestResponse> requests = partRequestService.getPendingPartRequests(user);
        return ResponseEntity.ok(requests);
    }

    /**
     * Duyệt yêu cầu
     */
    @PatchMapping("/requests/{requestId}/approve")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<PartRequestResponse> approvePartRequest(
            @PathVariable Long requestId,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal User approver) {
        log.info("Approve part request: {}", requestId);
        PartRequestResponse response = partRequestService.approveOrRejectPartRequest(requestId, true, notes, approver);
        return ResponseEntity.ok(response);
    }

    /**
     * Từ chối yêu cầu
     */
    @PatchMapping("/requests/{requestId}/reject")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<PartRequestResponse> rejectPartRequest(
            @PathVariable Long requestId,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal User approver) {
        log.info("Reject part request: {}", requestId);
        PartRequestResponse response = partRequestService.approveOrRejectPartRequest(requestId, false, notes, approver);
        return ResponseEntity.ok(response);
    }

    /**
     * Hủy yêu cầu (Technician)
     */
    @DeleteMapping("/requests/{requestId}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<PartRequestResponse> cancelPartRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User technician) {
        log.info("Cancel part request: {}", requestId);
        PartRequestResponse response = partRequestService.cancelPartRequest(requestId, technician);
        return ResponseEntity.ok(response);
    }
}

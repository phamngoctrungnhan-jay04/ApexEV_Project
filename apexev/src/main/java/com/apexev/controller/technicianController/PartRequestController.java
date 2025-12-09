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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parts")
@CrossOrigin(origins = "*", maxAge = 3600)
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
     * CUSTOMER có thể xem để duyệt báo giá
     */
    @GetMapping("/requests/order/{serviceOrderId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN', 'CUSTOMER')")
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
     * Từ chối yêu cầu (chỉ áp dụng cho PENDING)
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
     * Xóa phụ tùng khỏi báo giá (áp dụng cho APPROVED)
     */
    @PatchMapping("/requests/{requestId}/remove")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<PartRequestResponse> removePartRequest(
            @PathVariable Long requestId,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal User approver) {
        log.info("Remove part request from quote: {}", requestId);
        PartRequestResponse response = partRequestService.removeApprovedPartRequest(requestId, notes, approver);
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

    /**
     * Gửi email báo giá cho customer (Advisor)
     */
    @PostMapping("/requests/send-quote/{serviceOrderId}")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<Map<String, String>> sendQuoteToCustomer(
            @PathVariable Long serviceOrderId,
            @AuthenticationPrincipal User advisor) {
        log.info("Send quote email for order: {}", serviceOrderId);
        partRequestService.sendQuoteToCustomer(serviceOrderId, advisor);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã gửi báo giá qua email cho khách hàng");

        return ResponseEntity.ok(response);
    }

    /**
     * Customer duyệt báo giá (QUOTED -> FULFILLED)
     */
    @PostMapping("/requests/approve-quote/{serviceOrderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> approveQuote(
            @PathVariable Long serviceOrderId,
            @AuthenticationPrincipal User customer) {
        log.info("Customer approve quote for order: {}", serviceOrderId);
        partRequestService.approveQuote(serviceOrderId, customer);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã duyệt báo giá thành công");

        return ResponseEntity.ok(response);
    }

    /**
     * Customer từ chối báo giá (QUOTED -> REJECTED -> QUOTE_REJECTED)
     */
    @PostMapping("/requests/reject-quote/{serviceOrderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> rejectQuote(
            @PathVariable Long serviceOrderId,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal User customer) {
        log.info("Customer reject quote for order: {}", serviceOrderId);
        partRequestService.rejectQuote(serviceOrderId, reason, customer);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã từ chối báo giá. Cố vấn sẽ liên hệ với bạn để tư vấn phương án khác.");

        return ResponseEntity.ok(response);
    }

    /**
     * Advisor tư vấn lại - Mở lại form báo giá (QUOTE_REJECTED -> QUOTING)
     */
    @PostMapping("/requests/reopen-quote/{serviceOrderId}")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<Map<String, String>> reopenQuote(
            @PathVariable Long serviceOrderId,
            @AuthenticationPrincipal User advisor) {
        log.info("Advisor reopen quote for order: {}", serviceOrderId);
        partRequestService.reopenQuote(serviceOrderId, advisor);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã mở lại báo giá. Bạn có thể chỉnh sửa và gửi lại cho khách hàng.");

        return ResponseEntity.ok(response);
    }

    /**
     * Advisor hoàn tất đơn - Bỏ qua phụ tùng (QUOTE_REJECTED -> IN_PROGRESS)
     */
    @PostMapping("/requests/skip-parts/{serviceOrderId}")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<Map<String, String>> skipPartsAndComplete(
            @PathVariable Long serviceOrderId,
            @AuthenticationPrincipal User advisor) {
        log.info("Advisor skip parts for order: {}", serviceOrderId);
        partRequestService.skipPartsAndComplete(serviceOrderId, advisor);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã bỏ qua phụ tùng. Đơn hàng sẽ hoàn tất với dịch vụ ban đầu.");

        return ResponseEntity.ok(response);
    }
}

package com.apexev.controller.coreBussinessController;

import com.apexev.dto.request.ApproveLeaveRequest;
import com.apexev.dto.request.CreateLeaveRequestRequest;
import com.apexev.dto.response.LeaveRequestResponse;
import com.apexev.security.services.UserDetailsImpl;
import com.apexev.service.service_Interface.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
@Tag(name = "Leave Management", description = "Quản lý nghỉ phép")
public class LeaveController {
    private final LeaveService leaveService;
    @PostMapping("/request")
    public ResponseEntity<LeaveRequestResponse> createLeaveRequest(
            @Valid @RequestBody CreateLeaveRequestRequest request) {
        LeaveRequestResponse response = leaveService.createLeaveRequest(request);
        return ResponseEntity.ok(response);
    }
    @PutMapping("/{leaveRequestId}/approve")
    @PreAuthorize("hasRole('BUSINESS_MANAGER')")
    @Operation(summary = "Duyệt hoặc từ chối đơn xin nghỉ", description = "Chỉ BUSINESS_MANAGER")
    public ResponseEntity<LeaveRequestResponse> approveLeaveRequest(
            @PathVariable Integer leaveRequestId,
            @Valid @RequestBody ApproveLeaveRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        LeaveRequestResponse response = leaveService.approveLeaveRequest(
                leaveRequestId, request, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('BUSINESS_MANAGER')")
    @Operation(summary = "Lấy danh sách tất cả đơn xin nghỉ")
    public ResponseEntity<List<LeaveRequestResponse>> getAllLeaveRequests() {
        return ResponseEntity.ok(leaveService.getAllLeaveRequests());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('BUSINESS_MANAGER')")
    @Operation(summary = "Lấy danh sách đơn xin nghỉ chờ duyệt")
    public ResponseEntity<List<LeaveRequestResponse>> getPendingLeaveRequests() {
        return ResponseEntity.ok(leaveService.getPendingLeaveRequests());
    }
}


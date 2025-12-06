package com.apexev.controller.coreBussinessController;

import com.apexev.dto.request.coreBussinessRequest.AssignShiftRequest;
import com.apexev.dto.request.coreBussinessRequest.CreateShiftRequest;
import com.apexev.dto.response.coreBussinessResponse.ShiftResponse;
import com.apexev.security.services.UserDetailsImpl;
import com.apexev.service.service_Interface.ShiftService;
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
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
@Tag(name = "Shift Management", description = "Quản lý ca làm việc")
public class ShiftController {

    private final ShiftService shiftService;

    @PostMapping
    @PreAuthorize("hasRole('BUSINESS_MANAGER')")
    @Operation(summary = "Tạo ca làm việc mới", description = "Chỉ BUSINESS_MANAGER")
    public ResponseEntity<ShiftResponse> createShift(
            @Valid @RequestBody CreateShiftRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        ShiftResponse response = shiftService.createShift(request, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assign")
    @PreAuthorize("hasRole('BUSINESS_MANAGER')")
    @Operation(summary = "Phân công nhân viên vào ca làm việc", description = "Chỉ BUSINESS_MANAGER")
    public ResponseEntity<String> assignStaff(
            @Valid @RequestBody AssignShiftRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        shiftService.assignStaff(request, userDetails.getId());
        return ResponseEntity.ok("Phân công ca làm việc thành công");
    }

    @GetMapping
    @PreAuthorize("hasRole('BUSINESS_MANAGER')")
    @Operation(summary = "Lấy danh sách tất cả ca làm việc")
    public ResponseEntity<List<ShiftResponse>> getAllShifts() {
        return ResponseEntity.ok(shiftService.getAllShifts());
    }

    @GetMapping("/{shiftId}")
    @PreAuthorize("hasRole('BUSINESS_MANAGER')")
    @Operation(summary = "Lấy thông tin chi tiết ca làm việc")
    public ResponseEntity<ShiftResponse> getShiftById(@PathVariable Integer shiftId) {
        return ResponseEntity.ok(shiftService.getShiftById(shiftId));
    }

    @DeleteMapping("/{shiftId}")
    @PreAuthorize("hasRole('BUSINESS_MANAGER')")
    @Operation(summary = "Xóa ca làm việc")
    public ResponseEntity<String> deleteShift(@PathVariable Integer shiftId) {
        shiftService.deleteShift(shiftId);
        return ResponseEntity.ok("Xóa ca làm việc thành công");
    }
}


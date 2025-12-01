package com.apexev.controller;

import com.apexev.dto.request.UpdateStaffProfileRequest;
import com.apexev.dto.response.StaffProfileResponse;
import com.apexev.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "Employee Management", description = "Quản lý hồ sơ nhân viên")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasRole('BUSINESS_MANAGER')")
    @Operation(summary = "Lấy danh sách tất cả nhân viên")
    public ResponseEntity<List<StaffProfileResponse>> getAllStaff() {
        return ResponseEntity.ok(employeeService.getAllStaff());
    }

    @GetMapping("/{staffId}")
    @PreAuthorize("hasRole('BUSINESS_MANAGER')")
    @Operation(summary = "Lấy thông tin chi tiết nhân viên")
    public ResponseEntity<StaffProfileResponse> getStaffById(@PathVariable Integer staffId) {
        return ResponseEntity.ok(employeeService.getStaffById(staffId));
    }

    @PutMapping("/{staffId}")
    @PreAuthorize("hasRole('BUSINESS_MANAGER')")
    @Operation(summary = "Cập nhật hồ sơ nhân viên")
    public ResponseEntity<StaffProfileResponse> updateStaffProfile(
            @PathVariable Integer staffId,
            @Valid @RequestBody UpdateStaffProfileRequest request) {
        StaffProfileResponse response = employeeService.updateStaffProfile(staffId, request);
        return ResponseEntity.ok(response);
    }
}


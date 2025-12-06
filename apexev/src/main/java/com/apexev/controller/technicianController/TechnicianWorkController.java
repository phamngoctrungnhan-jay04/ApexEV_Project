package com.apexev.controller.technicianController;

import com.apexev.dto.request.technicianRequest.AddTechnicianNotesRequest;
import com.apexev.dto.request.technicianRequest.UpdateWorkStatusRequest;
import com.apexev.dto.response.technicianResponse.TechnicianAvailabilityResponse;
import com.apexev.dto.response.technicianResponse.TechnicianWorkDetailResponse;
import com.apexev.dto.response.technicianResponse.TechnicianWorkResponse;
import com.apexev.entity.User;
import com.apexev.service.service_Interface.TechnicianWorkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technician")
@RequiredArgsConstructor
public class TechnicianWorkController {
    private final TechnicianWorkService technicianWorkService;

    // Lấy danh sách công việc được giao
    @GetMapping("/my-works")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<TechnicianWorkResponse>> getMyAssignedWorks(
            @AuthenticationPrincipal User loggedInUser) {
        List<TechnicianWorkResponse> works = technicianWorkService.getMyAssignedWorks(loggedInUser);
        return ResponseEntity.ok(works);
    }

    // Xem chi tiết 1 công việc
    @GetMapping("/works/{id}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TechnicianWorkDetailResponse> getWorkDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal User loggedInUser) {
        TechnicianWorkDetailResponse workDetail = technicianWorkService.getWorkDetail(id, loggedInUser);
        return ResponseEntity.ok(workDetail);
    }

    // Cập nhật trạng thái công việc
    @PatchMapping("/works/{id}/status")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TechnicianWorkDetailResponse> updateWorkStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWorkStatusRequest request,
            @AuthenticationPrincipal User loggedInUser) {
        TechnicianWorkDetailResponse updatedWork = technicianWorkService.updateWorkStatus(id, request, loggedInUser);
        return ResponseEntity.ok(updatedWork);
    }

    // Thêm/cập nhật ghi chú kỹ thuật viên
    @PatchMapping("/works/{id}/notes")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TechnicianWorkDetailResponse> addTechnicianNotes(
            @PathVariable Long id,
            @Valid @RequestBody AddTechnicianNotesRequest request,
            @AuthenticationPrincipal User loggedInUser) {
        TechnicianWorkDetailResponse updatedWork = technicianWorkService.addTechnicianNotes(id, request, loggedInUser);
        return ResponseEntity.ok(updatedWork);
    }

    // Lấy danh sách technicians với thông tin số công việc đang làm (cho Service
    // Advisor)
    @GetMapping("/available")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    public ResponseEntity<List<TechnicianAvailabilityResponse>> getAvailableTechnicians() {
        try {
            System.out.println("[DEBUG] getAvailableTechnicians() - Bắt đầu...");
            List<TechnicianAvailabilityResponse> technicians = technicianWorkService.getAvailableTechnicians();
            System.out.println("[DEBUG] getAvailableTechnicians() - Tìm thấy " + technicians.size() + " technicians");
            return ResponseEntity.ok(technicians);
        } catch (Exception e) {
            System.err.println("[ERROR] getAvailableTechnicians() - Lỗi: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}

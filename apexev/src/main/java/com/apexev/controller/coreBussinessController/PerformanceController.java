package com.apexev.controller.coreBussinessController;

import com.apexev.dto.request.CreatePerformanceReviewRequest;
import com.apexev.dto.response.PerformanceReviewResponse;
import com.apexev.security.services.UserDetailsImpl;
import com.apexev.service.service_Interface.PerformanceService;
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
@RequestMapping("/api/performance")
@RequiredArgsConstructor
@Tag(name = "Performance Management", description = "Quản lý đánh giá hiệu suất")
public class PerformanceController {

    private final PerformanceService performanceService;

    @PostMapping("/reviews")
    @PreAuthorize("hasAuthority('BUSINESS_MANAGER')")
    @Operation(summary = "Tạo đánh giá hiệu suất", description = "Chỉ BUSINESS_MANAGER")
    public ResponseEntity<PerformanceReviewResponse> createReview(
            @Valid @RequestBody CreatePerformanceReviewRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        PerformanceReviewResponse response = performanceService.createReview(request, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reviews/{reviewId}/finalize")
    @PreAuthorize("hasAuthority('BUSINESS_MANAGER')")
    @Operation(summary = "Hoàn tất đánh giá hiệu suất")
    public ResponseEntity<PerformanceReviewResponse> finalizeReview(@PathVariable Integer reviewId) {
        PerformanceReviewResponse response = performanceService.finalizeReview(reviewId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reviews")
    @PreAuthorize("hasAuthority('BUSINESS_MANAGER')")
    @Operation(summary = "Lấy danh sách tất cả đánh giá")
    public ResponseEntity<List<PerformanceReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(performanceService.getAllReviews());
    }

    @GetMapping("/reviews/staff/{staffId}")
    @PreAuthorize("hasAuthority('BUSINESS_MANAGER')")
    @Operation(summary = "Lấy danh sách đánh giá của nhân viên")
    public ResponseEntity<List<PerformanceReviewResponse>> getReviewsByStaff(@PathVariable Integer staffId) {
        return ResponseEntity.ok(performanceService.getReviewsByStaff(staffId));
    }

    @GetMapping("/reviews/{reviewId}")
    @PreAuthorize("hasAuthority('BUSINESS_MANAGER')")
    @Operation(summary = "Lấy chi tiết đánh giá")
    public ResponseEntity<PerformanceReviewResponse> getReviewById(@PathVariable Integer reviewId) {
        return ResponseEntity.ok(performanceService.getReviewById(reviewId));
    }
}


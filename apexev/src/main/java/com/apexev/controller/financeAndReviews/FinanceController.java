// File: FinanceController.java
// API quản lý tài chính cho BUSINESS_MANAGER

package com.apexev.controller.financeAndReviews;

import com.apexev.dto.response.financeAndReviewsResponse.FinanceStatisticsResponse;
import com.apexev.dto.response.financeAndReviewsResponse.InvoiceDetailResponse;
import com.apexev.dto.response.financeAndReviewsResponse.InvoiceResponse;
import com.apexev.entity.User;
import com.apexev.service.service_Interface.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('BUSINESS_MANAGER', 'ADMIN')")
public class FinanceController {

    private final FinanceService financeService;

    /**
     * Lấy tất cả hóa đơn (có filter theo status, ngày)
     */
    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceDetailResponse>> getAllInvoices(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User loggedInUser) {
        List<InvoiceDetailResponse> invoices = financeService.getAllInvoices(status, startDate, endDate);
        return ResponseEntity.ok(invoices);
    }

    /**
     * Lấy chi tiết hóa đơn theo ID
     */
    @GetMapping("/invoices/{invoiceId}")
    public ResponseEntity<InvoiceDetailResponse> getInvoiceDetail(
            @PathVariable Long invoiceId,
            @AuthenticationPrincipal User loggedInUser) {
        InvoiceDetailResponse invoice = financeService.getInvoiceDetail(invoiceId);
        return ResponseEntity.ok(invoice);
    }

    /**
     * Lấy thống kê tài chính tổng quan
     */
    @GetMapping("/statistics")
    public ResponseEntity<FinanceStatisticsResponse> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User loggedInUser) {
        FinanceStatisticsResponse stats = financeService.getStatistics(startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    /**
     * Lấy thống kê theo tháng (cho biểu đồ)
     */
    @GetMapping("/statistics/monthly")
    public ResponseEntity<List<FinanceStatisticsResponse.MonthlyRevenue>> getMonthlyStatistics(
            @RequestParam(defaultValue = "6") int months,
            @AuthenticationPrincipal User loggedInUser) {
        List<FinanceStatisticsResponse.MonthlyRevenue> monthlyStats = financeService.getMonthlyStatistics(months);
        return ResponseEntity.ok(monthlyStats);
    }

    /**
     * Xác nhận thanh toán (chuyển trạng thái PENDING -> PAID)
     */
    @PatchMapping("/invoices/{invoiceId}/confirm-payment")
    public ResponseEntity<InvoiceDetailResponse> confirmPayment(
            @PathVariable Long invoiceId,
            @RequestParam(required = false) String paymentMethod,
            @AuthenticationPrincipal User loggedInUser) {
        InvoiceDetailResponse invoice = financeService.confirmPayment(invoiceId, paymentMethod, loggedInUser);
        return ResponseEntity.ok(invoice);
    }

    /**
     * Hủy hóa đơn (chuyển trạng thái -> CANCELLED)
     */
    @PatchMapping("/invoices/{invoiceId}/cancel")
    public ResponseEntity<InvoiceDetailResponse> cancelInvoice(
            @PathVariable Long invoiceId,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal User loggedInUser) {
        InvoiceDetailResponse invoice = financeService.cancelInvoice(invoiceId, reason, loggedInUser);
        return ResponseEntity.ok(invoice);
    }

    /**
     * Lấy danh sách hóa đơn quá hạn
     */
    @GetMapping("/invoices/overdue")
    public ResponseEntity<List<InvoiceDetailResponse>> getOverdueInvoices(
            @AuthenticationPrincipal User loggedInUser) {
        List<InvoiceDetailResponse> overdueInvoices = financeService.getOverdueInvoices();
        return ResponseEntity.ok(overdueInvoices);
    }
}

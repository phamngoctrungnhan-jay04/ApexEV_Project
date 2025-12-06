package com.apexev.controller.financeAndReviews;

import com.apexev.dto.response.financeAndReviewsResponse.InvoiceResponse;
import com.apexev.entity.User;
import com.apexev.service.service_Interface.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService invoiceService;

    // Tạo hóa đơn từ ServiceOrder (chỉ cố vấn)
    @PostMapping("/create-from-order/{orderId}")
    @PreAuthorize("hasRole('SERVICE_ADVISOR')")
    public ResponseEntity<InvoiceResponse> createInvoiceFromOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User loggedInUser
    ) {
        InvoiceResponse invoice = invoiceService.createInvoiceFromOrder(orderId, loggedInUser);
        return new ResponseEntity<>(invoice, HttpStatus.CREATED);
    }

    // Lấy hóa đơn theo orderId
    @GetMapping("/order/{orderId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByOrderId(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User loggedInUser
    ) {
        InvoiceResponse invoice = invoiceService.getInvoiceByOrderId(orderId, loggedInUser);
        return ResponseEntity.ok(invoice);
    }

    // Đánh dấu hóa đơn đã thanh toán (thanh toán tiền mặt)
    @PatchMapping("/{invoiceId}/mark-paid")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'BUSINESS_MANAGER')")
    public ResponseEntity<InvoiceResponse> markAsPaid(
            @PathVariable Long invoiceId,
            @AuthenticationPrincipal User loggedInUser
    ) {
        InvoiceResponse invoice = invoiceService.markAsPaid(invoiceId, loggedInUser);
        return ResponseEntity.ok(invoice);
    }
}

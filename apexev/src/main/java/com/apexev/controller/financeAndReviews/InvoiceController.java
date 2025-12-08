package com.apexev.controller.financeAndReviews;

import com.apexev.dto.response.financeAndReviewsResponse.InvoiceResponse;
import com.apexev.dto.response.orderResponse.OrderDetailForInvoice;
import com.apexev.dto.response.orderResponse.ServiceOrderResponse;
import com.apexev.entity.User;
import com.apexev.service.service_Interface.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService invoiceService;

    // Lấy danh sách đơn hàng sẵn sàng xuất hóa đơn
    @GetMapping("/ready-orders")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'BUSINESS_MANAGER', 'ADMIN')")
    public ResponseEntity<List<ServiceOrderResponse>> getOrdersReadyForInvoice() {
        List<ServiceOrderResponse> orders = invoiceService.getOrdersReadyForInvoice();
        return ResponseEntity.ok(orders);
    }

    // Lấy chi tiết đơn hàng trước khi xuất hóa đơn
    @GetMapping("/order-detail/{orderId}")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'BUSINESS_MANAGER', 'ADMIN')")
    public ResponseEntity<OrderDetailForInvoice> getOrderDetailForInvoice(@PathVariable Long orderId) {
        OrderDetailForInvoice detail = invoiceService.getOrderDetailForInvoice(orderId);
        return ResponseEntity.ok(detail);
    }

    // Tạo hóa đơn từ ServiceOrder (chỉ cố vấn)
    @PostMapping("/create/{orderId}")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'BUSINESS_MANAGER', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> createInvoiceFromOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User loggedInUser) {
        InvoiceResponse invoice = invoiceService.createInvoiceFromOrder(orderId, loggedInUser);
        return new ResponseEntity<>(invoice, HttpStatus.CREATED);
    }

    // Lấy hóa đơn theo orderId
    @GetMapping("/order/{orderId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByOrderId(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User loggedInUser) {
        InvoiceResponse invoice = invoiceService.getInvoiceByOrderId(orderId, loggedInUser);
        return ResponseEntity.ok(invoice);
    }

    // Đánh dấu hóa đơn đã thanh toán (thanh toán tiền mặt)
    @PatchMapping("/{invoiceId}/mark-paid")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'BUSINESS_MANAGER')")
    public ResponseEntity<InvoiceResponse> markAsPaid(
            @PathVariable Long invoiceId,
            @AuthenticationPrincipal User loggedInUser) {
        InvoiceResponse invoice = invoiceService.markAsPaid(invoiceId, loggedInUser);
        return ResponseEntity.ok(invoice);
    }

    // Xác nhận thanh toán và giao xe cho khách hàng
    @PostMapping("/{invoiceId}/confirm-payment")
    @PreAuthorize("hasAnyRole('SERVICE_ADVISOR', 'BUSINESS_MANAGER', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> confirmPaymentAndDeliver(
            @PathVariable Long invoiceId,
            @AuthenticationPrincipal User loggedInUser) {
        InvoiceResponse invoice = invoiceService.confirmPaymentAndDeliver(invoiceId, loggedInUser);
        return ResponseEntity.ok(invoice);
    }
}

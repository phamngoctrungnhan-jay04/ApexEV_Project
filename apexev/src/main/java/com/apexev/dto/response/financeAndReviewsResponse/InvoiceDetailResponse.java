// File: InvoiceDetailResponse.java
// DTO chi tiết hóa đơn (bao gồm thông tin order và customer)

package com.apexev.dto.response.financeAndReviewsResponse;

import com.apexev.enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDetailResponse {

    // Thông tin hóa đơn
    private Long id;
    private BigDecimal totalAmount;
    private InvoiceStatus status;
    private LocalDateTime issuedDate;
    private LocalDateTime dueDate;
    private LocalDateTime paidDate;
    private String paymentMethod;

    // Thông tin đơn hàng
    private Long orderId;
    private String orderStatus;
    private LocalDateTime orderCreatedAt;
    private LocalDateTime orderCompletedAt;

    // Thông tin khách hàng
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // Thông tin xe
    private Long vehicleId;
    private String vehicleBrand;
    private String vehicleModel;
    private String vehiclePlate;

    // Dịch vụ trong đơn
    private List<ServiceItemResponse> services;

    // Trạng thái quá hạn
    private boolean isOverdue;
    private Long daysOverdue;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceItemResponse {
        private Long itemId;
        private String serviceName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private String itemStatus;
    }
}

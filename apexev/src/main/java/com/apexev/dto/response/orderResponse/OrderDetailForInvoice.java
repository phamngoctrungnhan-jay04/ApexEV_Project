// File: OrderDetailForInvoice.java
// DTO chi tiết đơn hàng để hiển thị khi xuất hóa đơn
package com.apexev.dto.response.orderResponse;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDetailForInvoice {
    private Long orderId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String vehiclePlate;
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleVin;
    private LocalDateTime completedAt;
    private String technicianName;
    private String advisorName;
    private String technicianNotes;
    private String advisorNotes;

    // Danh sách dịch vụ
    private List<ServiceItemDetail> services;

    // Danh sách phụ tùng
    private List<PartItemDetail> parts;

    // Tổng chi phí
    private BigDecimal totalServiceCost;
    private BigDecimal totalPartCost;
    private BigDecimal grandTotal;

    @Data
    public static class ServiceItemDetail {
        private Long serviceId;
        private String serviceName;
        private String serviceDescription;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal subtotal;
    }

    @Data
    public static class PartItemDetail {
        private Long partId;
        private String partName;
        private String partCode;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal subtotal;
        private String status; // PENDING, APPROVED, REJECTED
    }
}

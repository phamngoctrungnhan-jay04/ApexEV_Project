// File: ServiceOrderResponse.java
// DTO đơn giản cho danh sách đơn hàng trong Invoice Management
package com.apexev.dto.response.orderResponse;

import com.apexev.enums.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ServiceOrderResponse {
    private Long orderId;
    private String customerName;
    private String customerPhone;
    private String vehiclePlate;
    private String vehicleBrand;
    private String vehicleModel;
    private String serviceName; // Tên dịch vụ chính
    private OrderStatus status;
    private LocalDateTime completedAt;
    private BigDecimal totalAmount;

    // Thông tin invoice (nếu có)
    private Long invoiceId;
    private String invoiceStatus;
}

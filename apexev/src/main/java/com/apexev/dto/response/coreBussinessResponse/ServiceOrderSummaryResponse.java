package com.apexev.dto.response.coreBussinessResponse;

import com.apexev.enums.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ServiceOrderSummaryResponse { // cho danh sách đánh đơn hàng
    private Long id; // ID của Đơn bảo dưỡng
    private OrderStatus status; // (Sẽ luôn là COMPLETED)
    private LocalDateTime createdAt;
    private LocalDateTime completedAt; // Ngày hoàn thành


    private Long vehicleId;
    private String vehicleLicensePlate;
    private String vehicleModel;
    private BigDecimal totalAmount;
}

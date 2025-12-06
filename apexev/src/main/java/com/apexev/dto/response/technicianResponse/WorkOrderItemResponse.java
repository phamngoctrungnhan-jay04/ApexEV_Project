package com.apexev.dto.response.technicianResponse;

import com.apexev.enums.OrderItemStatus;
import com.apexev.enums.OrderItemType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class WorkOrderItemResponse {
    private Long id;
    private OrderItemType itemType; // SERVICE hoặc PART
    private Long serviceId; // ID của dịch vụ (nếu itemType là SERVICE)
    private String serviceName; // Tên dịch vụ
    private Long partId; // ID của phụ tùng (nếu itemType là PART)
    private String partName; // Tên phụ tùng
    private String itemName; // Tên chung (backward compatible)
    private int quantity;
    private BigDecimal unitPrice;
    private OrderItemStatus status; // REQUESTED, APPROVED, REJECTED
}

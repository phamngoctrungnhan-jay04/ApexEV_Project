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
    private String itemName; // Tên dịch vụ hoặc phụ tùng
    private int quantity;
    private BigDecimal unitPrice;
    private OrderItemStatus status; // REQUESTED, APPROVED, REJECTED
}

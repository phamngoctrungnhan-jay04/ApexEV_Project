package com.apexev.dto.response.coreBussinessResponse;

import com.apexev.enums.OrderItemType;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceOrderItemResponse { //Chi tiết từng món hàng
    private OrderItemType itemType;
    private int quantity;
    private BigDecimal unitPrice;

    // tên của món hàng này
    private String itemName;
}

package com.apexev.dto.response.technicianResponse;

import com.apexev.enums.OrderStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TechnicianWorkResponse {
    private Long id;
    private OrderStatus status;
    private LocalDateTime createdAt;
    
    // Thông tin xe
    private String vehicleLicensePlate;
    private String vehicleModel;
    private String vehicleBrand;
    
    // Thông tin khách hàng
    private String customerName;
    private String customerPhone;
    
    // Mô tả ngắn gọn
    private String customerDescription;
}

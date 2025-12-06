package com.apexev.dto.response.technicianResponse;

import com.apexev.enums.OrderStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class TechnicianWorkDetailResponse {
    private Long id;
    private OrderStatus status;
    private LocalDateTime createdAt;
    
    // Thông tin xe
    private String vehicleLicensePlate;
    private String vehicleModel;
    private String vehicleBrand;
    private String vehicleVinNumber;
    private Integer vehicleYearManufactured;
    
    // Thông tin khách hàng
    private String customerName;
    private String customerPhone;
    
    // Mô tả và ghi chú
    private String customerDescription; // Mô tả của khách hàng
    private String advisorNotes; // Ghi chú của cố vấn
    private String technicianNotes; // Ghi chú của kỹ thuật viên
    
    // Thông tin cố vấn
    private String serviceAdvisorName;
    
    // Danh sách items (phụ tùng/dịch vụ cần làm)
    private List<WorkOrderItemResponse> orderItems;
}

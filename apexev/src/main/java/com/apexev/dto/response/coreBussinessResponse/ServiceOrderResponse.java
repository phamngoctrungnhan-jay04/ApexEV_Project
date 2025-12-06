package com.apexev.dto.response.coreBussinessResponse;

import com.apexev.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrderResponse {
    
    private Long id;
    
    private Long customerId;
    
    private String customerName;
    
    private String customerEmail;
    
    private String customerPhone;
    
    private Long vehicleId;
    
    private String vehicleLicensePlate;
    
    private String vehicleModel;
    
    private String vehicleBrand;
    
    private OrderStatus status;
    
    private String customerDescription;
    
    private String advisorNotes;
    
    private String technicianNotes;
    
    private Long serviceAdvisorId;
    
    private String serviceAdvisorName;
    
    private Long technicianId;
    
    private String technicianName;
    
    private Long appointmentId; // Null if walk-in
    
    private LocalDateTime createdAt;
    
    private LocalDateTime completedAt;
    
    private List<ServiceOrderItemResponse> orderItems;
    
    private Double estimatedTotal;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceOrderItemResponse {
        private Long itemId;
        private String itemType;
        private Long itemRefId;
        private String itemName;
        private Integer quantity;
        private Double unitPrice;
        private String status;
    }
}

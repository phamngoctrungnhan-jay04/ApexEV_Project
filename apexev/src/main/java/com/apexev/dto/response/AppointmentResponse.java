package com.apexev.dto.response;

import com.apexev.enums.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    
    private Long id;
    
    private Long customerId;
    
    private String customerName;
    
    private String customerEmail;
    
    private String customerPhone;
    
    private Long vehicleId;
    
    private String vehicleLicensePlate;
    
    private String vehicleModel;
    
    private String vehicleBrand;
    
    private String requestedService;
    
    private LocalDateTime appointmentTime;
    
    private AppointmentStatus status;
    
    private String notes;
    
    private Long serviceAdvisorId;
    
    private String serviceAdvisorName;
    
    private LocalDateTime createdAt;
    
    private Long serviceOrderId; // If appointment has been converted to service order
}

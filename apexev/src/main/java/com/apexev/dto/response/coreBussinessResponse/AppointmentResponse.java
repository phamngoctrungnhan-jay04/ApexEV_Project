package com.apexev.dto.response.coreBussinessResponse;

import com.apexev.enums.AppointmentStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentResponse {
    private Long id;
    private LocalDateTime appointmentTime;
    private AppointmentStatus status;
    private String requestedService;
    private String notes;
    private Long customerId;
    private String customerFullName;
    private String customerPhone; // Thêm số điện thoại khách hàng
    private Long vehicleId;
    private String vehicleLicensePlate;
    private Long serviceAdvisorId; // Có thể null
    private String serviceAdvisorName; // Có thể null
    private Long assignedTechnicianId; // Technician đã được assign
    private String assignedTechnicianName;
    private Long serviceOrderId; // ID của ServiceOrder (nếu đã chuyển sang luồng Order chi tiết)
    private String serviceOrderStatus; // Trạng thái thực tế của ServiceOrder (RECEPTION, INSPECTION, IN_PROGRESS...)
}

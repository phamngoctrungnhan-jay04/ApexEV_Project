package com.apexev.dto.request.coreBussinessRequest;

import com.apexev.enums.AppointmentStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateAppointmentRequest {
    
    private String requestedService;
    
    private LocalDateTime appointmentTime;
    
    private AppointmentStatus status;
    
    private String notes;
}

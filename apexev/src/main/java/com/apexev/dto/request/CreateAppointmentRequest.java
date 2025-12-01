package com.apexev.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateAppointmentRequest {
    
    @NotNull(message = "Customer ID cannot be null")
    private Long customerId;
    
    @NotNull(message = "Vehicle ID cannot be null")
    private Long vehicleId;
    
    @NotBlank(message = "Requested service cannot be blank")
    private String requestedService;
    
    @NotNull(message = "Appointment time cannot be null")
    private LocalDateTime appointmentTime;
    
    private String notes;
}

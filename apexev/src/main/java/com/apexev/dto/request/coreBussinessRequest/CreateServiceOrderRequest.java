package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateServiceOrderRequest {
    
    @NotNull(message = "Customer ID cannot be null")
    private Long customerId;
    
    @NotNull(message = "Vehicle ID cannot be null")
    private Long vehicleId;
    
    private String customerDescription;
    
    private String advisorNotes;
    
    private Long technicianId; // Optional, can be assigned later
}

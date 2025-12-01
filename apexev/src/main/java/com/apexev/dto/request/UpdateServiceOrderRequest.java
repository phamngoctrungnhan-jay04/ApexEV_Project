package com.apexev.dto.request;

import com.apexev.enums.OrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateServiceOrderRequest {
    
    private String customerDescription;
    
    private String advisorNotes;
    
    private String technicianNotes;
    
    private OrderStatus status;
    
    private Long technicianId;
}

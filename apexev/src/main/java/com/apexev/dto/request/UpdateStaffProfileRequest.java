package com.apexev.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateStaffProfileRequest {
    private LocalDate hireDate;
    
    private Integer annualLeaveBalance;
    
    private Integer sickLeaveBalance;
    
    private Boolean isActive;
}


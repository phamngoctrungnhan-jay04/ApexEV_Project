package com.apexev.dto.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class StaffProfileResponse {
    private Integer userId;
    private String fullName;
    private String email;
    private String phone;
    private String employeeCode;
    private LocalDate hireDate;
    private Integer annualLeaveBalance;
    private Integer sickLeaveBalance;
    private Boolean isActive;
}


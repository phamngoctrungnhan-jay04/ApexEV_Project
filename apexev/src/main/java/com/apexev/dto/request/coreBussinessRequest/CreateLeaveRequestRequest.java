package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateLeaveRequestRequest {
    
    @NotNull(message = "ID nhân viên không được để trống")
    private Integer staffId;
    
    @NotNull(message = "ID loại nghỉ phép không được để trống")
    private Integer leaveTypeId;
    
    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;
    
    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;
    
    private String reason;
    
    private String documentUrl;
}


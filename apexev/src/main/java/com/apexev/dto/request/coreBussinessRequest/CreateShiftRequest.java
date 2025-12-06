package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateShiftRequest {
    
    @NotBlank(message = "Tên ca làm việc không được để trống")
    private String name;
    
    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalDateTime startTime;
    
    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalDateTime endTime;
    
    private String location;
    
    private String description;
}


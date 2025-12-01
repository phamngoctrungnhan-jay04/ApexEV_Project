package com.apexev.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AssignShiftRequest {
    
    @NotNull(message = "ID ca làm việc không được để trống")
    private Integer shiftId;
    
    @NotEmpty(message = "Danh sách nhân viên không được để trống")
    private List<Integer> staffIds;
    
    private String notes;
}


package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApproveLeaveRequest {
    
    @NotNull(message = "Trạng thái duyệt không được để trống")
    private Boolean approved;
    
    private String rejectionReason;
}


package com.apexev.dto.response.coreBussinessResponse;

import com.apexev.enums.LeaveStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveRequestResponse {
    
    private Integer leaveRequestId;
    private Integer staffId;
    private String staffName;
    private String leaveTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private LeaveStatus status;
    private String reason;
    private String documentUrl;
    private String approverName;
    private LocalDateTime approvedAt;
    private String rejectionReason;
    private LocalDateTime createdAt;
}


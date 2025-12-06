package com.apexev.dto.response.coreBussinessResponse;

import com.apexev.enums.ShiftStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ShiftResponse {
    
    private Integer shiftId;
    private String name;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private ShiftStatus status;
    private String description;
    private List<StaffAssignmentResponse> assignments;
    
    @Data
    public static class StaffAssignmentResponse {
        private Integer assignmentId;
        private Integer staffId;
        private String staffName;
        private ShiftStatus status;
        private String notes;
    }
}


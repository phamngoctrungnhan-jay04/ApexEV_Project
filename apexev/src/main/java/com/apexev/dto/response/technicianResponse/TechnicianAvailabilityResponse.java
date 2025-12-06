package com.apexev.dto.response.technicianResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianAvailabilityResponse {
    private Integer userId;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private Long activeWorkCount; // Số công việc đang làm (status != COMPLETED)
    private Boolean isAvailable; // true nếu activeWorkCount < 3
}

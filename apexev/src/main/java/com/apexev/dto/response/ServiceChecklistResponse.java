package com.apexev.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceChecklistResponse {
    private Long id;
    private Long serviceOrderId;
    private Long templateId;
    private String templateName;
    private Integer technicianId;
    private String technicianName;
    private LocalDateTime createdAt;
    private List<ChecklistItemResponse> results;
    private int totalItems;
    private int completedItems;
    private int passedItems;
    private int failedItems;
}

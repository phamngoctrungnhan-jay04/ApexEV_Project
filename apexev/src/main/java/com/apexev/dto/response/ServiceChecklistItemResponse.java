package com.apexev.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceChecklistItemResponse {
    private Long id;
    private String itemName;
    private String itemNameEn;
    private String itemDescription;
    private String itemDescriptionEn;
    private Integer stepOrder;
    private String category;
    private Integer estimatedTime;
    private Boolean isRequired;
    private Boolean isActive;
    private Long serviceId;
    private String serviceName;
}

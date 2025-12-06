package com.apexev.dto.request.checklistRequest;

import lombok.Data;

@Data
public class CreateChecklistItemRequest {
    private Long serviceId;
    private String itemName;
    private String itemNameEn;
    private String itemDescription;
    private String itemDescriptionEn;
    private Integer stepOrder;
    private String category;
    private Integer estimatedTime;
    private Boolean isRequired = true;
    private Boolean isActive = true;
}

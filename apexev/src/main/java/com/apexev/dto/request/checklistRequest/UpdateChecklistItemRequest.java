package com.apexev.dto.request.checklistRequest;

import lombok.Data;

@Data
public class UpdateChecklistItemRequest {
    private String itemName;
    private String itemNameEn;
    private String itemDescription;
    private String itemDescriptionEn;
    private Integer stepOrder;
    private String category;
    private Integer estimatedTime;
    private Boolean isRequired;
    private Boolean isActive;
}

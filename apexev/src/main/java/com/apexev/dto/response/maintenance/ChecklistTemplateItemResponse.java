package com.apexev.dto.response.maintenance;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistTemplateItemResponse {
    private Long id;
    private String itemName;
    private String itemDescription;
}

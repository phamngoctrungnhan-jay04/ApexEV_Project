package com.apexev.dto.response.maintenance;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistTemplateResponse {
    private Long id;
    private String templateName;
    private String description;
    private List<ChecklistTemplateItemResponse> items;
}

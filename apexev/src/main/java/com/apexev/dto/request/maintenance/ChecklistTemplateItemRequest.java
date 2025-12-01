package com.apexev.dto.request.maintenance;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistTemplateItemRequest {
    @NotBlank(message = "Tên mục kiểm tra không được để trống")
    private String itemName;

    private String description;
}

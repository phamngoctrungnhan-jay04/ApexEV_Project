package com.apexev.dto.request.maintenance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistTemplateRequest {
    @NotBlank(message = "Tên mẫu không được để trống")
    private String templateName;

    private String description;

    @NotEmpty(message = "Mẫu phải có ít nhất một mục kiểm tra")
    private List<ChecklistTemplateItemRequest> items;
}

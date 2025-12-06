package com.apexev.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistTemplateResponse {
    private Long id;
    private String templateName;
    private String description;
    private Long serviceId; // Liên kết với dịch vụ
    private String serviceName; // Tên dịch vụ
    private List<ChecklistTemplateItemResponse> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChecklistTemplateItemResponse {
        private Long id;
        private String itemName;
        private String itemDescription;
    }
}

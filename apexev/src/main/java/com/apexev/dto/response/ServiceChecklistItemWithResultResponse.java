package com.apexev.dto.response;

import com.apexev.enums.ChecklistItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceChecklistItemWithResultResponse {
    // Thông tin service (để group items theo service)
    private Long serviceId;
    private String serviceName;
    
    // Thông tin từ service_checklist_items (Master data của service)
    private Long itemId;
    private String itemName;
    private String itemNameEn;
    private String itemDescription;
    private String itemDescriptionEn;
    private Integer stepOrder;
    private String category;
    private Integer estimatedTime;
    private Boolean isRequired;
    
    // Thông tin kết quả từ service_checklist_results (nếu kỹ thuật viên đã submit)
    private Long resultId; // null nếu chưa submit
    private ChecklistItemStatus status; // null nếu chưa submit
    private String technicianNotes; // null nếu chưa submit
    private String s3Key; // null nếu chưa submit
    private String mediaType; // IMAGE, VIDEO, null nếu chưa submit
    private String mediaUrl; // Pre-signed URL, null nếu chưa submit
    private LocalDateTime submittedAt; // Thời gian submit, null nếu chưa submit
}

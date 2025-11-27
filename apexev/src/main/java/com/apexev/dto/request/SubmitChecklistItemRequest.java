package com.apexev.dto.request;

import com.apexev.enums.ChecklistItemStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitChecklistItemRequest {
    
    @NotNull(message = "Checklist ID không được rỗng")
    private Long checklistId;
    
    @NotNull(message = "Template Item ID không được rỗng")
    private Long templateItemId;
    
    @NotNull(message = "Status không được rỗng")
    private ChecklistItemStatus status; // PASSED or FAILED
    
    private String technicianNotes; // Ghi chú của KTV
    
    private String s3Key; // S3 key của ảnh/video (optional)
    
    private String mediaType; // IMAGE or VIDEO (optional)
}

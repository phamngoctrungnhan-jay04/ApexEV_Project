package com.apexev.dto.response;

import com.apexev.enums.ChecklistItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItemResponse {
    private Long id;
    private Long checklistId;
    private Long templateItemId;
    private String itemName; // Tên hạng mục
    private ChecklistItemStatus status;
    private String technicianNotes;
    private String s3Key;
    private String mediaType;
    private String mediaUrl; // Pre-signed URL để xem (nếu có s3Key)
}

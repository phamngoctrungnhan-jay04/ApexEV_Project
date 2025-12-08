package com.apexev.dto.request;

import com.apexev.enums.ChecklistItemStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitChecklistItemRequest {

    @NotNull(message = "Checklist ID không được rỗng")
    private Long checklistId;

    @NotNull(message = "Template Item ID không được rỗng")
    private Long templateItemId;

    @NotNull(message = "Status không được rỗng")
    private ChecklistItemStatus status; // PENDING, PASSED, FAILED, NEEDS_ATTENTION, NEEDS_REPLACEMENT

    private String technicianNotes; // Ghi chú của KTV

    private String s3Key; // S3 key của ảnh/video đầu tiên (backward compatible)

    private List<String> s3Keys; // Danh sách S3 keys của nhiều ảnh/video (NEW)

    private String mediaType; // IMAGE or VIDEO (optional)
}

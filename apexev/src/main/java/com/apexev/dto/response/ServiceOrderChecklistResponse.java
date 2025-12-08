package com.apexev.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Wrapper response cho checklist items của service order
 * Bao gồm cả trạng thái hoàn thành (isCompleted)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrderChecklistResponse {
    private Boolean isCompleted; // true nếu kỹ thuật viên đã bấm "Hoàn tất kiểm tra"
    private List<ServiceChecklistItemWithResultResponse> items; // Danh sách các checklist items
}

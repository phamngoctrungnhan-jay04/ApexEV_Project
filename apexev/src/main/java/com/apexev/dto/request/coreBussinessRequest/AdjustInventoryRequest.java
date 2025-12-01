package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdjustInventoryRequest {
    
    @NotNull(message = "Số lượng điều chỉnh không được để trống")
    private Integer quantityAdjustment; // Có thể âm (giảm) hoặc dương (tăng)
    
    private String reason; // Lý do điều chỉnh: DAMAGE, RESTOCK, CORRECTION, etc.
    
    private String notes; // Ghi chú bổ sung
}

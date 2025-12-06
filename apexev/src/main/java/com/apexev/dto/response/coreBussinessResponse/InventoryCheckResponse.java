package com.apexev.dto.response.coreBussinessResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCheckResponse {
    
    private Long partId;
    
    private String partName;
    
    private String sku;
    
    private Integer currentQuantity;
    
    private Integer requiredQuantity;
    
    private boolean available;
    
    private Integer insufficientBy; // Số lượng còn thiếu nếu không đủ (null nếu đủ)
}

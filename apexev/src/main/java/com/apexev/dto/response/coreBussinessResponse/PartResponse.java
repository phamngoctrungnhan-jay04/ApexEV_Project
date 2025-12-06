package com.apexev.dto.response.coreBussinessResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartResponse {
    
    private Long id;
    
    private String partName;
    
    private String sku;
    
    private String description;
    
    private Integer quantityInStock;
    
    private BigDecimal price;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // Computed field for availability
    private boolean inStock;
}

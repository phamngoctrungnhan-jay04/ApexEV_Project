package com.apexev.dto.response.technicianResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartResponse {
    private Long id;
    private String partName;
    private String sku;
    private String description;
    private int quantityInStock;
    private BigDecimal price;
    private boolean isAvailable;
}

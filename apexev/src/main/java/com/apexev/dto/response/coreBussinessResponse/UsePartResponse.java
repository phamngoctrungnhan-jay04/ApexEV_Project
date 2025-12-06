package com.apexev.dto.response.coreBussinessResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsePartResponse {
    private Long partId;
    private Long serviceOrderItemId;
    private Integer quantityUsed;
    private Integer quantityInStockAfter;
    private String message;
}

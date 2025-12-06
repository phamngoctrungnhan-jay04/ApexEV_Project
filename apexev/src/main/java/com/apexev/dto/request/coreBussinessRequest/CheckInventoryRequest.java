package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckInventoryRequest {
    
    @NotNull(message = "ID phụ tùng không được để trống")
    private Long partId;
    
    @NotNull(message = "Số lượng cần kiểm tra không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer requiredQuantity;
}

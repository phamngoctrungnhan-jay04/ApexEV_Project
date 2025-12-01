package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePartRequest {
    
    @Size(min = 3, max = 255, message = "Tên phụ tùng phải từ 3 đến 255 ký tự")
    private String partName;
    
    private String description;
    
    @Min(value = 0, message = "Số lượng phải lớn hơn hoặc bằng 0")
    private Integer quantityInStock;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
    @Digits(integer = 8, fraction = 2, message = "Giá phải có tối đa 8 chữ số nguyên và 2 chữ số thập phân")
    private BigDecimal price;
}

package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePartRequest {
    
    @NotBlank(message = "Tên phụ tùng không được để trống")
    @Size(min = 3, max = 255, message = "Tên phụ tùng phải từ 3 đến 255 ký tự")
    private String partName;
    
    @NotBlank(message = "Mã SKU không được để trống")
    @Size(min = 5, max = 100, message = "Mã SKU phải từ 5 đến 100 ký tự")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Mã SKU chỉ chứa chữ cái in hoa, số và dấu gạch ngang")
    private String sku;
    
    private String description;
    
    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Min(value = 0, message = "Số lượng phải lớn hơn hoặc bằng 0")
    private Integer quantityInStock;
    
    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
    @Digits(integer = 8, fraction = 2, message = "Giá phải có tối đa 8 chữ số nguyên và 2 chữ số thập phân")
    private BigDecimal price;
}

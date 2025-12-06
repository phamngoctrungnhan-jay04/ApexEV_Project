package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsePartRequest {
    @NotNull(message = "ID phụ tùng không được để trống")
    private Long partId;

    @NotNull(message = "ID service order item không được để trống")
    private Long serviceOrderItemId;

    @NotNull(message = "Số lượng sử dụng không được để trống")
    @Min(value = 1, message = "Số lượng sử dụng phải lớn hơn 0")
    private Integer quantityUsed;

    private String notes; // Ghi chú bổ sung
}

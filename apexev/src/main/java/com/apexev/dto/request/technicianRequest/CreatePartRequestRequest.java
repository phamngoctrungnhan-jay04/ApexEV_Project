package com.apexev.dto.request.technicianRequest;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePartRequestRequest {

    @NotNull(message = "Service Order ID không được để trống")
    private Long serviceOrderId;

    @NotNull(message = "Part ID không được để trống")
    private Long partId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;

    private String urgency; // URGENT, NORMAL, LOW

    private String notes;
}

package com.apexev.dto.request.technicianRequest;

import com.apexev.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateWorkStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private OrderStatus newStatus;
}

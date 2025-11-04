package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RescheduleAppointmentRequest {
    @NotNull(message = "Thời gian hẹn mới không được để trống")
    @Future(message = "Thời gian hẹn mới phải ở trong tương lai")
    private LocalDateTime newAppointmentTime;
}

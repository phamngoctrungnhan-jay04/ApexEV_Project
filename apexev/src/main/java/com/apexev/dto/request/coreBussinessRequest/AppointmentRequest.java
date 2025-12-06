
package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class AppointmentRequest {
    @NotNull(message = "Bạn phải chọn một chiếc xe")
    private Long vehicleId; // Xe nào sẽ được bảo dưỡng?

    @NotNull(message = "Thời gian hẹn không được để trống")
    @Future(message = "Thời gian hẹn phải ở trong tương lai") // kiểm soát thời gian
    private LocalDateTime appointmentTime;

    private String requestedService;
    private String notes; // "Tôi sẽ đến sau 9h" kiểu kiểu vậy

    // Thêm trường nhận danh sách dịch vụ từ FE
    @com.fasterxml.jackson.annotation.JsonProperty("serviceIds")
    private java.util.List<Integer> serviceIds;
}

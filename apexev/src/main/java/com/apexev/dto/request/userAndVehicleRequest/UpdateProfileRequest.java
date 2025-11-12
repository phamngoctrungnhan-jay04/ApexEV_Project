package com.apexev.dto.request.userAndVehicleRequest;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotEmpty(message = "Họ tên không được để trống")
    private String fullName;

    @NotEmpty(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotEmpty(message = "Số điện thoại không được để trống")
    private String phone;
}

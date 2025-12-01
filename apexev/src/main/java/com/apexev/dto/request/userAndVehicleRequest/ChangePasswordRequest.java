package com.apexev.dto.request.userAndVehicleRequest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Mật khẩu cũ không được để trống")
    private String oldPassword;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 128, message = "Mật khẩu mới phải từ 6 đến 128 ký tự")
    private String newPassword;
}
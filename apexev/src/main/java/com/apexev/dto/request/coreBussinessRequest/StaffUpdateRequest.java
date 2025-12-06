package com.apexev.dto.request.coreBussinessRequest;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
@Data
public class StaffUpdateRequest {
    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String email;

    @Pattern(regexp = "^[0-9]{10,12}$", message = "Số điện thoại phải là số, từ 10 đến 12 chữ số")
    private String phone;

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ và tên không được vượt quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Mã nhân viên không được để trống")
    @Size(max = 50, message = "Mã nhân viên không được vượt quá 50 ký tự")
    private String employeeCode;

    @NotNull(message = "Ngày vào làm không được để trống")
    @PastOrPresent(message = "Ngày vào làm phải là một ngày trong quá khứ hoặc hiện tại")
    private LocalDate hireDate;
}
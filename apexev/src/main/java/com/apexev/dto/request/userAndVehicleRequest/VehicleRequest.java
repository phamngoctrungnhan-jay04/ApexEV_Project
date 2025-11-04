package com.apexev.dto.request.userAndVehicleRequest;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VehicleRequest {
    @NotEmpty(message = "Biển số xe không được để trống")
    private String licensePlate;
    @NotEmpty(message = "Hãng xe không được để trống")
    private String brand;

    @NotEmpty(message = "Mẫu xe không được để trống")
    private String model;

    @NotNull(message = "Năm sản xuất không được để trống")
    private Integer yearManufactured;

    @Size(min = 17, max = 17, message = "Số VIN phải có 17 ký tự")
    private String vinNumber; // Không bắt buộc


    //giải thích logic
    /*
    1. khách hàng lần đầu dùng ứng dụng -> chỉ cần điền những thông tin cơ bản như biển số, brand, mẫu xe và năm sản xuất
    2. khi khách hàng đem xe đến bảo dưỡng -> cố vấn dịch vụ sẽ đối chiếu biển số và số khung sau đó sẽ cập nhật cho khách hàng
     */
}

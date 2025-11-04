package com.apexev.dto.response.userAndVehicleResponse;

import lombok.Data;

@Data
public class VehicleResponse {
    private Long id;
    private String licensePlate;
    private String brand;
    private String model;
    private Integer yearManufactured;
    private String vinNumber; // Sẽ hiển thị (có thể là null)

    private Integer customerId;
}

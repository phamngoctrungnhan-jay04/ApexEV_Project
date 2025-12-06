package com.apexev.service.service_Interface;

import com.apexev.dto.request.userAndVehicleRequest.VehicleRequest;
import com.apexev.dto.response.userAndVehicleResponse.VehicleResponse;
import com.apexev.entity.User;

import java.util.List;

public interface VehicleService {
    List<VehicleResponse> getMyVehicles(User loggedInUser);

    VehicleResponse getVehicleById(Long vehicleId, User loggedInUser);

    VehicleResponse addVehicle(VehicleRequest request, User loggedInUser);

    VehicleResponse updateVehicle(Long vehicleId, VehicleRequest request, User loggedInUser);

    void deleteVehicle(Long vehicleId, User loggedInUser);
}

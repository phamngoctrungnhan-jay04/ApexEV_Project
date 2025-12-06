package com.apexev.controller.userAndVehicleController;

import com.apexev.dto.request.userAndVehicleRequest.VehicleRequest;
import com.apexev.dto.response.userAndVehicleResponse.VehicleResponse;
import com.apexev.entity.User;
import com.apexev.service.service_Interface.VehicleService;

import com.apexev.service.serviceImpl.VehicleServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class VehicleController {
    private final VehicleServiceImpl vehicleService;

    //thêm xe mới vào gara
    @PostMapping("/createVehicle")
    public ResponseEntity<VehicleResponse> addVehicle (
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal User loggedInUser
            ) {
        VehicleResponse newVehicle = vehicleService.addVehicle(request, loggedInUser);
        return new ResponseEntity<>(newVehicle, HttpStatus.CREATED);
    }

    // customer lấy danh sách xe của họ
    @GetMapping("/my-vehicles")
    public ResponseEntity<List<VehicleResponse>> getMyVehicles (
            @AuthenticationPrincipal User loggedInUser
    ) {
        List<VehicleResponse> vehicles = vehicleService.getMyVehicles(loggedInUser);
        return ResponseEntity.ok(vehicles);
    }

    // cập nhật thông tin xe
    @PutMapping("/update/{id}")
    public ResponseEntity<VehicleResponse> updateVehicle (
            @PathVariable("id") Long vehicleId,
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal User loggedInUser
    ) {
        VehicleResponse updatedVehicle = vehicleService.updateVehicle(vehicleId, request, loggedInUser);
        return ResponseEntity.ok(updatedVehicle);
    }

    // xóa xe
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteVehicle (
            @PathVariable("id") Long vehicleId,
            @AuthenticationPrincipal User loggedInUser
    ) {
        vehicleService.deleteVehicle(vehicleId, loggedInUser);
        return ResponseEntity.noContent().build();
    }

    //lấy chi tiết xe
    @GetMapping("{id}")
    public ResponseEntity<VehicleResponse> getVehicleById (
            @PathVariable("id") Long vehicleId,
            @AuthenticationPrincipal User loggedInUser
    ) {
        VehicleResponse vehicle = vehicleService.getVehicleById(vehicleId, loggedInUser);
        return ResponseEntity.ok(vehicle);
    }
}

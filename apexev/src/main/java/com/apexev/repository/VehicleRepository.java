package com.apexev.repository;

import com.apexev.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    // Tìm xe theo ID của khách hàng
    List<Vehicle> findByCustomerUserId(Long customerId);
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    Optional<Vehicle> findByVinNumber(String vinNumber);
}

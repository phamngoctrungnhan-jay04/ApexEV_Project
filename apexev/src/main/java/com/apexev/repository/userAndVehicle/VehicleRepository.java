package com.apexev.repository.userAndVehicle;

import com.apexev.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    // Tìm xe theo ID của khách hàng
    // lấy tất cả xe của 1 khách hàng
    List<Vehicle> findByCustomerUserId(Integer customerId);

    // lấy xe theo biển số
    Optional<Vehicle> findByLicensePlate(String licensePlate);

    // lấy xe theo số khung
    Optional<Vehicle> findByVinNumber(String vinNumber);

    // Xóa tất cả xe của 1 khách hàng
    void deleteByCustomerUserId(Integer customerId);
    //lấy tất cả xe của 1 khách hàng
    List<Vehicle> findByCustomerUserId(Integer customerId);
    //lấy xe theo biển số
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    //lấy xe theo số khung
    Optional<Vehicle> findByVinNumber(String vinNumber);

}

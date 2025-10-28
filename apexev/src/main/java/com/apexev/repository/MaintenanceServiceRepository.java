package com.apexev.repository;

import com.apexev.entity.MaintenanceService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceServiceRepository extends JpaRepository<MaintenanceService, Long> {
    // (Admin sẽ dùng cái này để CRUD)
}

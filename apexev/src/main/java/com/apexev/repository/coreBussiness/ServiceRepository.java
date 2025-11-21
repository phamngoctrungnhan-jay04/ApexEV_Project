package com.apexev.repository.coreBussiness;

import com.apexev.entity.MaintenanceService; // Sử dụng Entity chuẩn
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
// Kế thừa JpaRepository với Entity MaintenanceService và khóa chính Long
public interface ServiceRepository extends JpaRepository<MaintenanceService, Long> {
}